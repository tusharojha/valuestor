import { Router } from 'express';
import { TokenService } from '../services/token.service';
import { RobinPumpClient } from '@valuestor/contracts';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { Address } from 'viem';

const router = Router();
const tokenService = new TokenService(
  process.env.BASE_RPC_URL || 'https://mainnet.base.org'
);

// Get all tokens
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      graduated:
        req.query.graduated === 'true'
          ? true
          : req.query.graduated === 'false'
          ? false
          : undefined,
      creator: req.query.creator as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await tokenService.getAllTokens(filters);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get token by address
router.get('/:address', async (req, res) => {
  try {
    const token = await tokenService.getToken(req.params.address);

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    return res.json(token);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get token trades
router.get('/:address/trades', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const trades = await tokenService.getTokenTrades(req.params.address, limit);
    return res.json(trades);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create token (launch on RobinPump)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, symbol, description, uri, category, tags, initialBuyETH } =
      req.body;

    if (!name || !symbol || !uri) {
      return res
        .status(400)
        .json({ error: 'Name, symbol, and URI are required' });
    }

    // This would need a wallet client
    // For now, return instructions
    return res.json({
      message: 'Token creation via API coming soon',
      instructions:
        'Please use the frontend to create tokens for now, or use the RobinPump contract directly',
      contractAddress: process.env.ROBINPUMP_FACTORY_ADDRESS,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
