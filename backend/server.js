import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { seedInitialData } from './config/seedAdmin.js';

import bookingRoutes from './routes/bookingRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const origins = [...new Set([...allowedOrigins, ...defaultOrigins])];

    if (origins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let databaseInitialization;

async function ensureDatabase() {
  if (!databaseInitialization) {
    databaseInitialization = (async () => {
      const connected = await connectDB();

      if (!connected) {
        throw new Error('MongoDB connection failed');
      }

      await seedInitialData();
    })().catch((error) => {
      databaseInitialization = null;
      throw error;
    });
  }

  return databaseInitialization;
}

app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    console.error('Database initialization error:', error);

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
    });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', generalApiLimiter);

app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    brand: 'EVOKE GARAGE',
    service: 'Automotive Atelier Booking & Product Management API',
    version: '2.0.0',
    status: 'Active',
    endpoints: {
      publicBookings: 'POST /api/bookings',
      publicProducts: 'GET /api/products',
      adminAuth: 'POST /api/admin/login',
      adminProducts: '/api/admin/products',
      adminBookings: '/api/admin/bookings',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`EVOKE GARAGE Backend running on port ${PORT}`);
  });
}

export default app;