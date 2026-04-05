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
    npx prisma migrate dev
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
All endpoints return a consistent JSON envelope: `{ "message": string, "data": object | array | null }`. 
Protected routes require the `Authorization` header formatted as: `Bearer <token>`.

### 0. Authentication Workflow
*   **POST** `/api/auth/register` - Register a new user.
*   **POST** `/api/auth/login` - Authenticate and receive a JWT.
*   **POST** `/api/auth/logout` - Invalidate the current session token (server-side blacklist). Protected.
*   **GET** `/api/auth/:id` - Retrieve user profile. Protected (Owner/Admin).

**Expected Request Format (Register):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secure123",
  "phone_number": "03001234567"
}
```
**Example Response (Login/Register):**
```json
{
  "message": "User logged in successfully",
  "data": {
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "CUSTOMER" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

**1. Table Reservation & Pre-Order Workflow**
 * **GET** `/api/reservations` - List reservations (Filtered by Role).
 * **GET** `/api/reservations/:id` - Detailed view of a specific booking.
 * **POST** `/api/reservations` - Create a reservation.
 * **PUT** `/api/reservations/:id` - Update details.
 * **DELETE** `/api/reservations/:id` - Cancel reservation.

 **Logic Note:** Includes **Table Collision Validation**. The system automatically blocks bookings for the same table within a 2-hour window.


**Expected Request Format (POST / PUT):**
```json
{
  "tableId": 1,
  "datetime": "2026-04-10T19:00:00.000Z",
  "preOrders":[
    { "dishId": 2, "quantity": 2 }
  ]
}
```
**Example Response (POST):**
```json
{
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "tableId": 1,
    "datetime": "2026-04-10T19:00:00.000Z",
    "total": 45.99,
    "dishes": [...]
  }
}
```

---

### 2. Online Ordering Workflow (Delivery & Takeaway)
*   **GET** `/api/orders` - View order history. Protected (Owner/Admin).
*   **POST** `/api/orders` - Place a new order. Protected (Customer).
*   **PUT** `/api/orders/:id` - Modify an order. Protected (Owner/Admin, only if PENDING).
*   **PATCH** `/api/orders/:id/status` - Transition fulfillment status. Protected (Admin only).
*   **DELETE** `/api/orders/:id` - Cancel order. Protected (Owner/Admin).

**Logic Note:** Implements **Status Transition Guards**. Orders follow a strict fulfillment lifecycle (PENDING -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED) and cannot move backward or be edited once preparation begins.


**Expected Request Format (POST):**
```json
{
  "location": "123 Main Street",
  "type": "DELIVERY",
  "paymentMethod": "ONLINE",
  "items":[
    { "dishId": 1, "quantity": 1 }
  ]
}
```
**Expected Request Format (PATCH Status):**
```json
{
  "status": "PREPARING"
}
```
**Example Response:**
```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": 10,
    "total": 15.99,
    "status": "PREPARING",
    "type": "DELIVERY"
  }
}
```

---

### 3. Catering & Event Booking Workflow
*   **GET** `/api/caterings` - List all event bookings. Protected (Owner/Admin).
*   **POST** `/api/caterings` - Submit event request. Protected (Customer).
*   **PUT** `/api/caterings/:id` - Update details/guest count. Protected (Owner/Admin).
*   **PATCH** `/api/caterings/:id/status` - Approve/Reject booking. Protected (Admin only).
*   **DELETE** `/api/caterings/:id` - Remove booking. Protected (Owner/Admin).

**Expected Request Format (POST):**
```json
{
  "eventName": "Annual Gala",
  "guestCount": 100,
  "location": "Grand Ballroom",
  "datetime": "2026-05-20T19:00:00.000Z",
  "menuItemIds": [1, 3, 5]
}
```
**Example Response:**
```json
{
  "message": "Catering request submitted successfully",
  "data": {
    "id": 5,
    "eventName": "Annual Gala",
    "guestCount": 100,
    "total": 4500.00,
    "status": "PENDING"
  }
}
```

---

### 4. Menu Management (Admin API)
*   **GET** `/api/dishes` - Browse the menu. Public.
*   **POST** `/api/dishes` - Add new dish. Protected (Admin only).
*   **PUT** `/api/dishes/:id` - Edit dish price/details. Protected (Admin only).
*   **DELETE** `/api/dishes/:id` - Remove dish. Protected (Admin only).

**Expected Request Format (POST / PUT):**
```json
{
  "name": "Truffle Pasta",
  "price": 24.50,
  "cuisine": "Italian",
  "category": "Mains"
}
```
**Example Response:**
```json
{
  "message": "Menu retrieved successfully",
  "data":[
    { "id": 1, "name": "Truffle Pasta", "price": 24.50, "category": "Mains" }
  ]
}
```
