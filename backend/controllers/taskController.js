const taskModel = require('../models/taskModel');

const getAllTasks = async (req, res) => {
    try {
        const tasks = await taskModel.getAllTasks(req.user.userId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

const getTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const task = await taskModel.getTaskById(taskId, req.user.userId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const task = await taskModel.createTask(req.body, req.user.userId);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const task = await taskModel.updateTask(taskId, req.body, req.user.userId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const task = await taskModel.deleteTask(taskId, req.user.userId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { status } = req.body;
        const task = await taskModel.updateTaskStatus(taskId, status, req.user.userId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
};

module.exports = {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
};  