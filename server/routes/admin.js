const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, deleteUser, getDashboardStats } = require('../controllers/adminController');

router.get('/users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);
router.get('/stats', verifyToken, authorizeRoles('admin'), getDashboardStats);

module.exports = router;
