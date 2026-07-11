# Restaurant Reservation Management System

A full-stack reservation system supporting customer bookings and admin oversight, built as a take-home assignment for the Vibe Coding Intern role at Fission Infotech.

**Live app:** PASTE_YOUR_VERCEL_FRONTEND_URL
**Live API:** PASTE_YOUR_RENDER_BACKEND_URL
**Demo credentials:**
- Admin: `admin@demo.com` / `admin123`
- Customer: `customer@demo.com` / `customer123`

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas), Mongoose
- **Auth:** JWT, bcrypt for password hashing

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed            # seeds 6 tables + demo admin/customer accounts
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Assumptions Made

- Single restaurant, fixed set of 6 tables with varying capacity (2/4/6/8 seats)
- Fixed enumerated time slots rather than arbitrary start/end times: `12:00-13:30`, `13:30-15:00`, `19:00-20:30`, `20:30-22:00`
- A user can hold a `customer` or `admin` role; role is set at registration (in a production system this would be admin-assigned, not self-selected)
- Reservation dates are validated to not be in the past, but no upper bound on how far ahead someone can book

## Reservation & Availability Logic

**Why fixed time slots instead of arbitrary ranges:** arbitrary start/end times require overlap-interval math (does 18:30-20:00 conflict with 19:00-20:30?), which is easy to get subtly wrong. Fixed slots turn "is there a conflict?" into a simple existence check: does a confirmed reservation already exist for this exact (table, date, slot) combination?

**How double-booking is actually prevented:** rather than trusting a "check, then insert" pattern in application code — which has a race condition window where two simultaneous requests can both pass the check before either writes — the prevention is enforced at the database layer. A unique compound index on `(table, date, timeSlot)`, scoped to `status: 'confirmed'` via a partial filter, means MongoDB itself rejects a conflicting insert with a duplicate-key error. The API catches that error (code `11000`) and returns a `409 Conflict` with a clear message. Cancelling a reservation (soft delete via `status: 'cancelled'`) frees the slot for others, since the index only applies to confirmed bookings.

**Capacity validation** is a separate application-level check: a booking is rejected with `400` if `guests` exceeds the selected table's `capacity`.

## Role-Based Access (Customer vs Admin)

- JWT issued at login carries the user's id and role, signed with a server-side secret
- `authenticate` middleware verifies the token and loads the requesting user onto every protected request
- `authorize(...roles)` middleware checks the loaded user's role against an allowlist per route
- Customers can create reservations, view their own, and cancel only their own (ownership is checked explicitly, not just role)
- Admins can view all reservations (with date/status filters), update any reservation, and cancel any reservation
- Attempting to access an admin route with a customer token returns `403 Forbidden`; a missing/invalid token returns `401 Unauthorized`

## API Testing Evidence

See `/screenshots` for Postman evidence of: successful booking, double-booking rejection (409), capacity validation, admin vs customer access boundaries, and reservation cancellation. A full Postman collection is included at `/postman/Restaurant-Reservation-API.postman_collection.json` for direct import and testing against the live API.

## Known Limitations

- No email/SMS confirmation on booking
- No real-time updates — a customer could see a slot as available for a moment before someone else books it, and would only learn it's taken when their own request returns a conflict
- No pagination on admin reservation lists
- Single restaurant / single location only
- Role is self-selected at registration rather than admin-assigned

## Areas for Improvement With Additional Time

- Real-time table availability via WebSockets
- Waitlist functionality when a preferred slot is full
- Email/SMS confirmations and reminders
- Multi-restaurant / multi-branch support
- Pagination and search on admin views
- Automated test suite (Jest + Supertest) covering the conflict-prevention logic under concurrent requests
