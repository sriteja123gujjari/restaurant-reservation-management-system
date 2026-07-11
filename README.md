# Restaurant Reservation Management System

This project is a full-stack solution built for the **Vibe Coding Intern** assignment. It manages restaurant table bookings with a strong focus on data integrity, role-based security, and preventing the "double-booking" problem at the database level.

**Live Application:** https://restaurant-reservation-management-s-eta.vercel.app/

**Backend API:** https://restaurant-reservation-management-system-j087.onrender.com

> **Note:** The backend is deployed on Render's free tier. The first request after a period of inactivity may take **30–50 seconds** while the server wakes up.

---

## Quick Start

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm start
# or
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend

```bash
npm run dev
```

## Demo Credentials

**Admin**

```
Email: admin@demo.com
Password: admin123
```

**Customer**

```
Email: customer@demo.com
Password: customer123
```

---

# API Testing Evidence

The API was manually tested using **Postman**. Below are representative test cases demonstrating validation, authorization, conflict detection, and successful operations.

| Test Case | Description | Screenshot |
|------------|-------------|------------|
| **Successful Request** | Reservation/API request completed successfully (**200 OK**). | ![Success](./screenshots/Screenshot%202026-07-11%20210524.png) |
| **Input Validation** | Invalid request data rejected (**400 Bad Request**). | ![400](./screenshots/Screenshot%202026-07-11%20205738.png) |
| **Reservation Conflict** | Attempt to reserve an already-booked table/time slot rejected (**409 Conflict**). | ![409](./screenshots/Screenshot%202026-07-11%20172446.png) |
| **Role-Based Access Control** | Customer attempted to access an administrator-only endpoint (**403 Forbidden**). | ![403](./screenshots/Screenshot%202026-07-11%20210744.png) |
| **Additional Authorization Test** | Another admin-protected endpoint tested with insufficient permissions (**403 Forbidden**). | ![403](./screenshots/Screenshot%202026-07-11%20212311.png) |

**Postman Collection**

The complete Postman collection is included inside the **`/postman`** folder and can be imported directly into Postman.

---

# Tech Stack

### Frontend

- React.js
- React Router
- Axios

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Tokens)
- bcryptjs

---

# Technical Deep Dive: Preventing Double Booking

A reservation system must guarantee that two customers cannot reserve the same table for the same date and time slot.

Instead of relying solely on application logic ("check then insert"), I enforced this rule directly in MongoDB using a **Unique Compound Index**.

```javascript
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "confirmed",
    },
  }
);
```

## Why this approach?

- Guarantees only one confirmed reservation per table, date and slot.
- Eliminates race conditions during concurrent requests.
- MongoDB rejects duplicate inserts with error **11000**.
- The API converts this into a **409 Conflict** response.
- Cancelled reservations automatically free the slot because of the partial index.

---

# Role-Based Access Control (RBAC)

## Customer

- View available tables
- Create reservations
- Cancel only their own reservations

Ownership validation is enforced on the backend.

## Administrator

- View every reservation
- Filter reservations
- Update reservations
- Cancel any reservation

---

# Assumptions

- Four fixed reservation time slots.
- Single restaurant location.
- Six predefined tables.
- Table capacity must be greater than or equal to guest count.
- Admin accounts are created for demonstration purposes.

---

# Known Limitations & Future Improvements

- Real-time availability using Socket.io.
- Email confirmations and reminders.
- Server-side pagination.
- Admin table management UI.
- Automated integration tests using Jest.

---

# Author

**Sriteja**
