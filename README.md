This project is a full-stack solution built for the **Vibe Coding Intern** assignment. It manages restaurant table bookings with a strong focus on data integrity, role-based security, and preventing the "double-booking" problem at the database level.

**Live Application:** [Insert Your Vercel/Netlify URL Here]**Backend API:** [Insert Your Render/Railway URL Here]

---

## Quick Start

### Backend Setup

1. `cd backend`

1. `npm install`

1. Create a `.env` file with your `MONGO_URI` and `JWT_SECRET`.

1. `npm run seed` (This seeds 6 tables with varying capacities and creates demo accounts).

1. `npm start` (or `npm run dev` for development).

### Frontend Setup

1. `cd frontend`

1. `npm install`

1. `npm run dev`

**Demo Credentials:**

- **Admin:** `admin@demo.com` / `admin123`

- **Customer:** `customer@demo.com` / `customer123`

---

## 📸 API Testing Evidence

To ensure the reliability of the system, I've thoroughly tested the core API endpoints using Postman. Below are some key test cases:

| Test Case | Description | Screenshot |
| --- | --- | --- |
| **Successful Booking** | Creating a reservation for an available table and slot. | ![Successful Booking](./screenshots/Screenshot%202026-07-11%20172446.png) |
| **Double-Booking Rejection** | Attempting to book a table that is already reserved (409 Conflict). | ![Conflict Rejection](./screenshots/Screenshot%2026-07-11-172446.png) |
| **Capacity Validation** | Rejection when guests exceed table capacity (400 Bad Request). | ![Capacity Rejection](./screenshots/Screenshot%202026-07-11%20205525.png) |
| **Admin Dashboard** | Viewing all reservations as an administrator. | ![Admin View](./screenshots/Screenshot%202026-07-11%20210524.png) |

*Full Postman collection is available in the **`/postman`** directory.*

## 🛠 Tech Stack

- **Frontend:** React.js (State management, role-specific routing)

- **Backend:** Node.js & Express (RESTful API design)

- **Database:** MongoDB & Mongoose (Schema design & indexing)

- **Auth:** JSON Web Tokens (JWT) & bcryptjs

---

## 🧠 Technical Deep Dive: The "Double-Booking" Solution

One of the biggest challenges in a reservation system is ensuring two people don't book the same table at the same time. Many developers try to solve this with a "check then insert" logic in the code, but that fails during high traffic due to race conditions.

I solved this by pushing the validation down to **MongoDB**. I implemented a **Unique Compound Index** with a partial filter:

```javascript
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'confirmed' } 
  }
);
```

**Why this works:**

- It ensures that for any given `table`, `date`, and `timeSlot`, there can only be one `confirmed` reservation.

- If two requests hit the server at the exact same millisecond, the database will reject the second one with a `11000` error.

- The API catches this error and returns a clean `409 Conflict` message to the user.

- Because it's a *partial* index, once a reservation is marked as `cancelled`, the slot is immediately freed up for others.

---

## Role-Based Access Control (RBAC)

The system distinguishes between **Customers** and **Administrators**:

- **Customers:** Can view available tables, create their own bookings, and cancel them. I've added an ownership check on the backend so a customer can't cancel someone else's booking even if they know the ID.

- **Administrators:** Have a dedicated dashboard to see all bookings across all dates. They can cancel or update any reservation and manage the restaurant's table configuration.

---

## Assumptions Made

- **Fixed Time Slots:** To keep the user experience predictable and avoid complex "overlapping time" math, I used four fixed 90-minute slots.

- **Single Restaurant:** The current version assumes a single-location setup.

- **Capacity Enforcement:** A booking is only allowed if the table's seating capacity is greater than or equal to the guest count.

---

## Known Limitations & Future Improvements

- **Real-time Updates:** Currently, users need to refresh to see if a slot was just taken. Adding WebSockets (Socket.io) would make the table map live.

- **Email Notifications:** I'd love to integrate SendGrid or Twilio to send automated confirmation codes and reminders.

- **Pagination:** For a real restaurant with thousands of bookings, the admin view would need server-side pagination to stay fast.

- **Testing:** I've manually tested the API via Postman (collection included), but adding automated Jest integration tests for the conflict logic is the next logical step.

---

##  Author

**[Sriteja]**Full-Stack Developer Intern Applicant
