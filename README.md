# 🚗 ParkPulse - MERN Smart Parking Management System

**ParkPulse** is a full-stack MERN (MongoDB, Express.js, React, Node.js) Smart Parking System designed to manage multi-level parking lots, automate slot allocation, monitor real-time occupancy, process vehicle entries & exits, and calculate automated parking fees with digital tickets and receipts.

---

## ✨ Features & Capabilities

- **Interactive Visual Parking Grid**:
  - Multi-level floor switcher:
    - **Level 1**: Priority & EV Bays (⚡ Fast Charging, ♿ Accessible/Disabled, 🏍️ Two-Wheelers)
    - **Level 2**: General & Compact Bays (🚗 Standard Sedans, 🚘 Compact bays)
    - **Level 3**: Premium & SUV Bays (🚙 Wide SUVs, 🌟 Rooftop Premium)
  - Color-coded live slots:
    - 🟢 **Available**
    - 🔴 **Occupied** (shows license plate, driver name, elapsed time, live accrued fee)
    - 🟡 **Reserved** (pre-booked for VIPs or upcoming guests)
    - ⚪ **Maintenance** (sensor calibration / resurfacing)
  - Real-time search and multi-criteria filters (by floor, status, vehicle category, slot code).

- **Automated Entry Gate (Check-In)**:
  - License plate entry with uppercase formatting.
  - Category support: Standard Cars, SUVs, Electric Vehicles (EV), Two-Wheelers, Priority/Accessible.
  - **Smart Slot Routing**: Automatically assigns the nearest optimal available slot for the vehicle type (e.g. routes EVs to fast charging bays, motorcycles to compact bays), or allows manual slot selection.
  - Instant digital parking token / entry ticket generation.

- **Automated Exit Gate & Billing (Check-Out)**:
  - Instant vehicle lookup by license plate or ticket number.
  - Automated calculation of elapsed duration (hours and minutes).
  - Rate engine: base hourly rate + flat EV charging fee (if used).
  - Multiple payment methods: Credit/Debit Card, UPI / QR, Cash, and FASTag/RFID.
  - Digital receipt generation with printable/downloadable kiosk layout.

- **Guest Reservation System**:
  - Pre-book slots with driver contact details and unique reservation tokens (`RES-XXXXXX`).
  - Seamless arrival check-in or cancellation.

- **Real-Time Analytics & Dashboard**:
  - Live capacity utilization and occupancy rate percentage.
  - Real-time revenue telemetry: Today's revenue and total accrued earnings.
  - Floor-by-floor occupancy comparison with visual progress bars.
  - Parked fleet distribution by vehicle category.
  - Live gate movements activity log (entry and exit feed).

- **Slot Administration**:
  - Provision new slots with customizable floor, type, hourly rates, and EV capabilities.
  - Toggle maintenance status on any empty slot.
  - Reset / re-seed demo data at any time with a single click.

- **Dual-Mode Database Architecture (Zero-Downtime Guarantee)**:
  - Connects to native **MongoDB** (`mongodb://127.0.0.1:27017/smart_parking` or MongoDB Atlas URI in `.env`).
  - If a MongoDB service is not currently running, it automatically switches to an **embedded resilient JSON persistence store** (`backend/data/parking_db.json`), allowing instant full-stack operation with zero configuration hurdles.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js (v20), Express.js, Mongoose 8, CORS, Morgan |
| **Database** | MongoDB / Mongoose with Resilient Embedded Storage fallback |
| **Tooling** | NPM, PostCSS, Autoprefixer |

---

## 📂 Project Structure

```text
smart-parking-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & status logic
│   ├── controllers/
│   │   ├── analyticsController.js # KPIs, floor breakdowns, logs
│   │   ├── parkingController.js   # Check-in, check-out, billing, reservations
│   │   └── slotController.js      # Slot CRUD and maintenance toggling
│   ├── data/
│   │   └── parking_db.json       # Resilient local JSON storage
│   ├── models/
│   │   ├── dbStore.js            # Universal DB repository layer
│   │   ├── SlotModel.js          # Mongoose Slot schema
│   │   └── TicketModel.js        # Mongoose Ticket schema
│   ├── routes/
│   │   ├── analyticsRoutes.js    # /api/analytics
│   │   ├── parkingRoutes.js      # /api/parking
│   │   └── slotRoutes.js         # /api/slots
│   ├── utils/
│   │   └── seedData.js           # 48-slot 3-floor facility seeder
│   ├── .env                      # Environment configuration
│   ├── package.json
│   └── server.js                 # Express server & static asset host
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddSlotModal.jsx       # Add new slot modal
│   │   │   ├── AnalyticsView.jsx     # Analytics & reports dashboard
│   │   │   ├── CheckInModal.jsx      # Entry gate modal
│   │   │   ├── CheckOutModal.jsx     # Exit gate billing modal
│   │   │   ├── Navbar.jsx            # App header with live status
│   │   │   ├── ParkingLotGrid.jsx    # Interactive parking bay grid
│   │   │   ├── ReservationModal.jsx  # Slot reservation modal
│   │   │   ├── SlotDetailModal.jsx   # Slot detail & actions modal
│   │   │   ├── TicketReceiptModal.jsx# Printable digital ticket/receipt
│   │   │   └── TicketsView.jsx       # Historical ticket log table
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client
│   │   ├── App.jsx                   # Main React app container
│   │   ├── index.css                 # Tailwind & custom road styling
│   │   └── main.jsx                  # React DOM root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json                      # Workspace orchestration
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher) and **npm** installed.

### 2. Running the Application
The Express backend is configured to serve both the REST API and the built React web app on a single unified port:

```powershell
# From the project root:
cd "C:\Users\ALLURI RESHANTHREDDY\.gemini\antigravity\scratch\smart-parking-system"

# Start the unified full-stack application:
npm run start:backend
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

### 3. Frontend Development Server (Optional)
If you wish to run the Vite hot-reloading development server:

```powershell
# In a separate terminal:
cd frontend
npm run dev
```

Open your browser at:
👉 **`http://localhost:3000`** (requests to `/api/*` are automatically proxied to port 5000)

---

## ⚙️ Connecting to MongoDB (Optional)

To connect to a live MongoDB instance or MongoDB Atlas:

1. Open `backend/.env`.
2. Update `MONGODB_URI`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/smart_parking
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart_parking?retryWrites=true&w=majority
   ```
3. Restart the server. The status badge on the navbar will automatically switch to **MongoDB**.

---

## 📡 REST API Reference

### Slots (`/api/slots`)
- `GET /api/slots`: Retrieve slots (supports `?floor=1`, `?status=available`, `?slotType=ev`, `?search=F1-01`).
- `GET /api/slots/:id`: Retrieve single slot details.
- `POST /api/slots`: Provision a new slot.
- `PUT /api/slots/:id`: Update slot parameters.
- `PATCH /api/slots/:id/maintenance`: Toggle maintenance status.
- `DELETE /api/slots/:id`: Remove an unoccupied slot.

### Parking Operations (`/api/parking`)
- `POST /api/parking/check-in`: Vehicle entry (auto or manual slot allocation, ticket creation).
- `POST /api/parking/calculate-bill`: Real-time fee estimate without checking out.
- `POST /api/parking/check-out`: Vehicle exit (computes final fee, records payment, frees slot).
- `POST /api/parking/reserve`: Pre-book slot with token.
- `POST /api/parking/cancel-reservation`: Cancel an existing booking.
- `GET /api/parking/tickets`: Query ticket history with filters.
- `GET /api/parking/tickets/:ticketNumber`: Query single ticket.

### Analytics (`/api/analytics`)
- `GET /api/analytics/stats`: Real-time KPI counters, revenue, floor breakdown, and recent activity logs.

### System (`/api/health` & `/api/seed`)
- `GET /api/health`: Health status and database mode.
- `POST /api/seed`: Reset and re-seed the facility with 48 bays across 3 floors.
