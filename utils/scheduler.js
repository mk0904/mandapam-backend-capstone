const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendEventReminder, sendWeeklyReminder } = require('./email');

const prisma = new PrismaClient();

// Schedule reminders for upcoming events
const scheduleReminders = () => {
  // Daily check for upcoming events (runs at 9 AM every day)
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Get bookings for tomorrow
      const tomorrowBookings = await prisma.booking.findMany({
        where: {
          eventDate: {
            gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
            lt: new Date(tomorrow.setHours(23, 59, 59, 999))
          },
          status: 'CONFIRMED'
        },
        include: {
          user: true,
          venue: true
        }
      });

      // Get bookings for next week
      const weeklyBookings = await prisma.booking.findMany({
        where: {
          eventDate: {
            gte: new Date(nextWeek.setHours(0, 0, 0, 0)),
            lt: new Date(nextWeek.setHours(23, 59, 59, 999))
          },
          status: 'CONFIRMED'
        },
        include: {
          user: true,
          venue: true
        }
      });

      // Send reminders
      for (const booking of tomorrowBookings) {
        await sendEventReminder(booking.user.email, {
          venueName: booking.venue.name,
          eventDate: booking.eventDate,
          guestCount: booking.guestCount
        });
      }

      for (const booking of weeklyBookings) {
        await sendWeeklyReminder(booking.user.email, {
          venueName: booking.venue.name,
          eventDate: booking.eventDate,
          guestCount: booking.guestCount
        });
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
};

module.exports = {
  scheduleReminders
};