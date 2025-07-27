const pool = require('../config/db');
const crypto = require('crypto');

async function findUserByUsername(username) {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
}

async function findUserByEmail(email) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
}

async function createUser({ username, email, password_hash, role = 'user' }) {
    const res = await pool.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
        [username, email, password_hash, role]
    );
    return res.rows[0];
}

// Get all users (admin only)
const getAllUsers = async () => {
    const result = await pool.query('SELECT id, username, email, role FROM users');
    return result.rows;
};

// Get user profile by ID
const getUserById = async (id) => {
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

// Update user profile
const updateUser = async (id, data) => {
    const { username, email, role } = data;
    const result = await pool.query(
        'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role',
        [username, email, role, id]
    );
    return result.rows[0];
};

// Password reset functions
const createPasswordResetToken = async (userId) => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    const result = await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3 RETURNING id, email',
        [resetToken, resetTokenExpiry, userId]
    );
    return result.rows[0];
};

const findUserByResetToken = async (resetToken) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [resetToken]
    );
    return result.rows[0];
};

const updatePassword = async (userId, newPasswordHash) => {
    const result = await pool.query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2 RETURNING id, username, email',
        [newPasswordHash, userId]
    );
    return result.rows[0];
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    findUserByUsername,
    findUserByEmail,
    createUser,
    createPasswordResetToken,
    findUserByResetToken,
    updatePassword
};
