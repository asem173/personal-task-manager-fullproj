const express = require('express');
const router = express.Router();
const sharedTaskController = require('../controllers/sharedTaskController');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', authorizeRoles('admin', 'user'), sharedTaskController.getSharedTasks);
router.get('/:id', authorizeRoles('admin', 'user'), sharedTaskController.getSharedTask);
router.put('/:id', authorizeRoles('admin', 'user'), sharedTaskController.updateSharedTask);
router.delete('/:id', authorizeRoles('admin', 'user'), sharedTaskController.removeSharedTask);

module.exports = router;    
