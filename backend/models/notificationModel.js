const pool = require('../config/db');

const getNotifications = async (userId) => {
    const result = await pool.query('SELECT n.* FROM notifications n JOIN tasks t ON n.task_id = t.id WHERE n.user_id = $1 ORDER BY n.created_at DESC', [userId]);
    return result.rows;
};

const markAsRead = async (notificationId) => {
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [notificationId]);
    return result.rows[0];
};

module.exports = {
    getNotifications,
    markAsRead,
};