const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

const app = express();

const normalizeOrigin = (value) => value.trim().replace(/\/$/, '');
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

// ─── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const envAllowedOrigins = (process.env.FRONTEND_URLS || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const allowedOrigins = [...envAllowedOrigins, ...defaultAllowedOrigins].map(
        normalizeOrigin
      );
      const requestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      // Deny disallowed origins without throwing server errors.
      return callback(null, false);
    },
    credentials: true,
  })
);

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Manage My Campus API is running' });
});

// ─── Connect to MongoDB & Start Server ─────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
