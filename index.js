require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { scheduleReminders } = require('./utils/scheduler');
const { rateLimiter, errorLogger } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const vendorRoutes = require('./routes/vendors');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendors', vendorRoutes);

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    version: process.env.npm_package_version
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    // Start the reminder scheduler
    scheduleReminders();
    console.log('Reminder scheduler initialized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();