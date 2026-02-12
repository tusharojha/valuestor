import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Get nonce for wallet signature
router.post('/nonce', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { address: address.toLowerCase() },
      });
    }

    return res.json({ nonce: user.nonce });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Verify signature and create session
router.post('/verify', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature required' });
    }

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify signature
    const message = `Sign this message to authenticate with Valuestor.\n\nNonce: ${user.nonce}`;

    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Update nonce
    await prisma.user.update({
      where: { id: user.id },
      data: { nonce: Math.random().toString(36).substring(2) },
    });

    // Create session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return res.json({
      token: session.token,
      user: {
        id: user.id,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await prisma.session.delete({
        where: { token },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: true }); // Always succeed
  }
});

export default router;
