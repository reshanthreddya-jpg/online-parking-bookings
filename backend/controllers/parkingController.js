const { SlotStore, TicketStore, SettingsStore } = require('../models/dbStore');

// Helper to generate ticket code
function generateTicketNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `PRK-${year}-${code}`;
}

// Helper to calculate bill
function computeParkingCharges(checkInTime, checkOutTime, hourlyRate, isEvCharging = false) {
  const start = new Date(checkInTime).getTime();
  const end = new Date(checkOutTime).getTime();
  const diffMinutes = Math.max(1, Math.ceil((end - start) / (1000 * 60)));

  // Minimum billing: at least 1 hour, then rounded up to next 30-min block
  const billedHours = Math.max(1, Math.ceil(diffMinutes / 60));
  const baseAmount = parseFloat((billedHours * hourlyRate).toFixed(2));
  const evFee = isEvCharging ? 5.0 : 0.0;
  const totalAmount = parseFloat((baseAmount + evFee).toFixed(2));

  return {
    diffMinutes,
    billedHours,
    baseAmount,
    evFee,
    totalAmount
  };
}

// POST /api/parking/check-in
exports.checkIn = async (req, res) => {
  try {
    const { licensePlate, vehicleType, driverName, driverPhone, slotId, isChargingNeeded } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ success: false, error: 'Vehicle license plate is required' });
    }

    const cleanPlate = licensePlate.trim().toUpperCase();

    // Check if vehicle is already parked inside with active ticket
    const activeTicket = await TicketStore.findOne({
      licensePlate: cleanPlate,
      status: 'active'
    });

    if (activeTicket) {
      return res.status(400).json({
        success: false,
        error: `Vehicle ${cleanPlate} is already parked at slot ${activeTicket.slotNumber} (Ticket: ${activeTicket.ticketNumber})`
      });
    }

    // Find slot
    let targetSlot = null;
    const allSlots = await SlotStore.find();

    if (slotId) {
      targetSlot = allSlots.find(s => (s._id === slotId || s.id === slotId));
      if (!targetSlot) {
        return res.status(404).json({ success: false, error: 'Specified parking slot not found' });
      }
      if (targetSlot.status !== 'available' && targetSlot.status !== 'reserved') {
        return res.status(400).json({ success: false, error: `Slot ${targetSlot.slotNumber} is currently ${targetSlot.status}` });
      }
    } else {
      // Automatic optimal slot finder based on vehicle type and availability
      const vType = (vehicleType || 'car').toLowerCase();
      const availableSlots = allSlots.filter(s => s.status === 'available');

      if (availableSlots.length === 0) {
        return res.status(400).json({ success: false, error: 'Parking Lot is completely Full! No available slots.' });
      }

      // Best match priority
      if (vType === 'ev' || isChargingNeeded) {
        targetSlot = availableSlots.find(s => s.isChargingAvailable || s.slotType === 'ev');
      } else if (vType === 'motorcycle') {
        targetSlot = availableSlots.find(s => s.slotType === 'motorcycle');
      } else if (vType === 'accessible') {
        targetSlot = availableSlots.find(s => s.slotType === 'handicapped');
      } else if (vType === 'suv' || vType === 'truck') {
        targetSlot = availableSlots.find(s => s.slotType === 'suv' || s.slotType === 'standard');
      }

      // If no specific match, pick first available standard or compact slot
      if (!targetSlot) {
        targetSlot = availableSlots.find(s => s.slotType === 'standard' || s.slotType === 'compact') || availableSlots[0];
      }
    }

    const ticketNumber = generateTicketNumber();
    const checkInTime = new Date();

    // Create Ticket
    const newTicket = await TicketStore.create({
      ticketNumber,
      slotId: targetSlot._id || targetSlot.id,
      slotNumber: targetSlot.slotNumber,
      floor: targetSlot.floor,
      licensePlate: cleanPlate,
      driverName: driverName || 'Guest Driver',
      driverPhone: driverPhone || '',
      vehicleType: vehicleType || 'car',
      checkInTime,
      hourlyRate: targetSlot.hourlyRate || 3.0,
      evChargingFee: (targetSlot.isChargingAvailable && isChargingNeeded) ? 5.0 : 0.0,
      paymentStatus: 'unpaid',
      status: 'active'
    });

    // Update Slot status
    await SlotStore.findByIdAndUpdate(targetSlot._id || targetSlot.id, {
      status: 'occupied',
      currentSession: {
        ticketId: newTicket._id || newTicket.id,
        ticketNumber,
        licensePlate: cleanPlate,
        vehicleType: vehicleType || 'car',
        driverName: driverName || 'Guest Driver',
        driverPhone: driverPhone || '',
        checkInTime,
        reservationCode: null,
        estimatedHours: 2
      }
    });

    res.status(201).json({
      success: true,
      message: `Vehicle ${cleanPlate} checked in successfully into slot ${targetSlot.slotNumber}`,
      data: {
        ticket: newTicket,
        slot: targetSlot
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/parking/calculate-bill
exports.calculateBill = async (req, res) => {
  try {
    const { ticketNumber, licensePlate, slotNumber } = req.body;

    let ticket = null;
    if (ticketNumber) {
      ticket = await TicketStore.findOne({ ticketNumber: ticketNumber.trim().toUpperCase(), status: 'active' });
    } else if (licensePlate) {
      ticket = await TicketStore.findOne({ licensePlate: licensePlate.trim().toUpperCase(), status: 'active' });
    } else if (slotNumber) {
      ticket = await TicketStore.findOne({ slotNumber: slotNumber.trim().toUpperCase(), status: 'active' });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'No active parking ticket found matching the criteria' });
    }

    const now = new Date();
    const calculation = computeParkingCharges(
      ticket.checkInTime,
      now,
      ticket.hourlyRate || 3.0,
      ticket.evChargingFee > 0
    );

    res.json({
      success: true,
      data: {
        ticketNumber: ticket.ticketNumber,
        licensePlate: ticket.licensePlate,
        slotNumber: ticket.slotNumber,
        floor: ticket.floor,
        vehicleType: ticket.vehicleType,
        checkInTime: ticket.checkInTime,
        currentTime: now,
        durationMinutes: calculation.diffMinutes,
        billedHours: calculation.billedHours,
        hourlyRate: ticket.hourlyRate,
        baseAmount: calculation.baseAmount,
        evChargingFee: calculation.evFee,
        totalAmount: calculation.totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/parking/check-out
exports.checkOut = async (req, res) => {
  try {
    const { ticketNumber, licensePlate, paymentMethod } = req.body;

    let ticket = null;
    if (ticketNumber) {
      ticket = await TicketStore.findOne({ ticketNumber: ticketNumber.trim().toUpperCase(), status: 'active' });
    } else if (licensePlate) {
      ticket = await TicketStore.findOne({ licensePlate: licensePlate.trim().toUpperCase(), status: 'active' });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Active parking ticket not found' });
    }

    const checkOutTime = new Date();
    const calculation = computeParkingCharges(
      ticket.checkInTime,
      checkOutTime,
      ticket.hourlyRate || 3.0,
      ticket.evChargingFee > 0
    );

    // Update Ticket
    const updatedTicket = await TicketStore.findByIdAndUpdate(ticket._id || ticket.id, {
      checkOutTime,
      durationMinutes: calculation.diffMinutes,
      baseAmount: calculation.baseAmount,
      totalAmount: calculation.totalAmount,
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'credit_card',
      status: 'completed'
    }, { new: true });

    // Release Slot
    const slot = await SlotStore.findById(ticket.slotId);
    if (slot) {
      await SlotStore.findByIdAndUpdate(slot._id || slot.id, {
        status: 'available',
        currentSession: {
          ticketId: null,
          ticketNumber: null,
          licensePlate: null,
          vehicleType: null,
          driverName: null,
          driverPhone: null,
          checkInTime: null,
          reservationCode: null,
          estimatedHours: null
        }
      });
    }

    res.json({
      success: true,
      message: `Checkout successful. Total fee: $${calculation.totalAmount.toFixed(2)}`,
      data: {
        receipt: updatedTicket,
        freedSlot: slot ? slot.slotNumber : ticket.slotNumber
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/parking/reserve
exports.reserveSlot = async (req, res) => {
  try {
    const { slotId, driverName, driverPhone, vehicleType, licensePlate } = req.body;

    if (!slotId) {
      return res.status(400).json({ success: false, error: 'slotId is required for reservation' });
    }

    const slot = await SlotStore.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, error: `Slot ${slot.slotNumber} is currently ${slot.status}` });
    }

    const reservationCode = 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const updated = await SlotStore.findByIdAndUpdate(slot._id || slot.id, {
      status: 'reserved',
      currentSession: {
        reservationCode,
        driverName: driverName || 'Reserved Customer',
        driverPhone: driverPhone || '',
        vehicleType: vehicleType || 'car',
        licensePlate: licensePlate ? licensePlate.trim().toUpperCase() : 'RESERVED',
        checkInTime: new Date()
      }
    }, { new: true });

    res.json({
      success: true,
      message: `Slot ${slot.slotNumber} reserved successfully`,
      data: {
        slot: updated,
        reservationCode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/parking/cancel-reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await SlotStore.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.status !== 'reserved') {
      return res.status(400).json({ success: false, error: `Slot is not in reserved status` });
    }

    const updated = await SlotStore.findByIdAndUpdate(slot._id || slot.id, {
      status: 'available',
      currentSession: {
        ticketId: null,
        ticketNumber: null,
        licensePlate: null,
        vehicleType: null,
        driverName: null,
        driverPhone: null,
        checkInTime: null,
        reservationCode: null
      }
    }, { new: true });

    res.json({
      success: true,
      message: `Reservation on slot ${slot.slotNumber} cancelled successfully`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/parking/tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, search } = req.query;
    let tickets = await TicketStore.find();

    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      tickets = tickets.filter(t =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.licensePlate.toLowerCase().includes(q) ||
        (t.driverName && t.driverName.toLowerCase().includes(q)) ||
        t.slotNumber.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/parking/ticket/:ticketNumber
exports.getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await TicketStore.findOne({ ticketNumber: ticketNumber.trim().toUpperCase() });
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
