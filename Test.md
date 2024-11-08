# Register new user
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "test_user",
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "phone": "1234567890"
}'

# Login (use these credentials)
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@example.com",
  "password": "admin123"
}'


# VENUE ENDPOINTS

# Get all venues
curl http://localhost:3000/api/venues

# Get venue by ID
curl http://localhost:3000/api/venues/1

# Create new venue (requires admin token)
curl -X POST http://localhost:3000/api/venues \
-H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "New Venue",
  "location": "City Center",
  "capacity": 200,
  "pricePerDay": 2500.00,
  "description": "Modern venue space",
  "vendorId": 1,
  "amenities": ["Parking", "WiFi"],
  "images": ["https://example.com/venue3.jpg"]
}'


# BOOKING ENDPOINTS

# Create booking (requires user token)
curl -X POST http://localhost:3000/api/bookings \
-H "Authorization: Bearer YOUR_USER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "venueId": 1,
  "eventDate": "2024-04-15",
  "guestCount": 300
}'

# Get user's bookings
curl http://localhost:3000/api/bookings/my-bookings \
-H "Authorization: Bearer YOUR_USER_TOKEN"

# Cancel booking
curl -X PATCH http://localhost:3000/api/bookings/1/cancel \
-H "Authorization: Bearer YOUR_USER_TOKEN"


# VENDOR ENDPOINTS

# Get all vendors
curl http://localhost:3000/api/vendors

# Get vendor by ID
curl http://localhost:3000/api/vendors/1

# Create new vendor (requires admin token)
curl -X POST http://localhost:3000/api/vendors \
-H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "New Vendor",
  "phone": "5550001122",
  "email": "new@vendor.com",
  "address": "789 Business St",
  "description": "Professional event management"
}'
