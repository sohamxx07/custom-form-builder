const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const formFieldRoutes = require('./routes/formFieldRoutes');
const responseRoutes = require('./routes/responseRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

module.exports = app;
