const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  slotId: {
    type: String,
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  driverName: {
    type: String,
    default: 'Guest Driver'
  },
  driverPhone: {
    type: String,
    default: ''
  },
  vehicleType: {
    type: String,
    enum: ['car', 'suv', 'ev', 'motorcycle', 'truck', 'accessible'],
    default: 'car'
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    default: 3.0
  },
  baseAmount: {
    type: Number,
    default: 0
  },
  evChargingFee: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'upi', 'fastag', 'wallet'],
    default: 'credit_card'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
