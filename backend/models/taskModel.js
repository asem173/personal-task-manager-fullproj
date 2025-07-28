const pool = require('../config/db');

const getAllTasks = async (userId) => {
    const result = await pool.query('SELECT * FROM tasks WHERE owner_id = $1 ORDER BY due_date', [userId]);
    return result.rows;
};

const getTaskById = async (taskId, userId) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND owner_id = $2', [taskId, userId]);
    return result.rows[0];
};

const createTask = async (task, userId) => {
    const { title, description, due_date } = task;
    const result = await pool.query('INSERT INTO tasks (title, description, due_date, owner_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, description, due_date, userId]);
    return result.rows[0];
};

const updateTask = async (taskId, task, userId) => {
    const { title, description, due_date, status, priority } = task;
    const result = await pool.query('UPDATE tasks SET title = $1, description = $2, due_date = $3, status = $4, priority = $5 WHERE id = $6 AND owner_id = $7 RETURNING *', [title, description, due_date, status, priority, taskId, userId]);
    return result.rows[0];
};

const deleteTask = async (taskId, userId) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND owner_id = $2 RETURNING *', [taskId, userId]);
    return result.rows[0];
};

const updateTaskStatus = async (taskId, status, userId) => {
    const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 AND owner_id = $3 RETURNING *', [status, taskId, userId]);
    return result.rows[0];
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
};