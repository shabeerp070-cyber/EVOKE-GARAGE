import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedInitialData } from './config/seedAdmin.js';
import bookingRoutes from './routes/bookingRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

// Load environment variables from backend/.env or root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to root .env if present

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB Atlas & seed initial admin/products if needed
connectDB().then((connected) => {
  if (connected) {
    seedInitialData();
  }
});

// ============================================================================
// 1. CORS CONFIGURATION
// ============================================================================
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

const corsOptions = {
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
};

app.use(cors(corsOptions));

// ============================================================================
// 2. STATIC ASSETS & PARSERS
// ============================================================================
// Serve uploaded product images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter across /api
app.use('/api', generalApiLimiter);

// ============================================================================
// 3. API ROUTES
// ============================================================================
// Customer Bookings API
app.use('/api/bookings', bookingRoutes);

// Public Car Parts Products API (Active products only)
app.use('/api/products', productRoutes);

// Protected Admin Management API (Admin login, Products CRUD, Bookings view)
app.use('/api/admin', adminRoutes);

// Root health & service directory probe
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

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================================
// 4. CENTRALIZED ERROR HANDLER
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 5. SERVER LAUNCH
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 [EVOKE GARAGE BACKEND] Server active on http://localhost:${PORT}`);
  console.log(`📍 [ENVIRONMENT]: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 [WHATSAPP DISPATCH NUMBER]: ${process.env.WHATSAPP_NUMBER || '911234567890'}`);
});

export default app;
