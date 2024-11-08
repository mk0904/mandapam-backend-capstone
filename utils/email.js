const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Booking Confirmation - Mandapam',
    html: `
      <h1>Your Booking is Confirmed!</h1>
      <p>Dear Guest,</p>
      <p>Your venue booking has been confirmed. Here are the details:</p>
      <ul>
        <li>Venue: ${bookingDetails.venueName}</li>
        <li>Date: ${bookingDetails.eventDate}</li>
        <li>Guest Count: ${bookingDetails.guestCount}</li>
        <li>Total Price: ₹${bookingDetails.totalPrice}</li>
      </ul>
      <p>Thank you for choosing Mandapam!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendEventReminder = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Event Reminder - Mandapam',
    html: `
      <h1>Event Reminder</h1>
      <p>Dear Guest,</p>
      <p>This is a reminder for your upcoming event:</p>
      <ul>
        <li>Venue: ${bookingDetails.venueName}</li>
        <li>Date: ${bookingDetails.eventDate}</li>
        <li>Guest Count: ${bookingDetails.guestCount}</li>
      </ul>
      <p>We look forward to hosting your event!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
};

const sendWeeklyReminder = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'One Week to Go! - Mandapam',
    html: `
      <h1>One Week Until Your Event!</h1>
      <p>Dear Guest,</p>
      <p>Your event is coming up in one week! Here are the details:</p>
      <ul>
        <li>Venue: ${bookingDetails.venueName}</li>
        <li>Date: ${bookingDetails.eventDate}</li>
        <li>Guest Count: ${bookingDetails.guestCount}</li>
      </ul>
      <p>Need to make changes? Contact us immediately!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Weekly reminder sent successfully');
  } catch (error) {
    console.error('Error sending weekly reminder:', error);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendEventReminder,
  sendWeeklyReminder,
};