const { SlotStore, TicketStore, saveToFile } = require('../models/dbStore');

async function seedDatabase(force = false) {
  try {
    const existingSlots = await SlotStore.find();
    if (existingSlots.length > 0 && !force) {
      console.log(`[Seed] Database already contains ${existingSlots.length} slots. Skipping seed.`);
      return;
    }

    console.log('[Seed] Seeding parking slots and realistic initial tickets...');

    await SlotStore.deleteMany({});
    await TicketStore.deleteMany({});

    const slots = [];
    const now = Date.now();

    // Helper for realistic time offsets
    const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
    const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString();

    // Floor 1: Priority & EV (16 slots)
    // 6 EV slots
    for (let i = 1; i <= 6; i++) {
      const code = `F1-EV0${i}`;
      slots.push({
        slotNumber: code,
        floor: 1,
        floorName: 'Level 1 - Priority & EV',
        slotType: 'ev',
        status: i === 1 ? 'occupied' : (i === 2 ? 'occupied' : 'available'),
        hourlyRate: 4.5,
        isChargingAvailable: true,
        currentSession: i === 1 ? {
          ticketNumber: 'PRK-2026-EV901',
          licensePlate: 'TESLA-89X',
          vehicleType: 'ev',
          driverName: 'Alexander Hayes',
          driverPhone: '+1-555-0192',
          checkInTime: hoursAgo(2.2),
          reservationCode: null
        } : (i === 2 ? {
          ticketNumber: 'PRK-2026-EV402',
          licensePlate: 'HYUN-ION5',
          vehicleType: 'ev',
          driverName: 'Maya Lin',
          driverPhone: '+1-555-0144',
          checkInTime: minutesAgo(45),
          reservationCode: null
        } : null)
      });
    }

    // 4 Accessible slots
    for (let i = 1; i <= 4; i++) {
      const code = `F1-AC0${i}`;
      slots.push({
        slotNumber: code,
        floor: 1,
        floorName: 'Level 1 - Priority & EV',
        slotType: 'handicapped',
        status: i === 1 ? 'occupied' : 'available',
        hourlyRate: 2.0,
        isChargingAvailable: false,
        currentSession: i === 1 ? {
          ticketNumber: 'PRK-2026-AC101',
          licensePlate: 'ACC-7721',
          vehicleType: 'accessible',
          driverName: 'Robert Vance',
          driverPhone: '+1-555-0188',
          checkInTime: hoursAgo(1.5),
          reservationCode: null
        } : null
      });
    }

    // 6 Motorcycle slots
    for (let i = 1; i <= 6; i++) {
      const code = `F1-MC0${i}`;
      slots.push({
        slotNumber: code,
        floor: 1,
        floorName: 'Level 1 - Priority & EV',
        slotType: 'motorcycle',
        status: i <= 2 ? 'occupied' : 'available',
        hourlyRate: 1.5,
        isChargingAvailable: false,
        currentSession: i === 1 ? {
          ticketNumber: 'PRK-2026-MC301',
          licensePlate: 'DUK-390',
          vehicleType: 'motorcycle',
          driverName: 'Carlos Rivera',
          driverPhone: '+1-555-0133',
          checkInTime: hoursAgo(3.0),
          reservationCode: null
        } : (i === 2 ? {
          ticketNumber: 'PRK-2026-MC302',
          licensePlate: 'HARL-883',
          vehicleType: 'motorcycle',
          driverName: 'Liam O’Connor',
          driverPhone: '+1-555-0162',
          checkInTime: minutesAgo(30),
          reservationCode: null
        } : null)
      });
    }

    // Floor 2: General & Compact (16 slots)
    // 10 Standard slots
    for (let i = 1; i <= 10; i++) {
      const code = `F2-${i < 10 ? '0' + i : i}`;
      let status = 'available';
      let session = null;

      if (i === 1) {
        status = 'occupied';
        session = {
          ticketNumber: 'PRK-2026-ST201',
          licensePlate: 'KA-05-MN-9921',
          vehicleType: 'car',
          driverName: 'Sarah Jenkins',
          driverPhone: '+1-555-0121',
          checkInTime: hoursAgo(4.1),
          reservationCode: null
        };
      } else if (i === 3) {
        status = 'occupied';
        session = {
          ticketNumber: 'PRK-2026-ST203',
          licensePlate: 'MH-12-AB-4050',
          vehicleType: 'car',
          driverName: 'David Chen',
          driverPhone: '+1-555-0177',
          checkInTime: hoursAgo(1.2),
          reservationCode: null
        };
      } else if (i === 5) {
        status = 'reserved';
        session = {
          reservationCode: 'RES-89K2A',
          licensePlate: 'NY-882-PL',
          driverName: 'Emily Watson',
          driverPhone: '+1-555-0166',
          vehicleType: 'car',
          checkInTime: minutesAgo(15)
        };
      } else if (i === 8) {
        status = 'maintenance';
      }

      slots.push({
        slotNumber: code,
        floor: 2,
        floorName: 'Level 2 - General & Compact',
        slotType: 'standard',
        status,
        hourlyRate: 3.0,
        isChargingAvailable: false,
        currentSession: session
      });
    }

    // 6 Compact slots
    for (let i = 1; i <= 6; i++) {
      const code = `F2-C0${i}`;
      slots.push({
        slotNumber: code,
        floor: 2,
        floorName: 'Level 2 - General & Compact',
        slotType: 'compact',
        status: i === 2 ? 'occupied' : 'available',
        hourlyRate: 2.5,
        isChargingAvailable: false,
        currentSession: i === 2 ? {
          ticketNumber: 'PRK-2026-CP202',
          licensePlate: 'MINI-4410',
          vehicleType: 'car',
          driverName: 'Sophia Miller',
          driverPhone: '+1-555-0199',
          checkInTime: hoursAgo(2.5),
          reservationCode: null
        } : null
      });
    }

    // Floor 3: Premium & SUV (16 slots)
    // 8 SUV slots
    for (let i = 1; i <= 8; i++) {
      const code = `F3-S0${i}`;
      slots.push({
        slotNumber: code,
        floor: 3,
        floorName: 'Level 3 - Premium & SUV',
        slotType: 'suv',
        status: i === 1 ? 'occupied' : (i === 4 ? 'occupied' : 'available'),
        hourlyRate: 4.0,
        isChargingAvailable: false,
        currentSession: i === 1 ? {
          ticketNumber: 'PRK-2026-SUV301',
          licensePlate: 'RANGE-500',
          vehicleType: 'suv',
          driverName: 'Marcus Bennett',
          driverPhone: '+1-555-0112',
          checkInTime: hoursAgo(3.5),
          reservationCode: null
        } : (i === 4 ? {
          ticketNumber: 'PRK-2026-SUV304',
          licensePlate: 'FORD-F150',
          vehicleType: 'suv',
          driverName: 'Brian Taylor',
          driverPhone: '+1-555-0149',
          checkInTime: minutesAgo(50),
          reservationCode: null
        } : null)
      });
    }

    // 8 Premium / Rooftop slots
    for (let i = 1; i <= 8; i++) {
      const code = `F3-P0${i}`;
      slots.push({
        slotNumber: code,
        floor: 3,
        floorName: 'Level 3 - Premium & SUV',
        slotType: 'standard',
        status: i === 2 ? 'occupied' : (i === 6 ? 'reserved' : 'available'),
        hourlyRate: 3.5,
        isChargingAvailable: false,
        currentSession: i === 2 ? {
          ticketNumber: 'PRK-2026-PR302',
          licensePlate: 'BMW-M3-CS',
          vehicleType: 'car',
          driverName: 'Elena Rostova',
          driverPhone: '+1-555-0184',
          checkInTime: hoursAgo(1.8),
          reservationCode: null
        } : (i === 6 ? {
          reservationCode: 'RES-91B4Q',
          licensePlate: 'AUDI-RS6',
          driverName: 'Jameson Knight',
          driverPhone: '+1-555-0138',
          vehicleType: 'car',
          checkInTime: minutesAgo(20)
        } : null)
      });
    }

    // Save slots and create matching active tickets
    for (const slotData of slots) {
      const createdSlot = await SlotStore.create(slotData);
      if (createdSlot.status === 'occupied' && createdSlot.currentSession?.ticketNumber) {
        const sess = createdSlot.currentSession;
        const newTicket = await TicketStore.create({
          ticketNumber: sess.ticketNumber,
          slotId: createdSlot._id || createdSlot.id,
          slotNumber: createdSlot.slotNumber,
          floor: createdSlot.floor,
          licensePlate: sess.licensePlate,
          driverName: sess.driverName,
          driverPhone: sess.driverPhone,
          vehicleType: sess.vehicleType,
          checkInTime: sess.checkInTime,
          hourlyRate: createdSlot.hourlyRate,
          evChargingFee: createdSlot.isChargingAvailable ? 5.0 : 0.0,
          paymentStatus: 'unpaid',
          status: 'active'
        });
        // Link ticketId
        await SlotStore.findByIdAndUpdate(createdSlot._id || createdSlot.id, {
          'currentSession.ticketId': newTicket._id || newTicket.id
        });
      }
    }

    // Seed completed past tickets for rich historical analytics
    const pastSampleTickets = [
      {
        ticketNumber: 'PRK-2026-HST01',
        slotId: 'seeded_prev',
        slotNumber: 'F2-04',
        floor: 2,
        licensePlate: 'DL-01-TX-8833',
        driverName: 'Rohan Sharma',
        vehicleType: 'car',
        checkInTime: hoursAgo(8),
        checkOutTime: hoursAgo(5),
        durationMinutes: 180,
        hourlyRate: 3.0,
        baseAmount: 9.0,
        evChargingFee: 0,
        totalAmount: 9.0,
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        status: 'completed'
      },
      {
        ticketNumber: 'PRK-2026-HST02',
        slotId: 'seeded_prev',
        slotNumber: 'F1-EV03',
        floor: 1,
        licensePlate: 'POLE-STAR2',
        driverName: 'Chloe Bennett',
        vehicleType: 'ev',
        checkInTime: hoursAgo(6.5),
        checkOutTime: hoursAgo(3.5),
        durationMinutes: 180,
        hourlyRate: 4.5,
        baseAmount: 13.5,
        evChargingFee: 5.0,
        totalAmount: 18.5,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        status: 'completed'
      },
      {
        ticketNumber: 'PRK-2026-HST03',
        slotId: 'seeded_prev',
        slotNumber: 'F3-S03',
        floor: 3,
        licensePlate: 'CHEV-TAHOE',
        driverName: 'Kevin Durant',
        vehicleType: 'suv',
        checkInTime: hoursAgo(7.2),
        checkOutTime: hoursAgo(4.0),
        durationMinutes: 192,
        hourlyRate: 4.0,
        baseAmount: 16.0,
        evChargingFee: 0,
        totalAmount: 16.0,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        status: 'completed'
      },
      {
        ticketNumber: 'PRK-2026-HST04',
        slotId: 'seeded_prev',
        slotNumber: 'F1-MC04',
        floor: 1,
        licensePlate: 'YAM-R15',
        driverName: 'Anil Kapoor',
        vehicleType: 'motorcycle',
        checkInTime: hoursAgo(5.0),
        checkOutTime: hoursAgo(2.0),
        durationMinutes: 180,
        hourlyRate: 1.5,
        baseAmount: 4.5,
        evChargingFee: 0,
        totalAmount: 4.5,
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        status: 'completed'
      },
      {
        ticketNumber: 'PRK-2026-HST05',
        slotId: 'seeded_prev',
        slotNumber: 'F2-C04',
        floor: 2,
        licensePlate: 'VW-POLO-GT',
        driverName: 'Simona Halep',
        vehicleType: 'car',
        checkInTime: hoursAgo(9.0),
        checkOutTime: hoursAgo(6.5),
        durationMinutes: 150,
        hourlyRate: 2.5,
        baseAmount: 7.5,
        evChargingFee: 0,
        totalAmount: 7.5,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        status: 'completed'
      }
    ];

    for (const pt of pastSampleTickets) {
      await TicketStore.create(pt);
    }

    saveToFile();
    console.log(`[Seed] ✅ Seed complete: 48 parking slots configured across 3 floors.`);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
}

module.exports = { seedDatabase };
