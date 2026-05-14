const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getAvailableTables, createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');

router.get('/available-tables', getAvailableTables);
router.post('/', verifyToken, createBooking);
router.get('/my', verifyToken, getMyBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;
