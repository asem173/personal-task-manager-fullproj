// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser, findUserByEmail, createPasswordResetToken, findUserByResetToken, updatePassword } = require('../models/userModel'); // Make sure createUser is imported
require('dotenv').config();

// Define allowed roles for registration
const ALLOWED_REGISTRATION_ROLES = ['user', 'admin']; // Only 'user' can register. 'admin' must be set manually or by an existing admin.

const register = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    // Determine the role for the new user
    let assignedRole = 'user'; // Default role if not provided or if an invalid role is provided
    if (role && ALLOWED_REGISTRATION_ROLES.includes(role.toLowerCase())) {
        assignedRole = role.toLowerCase(); // Assign if it's an allowed role
    }

    // If `role` is provided but not in ALLOWED_REGISTRATION_ROLES, it will default to 'user'.
    // This prevents users from self-registering as 'admin'.

    try {
        // Check if username already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database with the assigned role
        const newUser = await createUser({
            username,
            email,
            password_hash: hashedPassword,
            role: assignedRole // Pass the validated/assigned role
        });

        // Generate JWT token for the newly registered user
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with success message, token, and basic user info
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, username: newUser.username, role: newUser.role }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Find the user by username
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials: User not found.' });
        }

        // Compare provided password with hashed password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials: Password mismatch.' });
        }

        // Generate JWT token including user ID, username, and crucially, their role
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role }, // Include role here
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({
            token,
            message: 'Logged in successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

// Forgot password - send reset token
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        // Find user by email
        const user = await findUserByEmail(email);
        if (!user) {
            // For security reasons, don't reveal if email exists or not
            return res.status(200).json({
                message: 'If an account with this email exists, you will receive password reset instructions.'
            });
        }

        // Generate reset token and save to database
        const resetData = await createPasswordResetToken(user.id);

        // In a real application, you would send an email here
        // For now, we'll just return the reset token in the response
        // In production, this should be sent via email
        const resetToken = resetData.reset_token;

        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.status(200).json({
            message: 'If an account with this email exists, you will receive password reset instructions.',
            resetToken: resetToken // Remove this in production - only for testing
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error during password reset request.' });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        // Find user by reset token and check if it's valid and not expired
        const user = await findUserByResetToken(resetToken);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password and clear the reset token
        await updatePassword(user.id, hashedPassword);

        res.status(200).json({
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error during password reset.' });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };
