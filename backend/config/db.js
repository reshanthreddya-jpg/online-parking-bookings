const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;
const DATA_FILE = path.join(__dirname, '../data/parking_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_parking';
  try {
    // Attempt fast connection to MongoDB
    console.log(`[DB] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('[DB] ✅ Successfully connected to MongoDB server');
  } catch (err) {
    isMongoConnected = false;
    console.log(`[DB] ⚠️ MongoDB not available (${err.message}).`);
    console.log('[DB] 🚀 Activated Resilient In-Memory & JSON File Persistence mode.');
    console.log(`[DB] 📁 Storage file: ${DATA_FILE}`);
  }
  return isMongoConnected;
}

function getDbStatus() {
  return {
    isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Native' : 'Resilient Embedded JSON Store',
    dataFile: isMongoConnected ? null : DATA_FILE
  };
}

module.exports = { connectDB, getDbStatus, DATA_FILE, isConnected: () => isMongoConnected };
