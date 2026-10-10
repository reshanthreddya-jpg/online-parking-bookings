require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { connectDB, getDbStatus } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

const slotRoutes = require('./routes/slotRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/slots', slotRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Parking System MERN API',
    timestamp: new Date().toISOString(),
    db: getDbStatus()
  });
});

// Seed endpoint for resetting or replenishing data
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database successfully re-seeded with 48 slots and sample records.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 handler for API when dist is not built
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Startup sequence
async function startServer() {
  await connectDB();
  await seedDatabase(false);

  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚗 Smart Parking System API & Web App running on port ${PORT}`);
    console.log(`🔗 Web Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API Health:    http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });
}

startServer();
