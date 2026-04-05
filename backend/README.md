# Restaurant Management System - Backend API

This repository contains the backend implementation for the Restaurant Management System, developed as part of Milestone 3 for the Web-Based Application Development course. The system provides a robust API for managing table reservations, online food ordering, and catering event bookings, secured with JWT-based authentication and Role-Based Access Control (RBAC).

## Project Architecture
The backend follows a modular architecture to ensure separation of concerns and maintainability:
*   **Route Layer:** Defines API endpoints and applies security middleware.
*   **Controller Layer:** Handles incoming HTTP requests, validates inputs, and formats JSON responses.
*   **Service Layer:** Contains the core business logic and performs database operations via Prisma ORM.
*   **Database Layer:** Managed by PostgreSQL with a normalized schema for users, orders, and reservations.

---

## Local Setup Instructions

### Prerequisites
*   Node.js (v16 or higher)
*   PostgreSQL database instance
*   npm or yarn

### Installation
1.  Clone the repository to your local machine.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration
Create a `.env` file in the root directory and provide the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db?schema=public"
JWT_SECRET="your_secure_random_string_here"
```

### Database Initialization
1.  Generate the Prisma client:
    ```bash
    npx prisma generate
    ```
2.  Run migrations to create the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```
3.  Seed the database with initial test data (Users, Tables, Dishes):
    ```bash
    npx prisma db seed
    ```

### Running the Server
Start the development server with automatic reloading:
```bash
npm run dev
```
The API will be accessible at `http://localhost:3000`.

---

## API Documentation

### 0. Authentication Workflow
All protected routes require a Bearer Token in the `Authorization` header.

*   **POST** `/api/auth/register` - Register a new user and receive an auto-login token.
*   **POST** `/api/auth/login` - Authenticate and receive a JWT.
*   **POST** `/api/auth/logout` - Invalidate the current session token (server-side blacklist).
*   **GET** `/api/auth/:id` - Retrieve user profile (Owner or Admin only).

**Example Login Request:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

---

### 1. Table Reservation & Pre-Order Workflow
Allows customers to book tables and optionally pre-order meals.

*   **GET** `/api/reservations` - List reservations (Admin sees all; Customer sees their own).
*   **POST** `/api/reservations` - Create a new reservation with optional pre-ordered dishes.
*   **PUT** `/api/reservations/:id` - Update reservation details or pre-orders (Owner or Admin only).
*   **DELETE** `/api/reservations/:id` - Cancel a reservation (Owner or Admin only).

**Example Create Reservation Payload:**
```json
{
  "tableId": 1,
  "datetime": "2026-04-10T19:00:00.000Z",
  "preOrders": [
    { "dishId": 2, "quantity": 2 }
  ]
}
```

---

### 2. Online Ordering Workflow (Delivery & Takeaway)
Handles the full lifecycle of a food delivery or takeaway order.

*   **GET** `/api/orders` - View order history (Filtered by ownership).
*   **POST** `/api/orders` - Place a new order with location, type, and payment method.
*   **PUT** `/api/orders/:id` - Modify an order (Only permitted if status is PENDING).
*   **PATCH** `/api/orders/:id/status` - Update the status of the order preparation and delivery (Admin only).
*   **DELETE** `/api/orders/:id` - Cancel an order.

**Example Response Envelope:**
```json
{
  "message": "Order placed successfully",
  "data": {
    "id": 10,
    "total": 45.99,
    "status": "PENDING",
    "type": "DELIVERY"
  }
}
```

---

### 3. Catering & Event Booking Workflow
Specific logic for high-volume event bookings with per-head pricing.

*   **GET** `/api/catering` - List all event bookings.
*   **POST** `/api/catering` - Submit a new event request with guest count and menu selection.
*   **PUT** `/api/catering/:id` - Update event details or guest count.
*   **PATCH** `/api/catering/:id/status` - Admin review: Approve or Reject a booking.
*   **DELETE** `/api/catering/:id` - Remove an event booking.

**Business Logic Note:** Total price is automatically calculated as `(Sum of selected Menu Item prices) * guestCount`.

---

### 4. Menu Management (Admin)
*   **GET** `/api/dishes` - Browse the menu (Public).
*   **POST** `/api/dishes` - Add new dish with category (Admin only).
*   **PUT** `/api/dishes/:id` - Edit dish price or details (Admin only).
*   **DELETE** `/api/dishes/:id` - Remove dish from menu (Admin only).
