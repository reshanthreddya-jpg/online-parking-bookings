const { SlotStore } = require('../models/dbStore');

// GET /api/slots
exports.getSlots = async (req, res) => {
  try {
    const { floor, status, slotType, search } = req.query;
    let slots = await SlotStore.find();

    if (floor) {
      const floorNum = parseInt(floor, 10);
      slots = slots.filter(s => s.floor === floorNum);
    }

    if (status && status !== 'all') {
      slots = slots.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    if (slotType && slotType !== 'all') {
      slots = slots.filter(s => s.slotType.toLowerCase() === slotType.toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      slots = slots.filter(s => 
        s.slotNumber.toLowerCase().includes(q) ||
        (s.currentSession?.licensePlate && s.currentSession.licensePlate.toLowerCase().includes(q)) ||
        (s.currentSession?.driverName && s.currentSession.driverName.toLowerCase().includes(q))
      );
    }

    // Sort logically by floor ascending, then slotNumber
    slots.sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.slotNumber.localeCompare(b.slotNumber, undefined, { numeric: true, sensitivity: 'base' });
    });

    res.json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/slots/:id
exports.getSlotById = async (req, res) => {
  try {
    const slot = await SlotStore.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/slots
exports.createSlot = async (req, res) => {
  try {
    const { slotNumber, floor, slotType, hourlyRate, isChargingAvailable } = req.body;

    if (!slotNumber || !floor) {
      return res.status(400).json({ success: false, error: 'slotNumber and floor are required' });
    }

    const cleanSlotNumber = slotNumber.trim().toUpperCase();
    const existing = await SlotStore.findOne({ slotNumber: cleanSlotNumber });
    if (existing) {
      return res.status(400).json({ success: false, error: `Slot ${cleanSlotNumber} already exists` });
    }

    const floorNum = parseInt(floor, 10);
    const floorNames = {
      1: 'Level 1 - Priority & EV',
      2: 'Level 2 - General & Compact',
      3: 'Level 3 - Premium & SUV'
    };

    const newSlot = await SlotStore.create({
      slotNumber: cleanSlotNumber,
      floor: floorNum,
      floorName: floorNames[floorNum] || `Level ${floorNum}`,
      slotType: slotType || 'standard',
      status: 'available',
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 3.0,
      isChargingAvailable: Boolean(isChargingAvailable)
    });

    res.status(201).json({ success: true, data: newSlot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/slots/:id
exports.updateSlot = async (req, res) => {
  try {
    const slot = await SlotStore.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    const allowedUpdates = ['hourlyRate', 'slotType', 'isChargingAvailable', 'status'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Do not allow setting occupied directly via slot update without ticket
    if (updates.status === 'occupied' && !slot.currentSession?.ticketId) {
      return res.status(400).json({ success: false, error: 'Use check-in flow to occupy a slot' });
    }

    const updated = await SlotStore.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/slots/:id/maintenance
exports.toggleMaintenance = async (req, res) => {
  try {
    const slot = await SlotStore.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.status === 'occupied') {
      return res.status(400).json({ success: false, error: 'Cannot set occupied slot to maintenance' });
    }

    const newStatus = slot.status === 'maintenance' ? 'available' : 'maintenance';
    const updated = await SlotStore.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });

    res.json({
      success: true,
      message: `Slot status updated to ${newStatus}`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/slots/:id
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await SlotStore.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.status === 'occupied') {
      return res.status(400).json({ success: false, error: 'Cannot delete occupied slot' });
    }

    await SlotStore.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Slot ${slot.slotNumber} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
