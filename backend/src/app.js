const express = require('express');
const cors = require('cors');
const path = require('path');
const { uploadsDir } = require('./middleware/uploadMiddleware');

const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const formFieldRoutes = require('./routes/formFieldRoutes');
const responseRoutes = require('./routes/responseRoutes');
const publicRoutes = require('./routes/publicRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (images, documents)
app.use('/uploads', express.static(uploadsDir));

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    message: 'Backend server is running smoothly'
  });
});

// Shortcut alias for health-check
app.get('/health', (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    message: 'Backend server is running smoothly'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/forms', formFieldRoutes);
app.use('/api/forms', responseRoutes);
app.use('/api/public', publicRoutes);

// 404 fallback handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    data: null,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;
