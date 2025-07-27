const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const sharedTaskController = require('../controllers/sharedTaskController');
const commentController = require('../controllers/commentController');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/:id/comments', authorizeRoles('user', 'admin'), commentController.addComment);
router.get('/:id/comments', authorizeRoles('user', 'admin'), commentController.getComments);

router.get('/', authorizeRoles('user'), taskController.getAllTasks);
router.get('/:id', authorizeRoles('user'), taskController.getTask);
router.post('/', authorizeRoles('user'), taskController.createTask);
router.put('/:id', authorizeRoles('user'), taskController.updateTask);
router.delete('/:id', authorizeRoles('user'), taskController.deleteTask);
router.put('/:id/status', authorizeRoles('user'), taskController.updateTaskStatus);
router.post('/:id/share', authorizeRoles('user'), sharedTaskController.shareTask);





module.exports = router;

