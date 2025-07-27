const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authorizeRoles('admin', 'user'), userController.getUserProfile);
router.put('/:id', authorizeRoles('admin', 'user'), userController.updateUserProfile);

module.exports = router;