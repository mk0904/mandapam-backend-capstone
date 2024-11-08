const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const rateLimiter = (() => {
  const requests = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100;

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const userRequests = requests.get(ip) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({ 
        message: 'Too many requests, please try again later' 
      });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);
    next();
  };
})();

const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  next(err);
};

const validateBookingData = async (req, res, next) => {
  const { venueId, eventDate, guestCount } = req.body;

  if (!venueId || !eventDate || !guestCount) {
    return res.status(400).json({ 
      message: 'Missing required booking information' 
    });
  }

  try {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    if (guestCount > venue.capacity) {
      return res.status(400).json({ 
        message: `Guest count exceeds venue capacity of ${venue.capacity}` 
      });
    }

    const bookingDate = new Date(eventDate);
    if (bookingDate < new Date()) {
      return res.status(400).json({ 
        message: 'Cannot book dates in the past' 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  rateLimiter,
  errorLogger,
  validateBookingData,
};