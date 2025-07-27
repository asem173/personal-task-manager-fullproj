const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.getNotifications(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const notification = await notificationModel.markAsRead(notificationId);
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
};