const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Render Registration Page
router.get('register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Nook', message: null, username: '', firstname: '', lastname: '', email: '' });
});

// Render Login Page
router.get('login', (req, res) => {
    res.render('login', { 
        title: 'Login - The Cozy Nook', 
        message: null, 
        username: '' // Provide a default value for `username`
    });
});


// Register route
// Register route
router.post('/register', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('firstname').trim().escape().notEmpty().withMessage('First name is required'),
    body('lastname').trim().escape().notEmpty().withMessage('Last name is required'),
   // body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    const { username, firstname, lastname, email } = req.body; // Extract form values

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg).join('<br>');
        return res.status(400).render('register', {
            title: 'Register - The Cozy Nook',
            message: messages,
            username: username || '', // Ensure default values
            firstname: firstname || '',
            lastname: lastname || '',
            email: email || '' // Ensure email defaults to empty
        });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const query = `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`;

        db.query(query, [username, firstname, lastname, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).render('register', { 
                        title: 'Register - The Cozy Nook', 
                        message: 'Username or email already exists.',
                        username, // Preserve user inputs
                        firstname,
                        lastname,
                        email
                    });
                }
                return res.status(500).render('register', { 
                    title: 'Register - The Cozy Nook', 
                    message: 'Database error occurred.',
                    username, 
                    firstname,
                    lastname,
                    email
                });
            }

            res.status(201).render('register', { 
                title: 'Register - The Cozy Nook', 
                message: 'User registered successfully!',
                username: '', // Clear inputs on success
                firstname: '',
                lastname: '',
                email: ''
            });
        });
    } catch (error) {
        res.status(500).render('register', { 
            title: 'Register - The Cozy Nook', 
            message: 'Server error occurred.',
            username, 
            firstname,
            lastname,
            email
        });
    }
});


// Login route
router.post('/login', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    const { username } = req.body; // Get username for rendering if an error occurs

    if (!errors.isEmpty()) {
        return res.render('login', { 
            title: 'Login - The Cozy Nook', 
            message: 'Please provide both username and password.', 
            username 
        });
    }

    const { password } = req.body;
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Database error occurred!', 
                username 
            });
        }

        if (results.length === 0) {
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        res.render('login', { 
            title: 'Login - The Cozy Nook', 
            message: 'Login successful!', 
            username: '' // Clear the username on success
        });
    });
});

module.exports = router;
