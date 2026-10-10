const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/check-in', parkingController.checkIn);
router.post('/calculate-bill', parkingController.calculateBill);
router.post('/check-out', parkingController.checkOut);
router.post('/reserve', parkingController.reserveSlot);
router.post('/cancel-reservation', parkingController.cancelReservation);
router.get('/tickets', parkingController.getTickets);
router.get('/tickets/:ticketNumber', parkingController.getTicketByNumber);

module.exports = router;
