const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllRestaurants, getRestaurant,
  createRestaurant, updateRestaurant, deleteRestaurant,
} = require('../controllers/restaurantController');

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurant);
router.post('/', verifyToken, authorizeRoles('admin'), createRestaurant);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateRestaurant);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteRestaurant);

module.exports = router;
