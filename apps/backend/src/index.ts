import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';

// Routes
import authRoutes from './routes/auth.routes';
import valuestorRoutes from './routes/valuestor.routes';
import tokenRoutes from './routes/token.routes';

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.PORT || '3001');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ============================================================================
// Initialize Express
// ============================================================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// ============================================================================
// Middleware
// ============================================================================

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// Routes
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/valuestors', valuestorRoutes);
app.use('/api/tokens', tokenRoutes);

// ============================================================================
// WebSocket
// ============================================================================

const redis = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

// Subscribe to Redis channels for real-time updates
redisSub.subscribe('token:created', 'trade:executed', 'decision:made');

redisSub.on('message', (channel, message) => {
  try {
    const data = JSON.parse(message);

    switch (channel) {
      case 'token:created':
        io.emit('token:created', data);
        break;
      case 'trade:executed':
        // Send to specific user's room
        io.to(`valuestor:${data.valuestor}`).emit('trade:executed', data);
        break;
      case 'decision:made':
        io.to(`valuestor:${data.valuestor}`).emit('decision:made', data);
        break;
    }
  } catch (error) {
    console.error('Error processing Redis message:', error);
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join valuestor-specific room
  socket.on('subscribe:valuestor', (address: string) => {
    socket.join(`valuestor:${address}`);
    console.log(`Socket ${socket.id} subscribed to valuestor:${address}`);
  });

  socket.on('unsubscribe:valuestor', (address: string) => {
    socket.leave(`valuestor:${address}`);
    console.log(`Socket ${socket.id} unsubscribed from valuestor:${address}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============================================================================
// Error Handling
// ============================================================================

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
);

// ============================================================================
// Start Server
// ============================================================================

async function start() {
  try {
    // Test Redis connection
    await redis.ping();
    console.log('✓ Redis connected');

    // Start server
    httpServer.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('Valuestor Backend API');
      console.log('='.repeat(60));
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`WebSocket ready on ws://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('\nEndpoints:');
      console.log('  GET  /health');
      console.log('  POST /api/auth/nonce');
      console.log('  POST /api/auth/verify');
      console.log('  POST /api/valuestors');
      console.log('  GET  /api/valuestors/:address');
      console.log('  PUT  /api/valuestors/:address');
      console.log('  GET  /api/valuestors/:address/positions');
      console.log('  GET  /api/valuestors/:address/trades');
      console.log('  GET  /api/tokens');
      console.log('  GET  /api/tokens/:address');
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await redis.quit();
  await redisSub.quit();
  httpServer.close();
  process.exit(0);
});

start();
