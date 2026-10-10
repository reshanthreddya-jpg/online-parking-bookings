const fs = require('fs');
const path = require('path');
const { DATA_FILE, isConnected } = require('../config/db');
const Slot = require('./SlotModel');
const Ticket = require('./TicketModel');

// In-Memory cache for fast queries when offline
let inMemoryData = {
  slots: [],
  tickets: [],
  settings: {
    lotName: 'Skyline Metro Smart Parking Hub',
    totalFloors: 3,
    hourlyRates: {
      standard: 3.0,
      compact: 2.5,
      suv: 4.0,
      ev: 4.5,
      handicapped: 2.0,
      motorcycle: 1.5
    },
    evChargingFlatFee: 5.0,
    currency: '$',
    gracePeriodMinutes: 15
  }
};

// Load existing data from file if present
function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.slots) inMemoryData.slots = parsed.slots;
      if (parsed.tickets) inMemoryData.tickets = parsed.tickets;
      if (parsed.settings) inMemoryData.settings = parsed.settings;
    }
  } catch (err) {
    console.error('[DB Store] Error loading JSON data file:', err.message);
  }
}

// Persist data to file asynchronously
function saveToFile() {
  if (isConnected()) return; // MongoDB handles persistence when connected
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Store] Error writing JSON data file:', err.message);
  }
}

// Initial load
loadFromFile();

// Generate unique ID for JSON fallback mode
function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// Slot Repository
const SlotStore = {
  async find(filter = {}) {
    if (isConnected()) {
      return await Slot.find(filter).lean();
    }
    return inMemoryData.slots.filter(s => {
      for (const key in filter) {
        if (filter[key] !== undefined && s[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  },

  async findById(id) {
    if (isConnected()) {
      return await Slot.findById(id).lean();
    }
    return inMemoryData.slots.find(s => s._id === id || s.id === id) || null;
  },

  async findOne(filter = {}) {
    if (isConnected()) {
      return await Slot.findOne(filter).lean();
    }
    return inMemoryData.slots.find(s => {
      for (const key in filter) {
        if (filter[key] !== undefined && s[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  },

  async create(data) {
    if (isConnected()) {
      const doc = new Slot(data);
      const saved = await doc.save();
      return saved.toObject();
    }
    const newSlot = {
      _id: generateId(),
      ...data,
      currentSession: data.currentSession || {
        ticketId: null,
        ticketNumber: null,
        licensePlate: null,
        vehicleType: null,
        driverName: null,
        driverPhone: null,
        checkInTime: null,
        reservationCode: null,
        estimatedHours: 2
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryData.slots.push(newSlot);
    saveToFile();
    return newSlot;
  },

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    if (isConnected()) {
      return await Slot.findByIdAndUpdate(id, updates, options).lean();
    }
    const index = inMemoryData.slots.findIndex(s => s._id === id || s.id === id);
    if (index === -1) return null;

    // Deep merge or update
    const current = inMemoryData.slots[index];
    const updated = {
      ...current,
      ...updates,
      currentSession: updates.currentSession ? {
        ...(current.currentSession || {}),
        ...updates.currentSession
      } : current.currentSession,
      updatedAt: new Date().toISOString()
    };

    inMemoryData.slots[index] = updated;
    saveToFile();
    return updated;
  },

  async findByIdAndDelete(id) {
    if (isConnected()) {
      return await Slot.findByIdAndDelete(id).lean();
    }
    const index = inMemoryData.slots.findIndex(s => s._id === id || s.id === id);
    if (index === -1) return null;
    const deleted = inMemoryData.slots.splice(index, 1)[0];
    saveToFile();
    return deleted;
  },

  async countDocuments(filter = {}) {
    if (isConnected()) {
      return await Slot.countDocuments(filter);
    }
    return (await this.find(filter)).length;
  },

  async deleteMany(filter = {}) {
    if (isConnected()) {
      return await Slot.deleteMany(filter);
    }
    inMemoryData.slots = [];
    saveToFile();
    return { acknowledged: true, deletedCount: inMemoryData.slots.length };
  }
};

// Ticket Repository
const TicketStore = {
  async find(filter = {}) {
    if (isConnected()) {
      return await Ticket.find(filter).sort({ checkInTime: -1 }).lean();
    }
    return inMemoryData.tickets
      .filter(t => {
        for (const key in filter) {
          if (filter[key] !== undefined && t[key] !== filter[key]) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
  },

  async findById(id) {
    if (isConnected()) {
      return await Ticket.findById(id).lean();
    }
    return inMemoryData.tickets.find(t => t._id === id || t.id === id) || null;
  },

  async findOne(filter = {}) {
    if (isConnected()) {
      return await Ticket.findOne(filter).lean();
    }
    return inMemoryData.tickets.find(t => {
      for (const key in filter) {
        if (filter[key] !== undefined && t[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  },

  async create(data) {
    if (isConnected()) {
      const doc = new Ticket(data);
      const saved = await doc.save();
      return saved.toObject();
    }
    const newTicket = {
      _id: generateId(),
      ...data,
      checkInTime: data.checkInTime ? new Date(data.checkInTime).toISOString() : new Date().toISOString(),
      checkOutTime: data.checkOutTime ? new Date(data.checkOutTime).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryData.tickets.push(newTicket);
    saveToFile();
    return newTicket;
  },

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    if (isConnected()) {
      return await Ticket.findByIdAndUpdate(id, updates, options).lean();
    }
    const index = inMemoryData.tickets.findIndex(t => t._id === id || t.id === id);
    if (index === -1) return null;
    const current = inMemoryData.tickets[index];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    inMemoryData.tickets[index] = updated;
    saveToFile();
    return updated;
  },

  async countDocuments(filter = {}) {
    if (isConnected()) {
      return await Ticket.countDocuments(filter);
    }
    return (await this.find(filter)).length;
  },

  async deleteMany(filter = {}) {
    if (isConnected()) {
      return await Ticket.deleteMany(filter);
    }
    inMemoryData.tickets = [];
    saveToFile();
    return { acknowledged: true, deletedCount: inMemoryData.tickets.length };
  }
};

// Settings Store
const SettingsStore = {
  get() {
    return inMemoryData.settings;
  },
  update(newSettings) {
    inMemoryData.settings = { ...inMemoryData.settings, ...newSettings };
    saveToFile();
    return inMemoryData.settings;
  }
};

module.exports = {
  SlotStore,
  TicketStore,
  SettingsStore,
  rawStore: inMemoryData,
  saveToFile
};
