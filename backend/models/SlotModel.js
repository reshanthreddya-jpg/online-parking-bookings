const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  floor: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  floorName: {
    type: String,
    default: 'Level 1'
  },
  slotType: {
    type: String,
    enum: ['standard', 'compact', 'suv', 'ev', 'handicapped', 'motorcycle'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  hourlyRate: {
    type: Number,
    default: 3.0
  },
  isChargingAvailable: {
    type: Boolean,
    default: false
  },
  currentSession: {
    ticketId: { type: String, default: null },
    ticketNumber: { type: String, default: null },
    licensePlate: { type: String, default: null },
    vehicleType: { type: String, default: null },
    driverName: { type: String, default: null },
    driverPhone: { type: String, default: null },
    checkInTime: { type: Date, default: null },
    reservationCode: { type: String, default: null },
    estimatedHours: { type: Number, default: 2 }
  }
}, {
  timestamps: true
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
