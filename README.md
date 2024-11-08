# Mandapam - Venue Booking System

A simple venue booking system built with Node.js, Express, Prisma, and MySQL.

## Features

- User authentication (register/login)
- Venue listing with filters (location, capacity, price)
- Booking management
- Vendor management
- Email notifications
- Admin dashboard
- JWT-based authentication

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your MySQL database and update the `.env` file with your database URL.
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Venues
- GET /api/venues - Get all venues (with filters)
- GET /api/venues/:id - Get venue by ID
- POST /api/venues - Create new venue (Admin only)

### Bookings
- POST /api/bookings - Create new booking
- GET /api/bookings/my-bookings - Get user's bookings
- PATCH /api/bookings/:id/cancel - Cancel booking

### Vendors
- GET /api/vendors - Get all vendors
- GET /api/vendors/:id - Get vendor by ID
- POST /api/vendors - Create new vendor (Admin only)

## Environment Variables

Create a `.env` file with the following variables:
```
DATABASE_URL="mysql://user:password@localhost:3306/mandapam_db"
JWT_SECRET="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
```