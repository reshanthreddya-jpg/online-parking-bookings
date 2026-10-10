const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

router.get('/', slotController.getSlots);
router.get('/:id', slotController.getSlotById);
router.post('/', slotController.createSlot);
router.put('/:id', slotController.updateSlot);
router.patch('/:id/maintenance', slotController.toggleMaintenance);
router.delete('/:id', slotController.deleteSlot);

module.exports = router;
