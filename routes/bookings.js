const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../utils/email');

const prisma = new PrismaClient();

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { venueId, eventDate, guestCount } = req.body;
    const userId = req.user.id;

    // Check if venue is available on the given date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        venueId,
        eventDate: new Date(eventDate),
        NOT: {
          status: 'CANCELLED'
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Venue is not available on this date' });
    }

    // Get venue details for price calculation
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Calculate total price
    const totalPrice = parseFloat(venue.pricePerDay);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        venueId,
        eventDate: new Date(eventDate),
        guestCount,
        totalPrice,
        status: 'PENDING'
      },
      include: {
        venue: true,
        user: true
      }
    });

    // Send confirmation email
    await sendBookingConfirmation(booking.user.email, {
      venueName: booking.venue.name,
      eventDate: booking.eventDate,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        venue: {
          include: {
            vendor: true
          }
        }
      },
      orderBy: {
        eventDate: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'CANCELLED' }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router;