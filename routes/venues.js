const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all venues with filters
router.get('/', async (req, res) => {
  try {
    const { 
      location, 
      minCapacity, 
      maxPrice,
      date 
    } = req.query;

    let whereClause = {};

    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (minCapacity) {
      whereClause.capacity = {
        gte: parseInt(minCapacity)
      };
    }

    if (maxPrice) {
      whereClause.pricePerDay = {
        lte: parseFloat(maxPrice)
      };
    }

    // If date is provided, check availability
    if (date) {
      whereClause.bookings = {
        none: {
          eventDate: new Date(date),
          NOT: {
            status: 'CANCELLED'
          }
        }
      };
    }

    const venues = await prisma.venue.findMany({
      where: whereClause,
      include: {
        vendor: true,
        bookings: {
          where: {
            NOT: {
              status: 'CANCELLED'
            }
          }
        }
      }
    });

    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vendor: true,
        bookings: {
          where: {
            NOT: {
              status: 'CANCELLED'
            }
          }
        }
      }
    });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ message: 'Failed to fetch venue' });
  }
});

// Create new venue (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      location,
      capacity,
      pricePerDay,
      description,
      vendorId,
      amenities,
      images
    } = req.body;

    const venue = await prisma.venue.create({
      data: {
        name,
        location,
        capacity,
        pricePerDay,
        description,
        vendorId,
        amenities,
        images
      }
    });

    res.status(201).json(venue);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Failed to create venue' });
  }
});

module.exports = router;