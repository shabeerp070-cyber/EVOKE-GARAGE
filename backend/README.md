# EVOKE GARAGE — Full-Stack Automotive Atelier Platform

High-performance, luxury automotive restoration, booking, and car parts e-commerce platform built with Node.js, Express, MongoDB Atlas, and React 19.

---

## 🛠 Tech Stack

- **Backend:** Node.js (v18+) + Express.js 4 (ES Modules)
- **Database:** MongoDB Atlas + Mongoose 8
- **Authentication:** JWT (JSON Web Tokens) + BcryptJS Password Hashing
- **File Uploads:** Multer (Local disk storage in `backend/uploads/products/` with static asset delivery)
- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + GSAP
- **WhatsApp Integration:** Direct URL-encoded WhatsApp Business API dispatch with pre-filled orders and bookings

---

## 📁 System Architecture

```text
EVOKE_GARAGE/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB Atlas connection & error lifecycle
│   │   ├── multer.js             # Multer image storage & type validation (JPEG/PNG/WebP, max 5MB)
│   │   └── seedAdmin.js          # Auto-seeds default admin and sample parts if empty
│   ├── controllers/
│   │   ├── adminController.js    # Admin login, profile, customer bookings management
│   │   ├── bookingController.js  # Customer booking submission & WhatsApp payload generator
│   │   └── productController.js  # Public catalog & Admin CRUD operations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification (protectAdmin)
│   │   ├── errorHandler.js       # Centralized error handler
│   │   ├── rateLimiter.js        # Rate limiting to prevent abuse
│   │   └── validator.js          # Booking data validation & normalization
│   ├── models/
│   │   ├── Admin.js              # Admin credentials schema with Bcrypt hook
│   │   ├── Booking.js            # Customer booking schema
│   │   └── Product.js            # Car parts product schema
│   ├── routes/
│   │   ├── adminRoutes.js        # Protected administrative routes (/api/admin)
│   │   ├── bookingRoutes.js      # Public booking routes (/api/bookings)
│   │   └── productRoutes.js      # Public product routes (/api/products)
│   ├── tests/
│   │   └── api.test.js           # Unit & security test suite
│   ├── uploads/products/         # Uploaded product imagery storage
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   ├── README.md                 # Documentation
│   └── server.js                 # Express application entry point
├── frontend/                     # React 19 Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx    # Secure Admin Console (Products CRUD + Bookings management)
│   │   │   ├── PartsCatalog.jsx  # Public Car Parts Atelier with Buy via WhatsApp
│   │   │   ├── ServiceModal.jsx  # Booking popup form (connected to MongoDB)
│   │   │   └── ContactSection.jsx# Inline booking form (connected to MongoDB)
│   │   ├── services/
│   │   │   ├── adminApi.js       # Admin authentication & management client
│   │   │   ├── bookingApi.js     # Public booking API client
│   │   │   └── productApi.js     # Public products & WhatsApp buy generator
│   │   └── App.jsx               # Path-based routing (/admin vs /)
│   ├── vite.config.js            # Vite with /api and /uploads proxy to backend:5000
│   └── package.json
```

---

## ⚙️ Environment Configuration (`backend/.env`)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *(Windows: `copy .env.example .env`)*

3. Configure your variables:
   ```env
   # Server Port
   PORT=5000

   # Node Environment
   NODE_ENV=development

   # MongoDB Atlas Connection URI
   # Replace with your actual MongoDB connection string
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/evoke_garage?retryWrites=true&w=majority

   # JWT Master Signing Key for Admin Sessions
   JWT_SECRET=evoke_garage_atelier_master_jwt_secret_2026

   # Initial Administrator Credentials (seeded on first DB connection)
   ADMIN_USERNAME=admin
   ADMIN_EMAIL=admin@evokegarage.com
   ADMIN_PASSWORD=Evoke@Admin2026!

   # EVOKE GARAGE WhatsApp Business Number (country code + number, no + or spaces)
   WHATSAPP_NUMBER=911234567890

   # Allowed Frontend Origins (CORS)
   CLIENT_URL=http://localhost:3000,http://localhost:5173,http://localhost:4173
   ```

---

## 🚀 How to Run the Platform

### Terminal 1 — Start the Backend Server:
```bash
cd backend
npm run dev
```
*Backend active at `http://localhost:5000`.*

### Terminal 2 — Start the Frontend (Vite):
```bash
cd frontend
npm run dev
```
*Frontend active at `http://localhost:3000`.*

---

## 🔐 Administrative Access

- **Admin URL:** Navigate directly to `http://localhost:3000/admin` (or click `#admin`).
- **Default Credentials:**
  - **Username:** `admin` (or `admin@evokegarage.com`)
  - **Password:** `Evoke@Admin2026!`
- **Security Protections:**
  - Public customers browsing the website **never** see the admin portal or login links.
  - No customer login or registration exists.
  - Admin endpoints (`/api/admin/*`) require a valid Bearer JWT token.
  - Unauthorized requests are rejected with `401 Unauthorized`.
  - Passwords are encrypted using Bcrypt with 10 salt rounds.

### Admin Features:
1. **Car Parts Products Management:**
   - Add new car parts with name, category, price in INR (₹), stock availability, vehicle compatibility, description, and product image (drag-and-drop file upload or image URL).
   - Edit existing products with optional image replacement.
   - Delete products (automatically removes the listing and cleans up uploaded files).
   - Real-time catalog sync: Changes reflect immediately on the public website.
2. **Customer Bookings Management:**
   - View all customer appointment inquiries submitted through the website.
   - Filter by status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
   - Quick **"WhatsApp Reply"** button: Opens WhatsApp with an auto-drafted acknowledgment referencing the customer's vehicle and required service.
   - Delete booking records.

---

## 🛒 Public Customer Experience

1. **Parts & Performance Atelier (`#parts`):**
   - Seamlessly integrated into the public customer flow.
   - Displays all active car parts with images, prices, categories, and stock status.
   - Category filtering and real-time keyword search.
2. **BUY VIA WHATSAPP:**
   - Every product has a prominent **"BUY VIA WHATSAPP"** button.
   - Clicking opens WhatsApp with a pre-filled message:
     ```text
     *EVOKE GARAGE — CAR PART ORDER / INQUIRY*
     • Product: Inconel 625 Titanium Valvetronic Cat-Back Exhaust
     • Part Number: EVK-EXH-INC625
     • Price: ₹1,85,000 (INR)
     • Category: Exhaust & Downpipes
     • Availability: In Stock
     • Compatibility: Porsche 911 (992 GT3) / BMW M3 G80
     • Atelier: Ottapalam, Palakkad, Kerala

     Hello EVOKE GARAGE, I would like to order / check availability for this car part. Please confirm fitting and dispatch schedule.
     ```
   - The customer reviews and manually presses **Send** in WhatsApp.

---

## 📡 Complete API Reference

### Public Endpoints:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bookings` | Record customer booking consultation and return WhatsApp URL |
| `GET` | `/api/products` | Retrieve all active car parts (supports `?category=` and `?search=`) |
| `GET` | `/api/products/:id` | Get details for a single active car part |
| `GET` | `/api/bookings/health` | Service healthcheck |

### Protected Admin Endpoints (`Authorization: Bearer <token>` required):
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate admin and return 7-day JWT token |
| `GET` | `/api/admin/me` | Verify active admin session |
| `GET` | `/api/admin/products` | Retrieve all products (active and inactive) |
| `POST` | `/api/admin/products` | Create product (multipart/form-data with image upload) |
| `PUT` | `/api/admin/products/:id` | Update product (multipart/form-data with image upload) |
| `DELETE` | `/api/admin/products/:id` | Permanently delete product and remove uploaded image |
| `GET` | `/api/admin/bookings` | View all customer bookings from MongoDB |
| `PATCH` | `/api/admin/bookings/:id/status`| Update booking status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) |
| `DELETE` | `/api/admin/bookings/:id` | Delete booking record |
