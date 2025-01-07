const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body;

    // Check for missing fields
    if (!username || !firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`;
    const values = [username, firstname, lastname, email, hashedPassword];

    db.query(query, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username or email already exists.' });
            }
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
});

// Login User
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check for missing fields
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password.' });
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    });
});

module.exports = router;
