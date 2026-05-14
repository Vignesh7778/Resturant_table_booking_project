const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { getAllBookings, approveBooking, rejectBooking } = require('../controllers/staffController');

router.get('/bookings', verifyToken, authorizeRoles('staff', 'admin'), getAllBookings);
router.put('/approve/:id', verifyToken, authorizeRoles('staff', 'admin'), approveBooking);
router.put('/reject/:id', verifyToken, authorizeRoles('staff', 'admin'), rejectBooking);

module.exports = router;
