import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValuestorService } from '../services/valuestor.service';
import { UserValuesSchema } from '@valuestor/shared';
import Redis from 'ioredis';

const router = Router();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const valuestorService = new ValuestorService(redis);

// Create valuestor profile
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const address = req.user!.address;

    // Validate values
    const values = UserValuesSchema.parse(req.body);

    const valuestor = await valuestorService.createValuestor(
      userId,
      address,
      values
    );

    return res.json(valuestor);
  } catch (error: any) {
    console.error('Create valuestor error:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Get valuestor profile
router.get('/:address', async (req, res) => {
  try {
    const valuestor = await valuestorService.getValuestor(req.params.address);

    if (!valuestor) {
      return res.status(404).json({ error: 'Valuestor not found' });
    }

    return res.json(valuestor);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Update valuestor values
router.put('/:address', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.params.address.toLowerCase() !== req.user!.address.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const values = UserValuesSchema.partial().parse(req.body);

    const valuestor = await valuestorService.updateValuestor(
      req.params.address,
      values
    );

    return res.json(valuestor);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Get positions
router.get('/:address/positions', async (req, res) => {
  try {
    const positions = await valuestorService.getPositions(req.params.address);
    return res.json(positions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get trade history
router.get('/:address/trades', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const trades = await valuestorService.getTrades(req.params.address, limit);
    return res.json(trades);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get AI decisions
router.get('/:address/decisions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const decisions = await valuestorService.getDecisions(
      req.params.address,
      limit
    );
    return res.json(decisions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
