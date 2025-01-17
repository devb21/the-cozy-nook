const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Render Registration Page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Nook', message: null, username: '', firstname: '', lastname: '', email: '' });
});

// Render Login Page
router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Login - The Cozy Nook', 
        message: null, 
        username: '' // Provide a default value for `username`
    });
});

// Register route with stored procedure
router.post('/register', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('username').matches(/^[a-zA-Z0-9]+$/).withMessage('Username must be alphanumeric'),
    body('username').isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters'),
    body('firstname').trim().escape().notEmpty().withMessage('First name is required'),
    body('firstname').isLength({ min: 2, max: 20 }).withMessage('First name must be between 2 and 20 characters'),
    body('firstname').isAlphanumeric().withMessage('First name must be alphanumeric'),
    body('lastname').trim().escape().notEmpty().withMessage('Last name is required'),
    body('lastname').isLength({ min: 2, max: 20 }).withMessage('Last name must be between 2 and 20 characters'),
    body('lastname').isAlphanumeric().withMessage('Last name must be alphanumeric'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/).withMessage('Password must be at least 6 characters and include an uppercase letter, a number, and a special character')
], async (req, res) => {
    const errors = validationResult(req);
    const { username, firstname, lastname, email } = req.body;

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg).join('<br>');
        return res.status(400).render('register', {
            title: 'Register - The Cozy Nook',
            message: messages,
            username: username || '',
            firstname: firstname || '',
            lastname: lastname || '',
            email: email || ''
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const query = `CALL sp_register_user(?, ?, ?, ?, ?)`;

        db.query(query, [username, firstname, lastname, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(400).render('register', {
                    title: 'Register - The Cozy Nook',
                    message: err.sqlMessage || 'Database error occurred.',
                    username,
                    firstname,
                    lastname,
                    email
                });
            }

            // Store user's first name in session
            req.session.user = { firstname };

            // Redirect to home page
            res.redirect('/');
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



// Login route with stored procedure
router.post('/login', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    const { username } = req.body;

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg).join('<br>');
        return res.render('login', { 
            title: 'Login - The Cozy Nook', 
            message: messages, 
            username 
        });
    }

    const { password } = req.body;

    const query = `CALL sp_authenticate_user(?, ?)`;

    db.query(query, [username, username], async (err, results) => {
        if (err) {
            console.error('Database error:', err); // Log the database error
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Database error occurred!', 
                username 
            });
        }

        console.log('Query result:', results); // Log the result to check the structure

        if (results[0].length === 0) {
            console.log('No user found with username/email:', username); // Log if no user found
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        const user = results[0][0]; // Access the first user in the first array

        console.log('User fetched from DB:', user); // Log the fetched user for debugging

        // Ensure the user has a password field
        if (!user || !user.password) {
            console.log('No password field in the user:', user);
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        // Log the fetched password for debugging
        console.log('Fetched hashed password from DB:', user.password);

        try {
            // Compare the entered password with the hashed password from DB
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Password does not match for user:', username); // Log if password doesn't match
                return res.render('login', { 
                    title: 'Login - The Cozy Nook', 
                    message: 'Invalid username or password.', 
                    username 
                });
            }

            // Store user's first name in session
            req.session.user = { firstname: user.firstname };

            // Redirect to home page
            res.redirect('/');
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.render('login', { 
                title: 'Login - The Cozy Nook', 
                message: 'Error comparing passwords.', 
                username 
            });
        }
    });
});




module.exports = router;
