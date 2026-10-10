const { SlotStore, TicketStore, SettingsStore } = require('../models/dbStore');
const { getDbStatus } = require('../config/db');

// GET /api/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const slots = await SlotStore.find();
    const tickets = await TicketStore.find();
    const settings = SettingsStore.get();

    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
    const availableSlots = slots.filter(s => s.status === 'available').length;
    const reservedSlots = slots.filter(s => s.status === 'reserved').length;
    const maintenanceSlots = slots.filter(s => s.status === 'maintenance').length;

    const operationalCapacity = totalSlots - maintenanceSlots;
    const occupancyRate = operationalCapacity > 0 
      ? Math.round((occupiedSlots / operationalCapacity) * 100) 
      : 0;

    // Revenue calculations
    const todayStr = new Date().toISOString().split('T')[0];
    let todayRevenue = 0;
    let totalRevenue = 0;
    let totalCompleted = 0;

    tickets.forEach(t => {
      if (t.paymentStatus === 'paid' && t.totalAmount) {
        totalRevenue += t.totalAmount;
        totalCompleted++;
        if (t.checkOutTime && t.checkOutTime.startsWith(todayStr)) {
          todayRevenue += t.totalAmount;
        }
      }
    });

    // Breakdown by floor
    const floorsMap = {};
    slots.forEach(s => {
      const f = s.floor || 1;
      if (!floorsMap[f]) {
        floorsMap[f] = {
          floor: f,
          name: s.floorName || `Level ${f}`,
          total: 0,
          occupied: 0,
          available: 0,
          reserved: 0,
          maintenance: 0
        };
      }
      floorsMap[f].total++;
      floorsMap[f][s.status]++;
    });

    const floorStats = Object.values(floorsMap).map(f => ({
      ...f,
      occupancyRate: f.total > 0 ? Math.round((f.occupied / f.total) * 100) : 0
    }));

    // Breakdown by vehicle types currently parked
    const vehicleTypeCounts = {
      car: 0,
      suv: 0,
      ev: 0,
      motorcycle: 0,
      accessible: 0
    };

    slots.filter(s => s.status === 'occupied' && s.currentSession).forEach(s => {
      const v = (s.currentSession.vehicleType || 'car').toLowerCase();
      if (vehicleTypeCounts[v] !== undefined) {
        vehicleTypeCounts[v]++;
      } else {
        vehicleTypeCounts.car++;
      }
    });

    // Recent activity (latest 8 tickets)
    const recentActivity = tickets.slice(0, 8).map(t => ({
      id: t._id || t.id,
      ticketNumber: t.ticketNumber,
      licensePlate: t.licensePlate,
      slotNumber: t.slotNumber,
      vehicleType: t.vehicleType,
      type: t.status === 'active' ? 'ENTRY' : 'EXIT',
      time: t.status === 'active' ? t.checkInTime : t.checkOutTime,
      amount: t.totalAmount || 0
    }));

    res.json({
      success: true,
      data: {
        dbStatus: getDbStatus(),
        lotName: settings.lotName,
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        maintenanceSlots,
        occupancyRate,
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCompletedSessions: totalCompleted,
        vehicleTypeCounts,
        floorStats,
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
