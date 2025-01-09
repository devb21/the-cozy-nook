const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Homepage Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Shelfie Spot - Home' });
});

// Redirect 'Account' to the Register Page
app.get('/account', (req, res) => {
    res.redirect('/register');
});

// Render Registration Page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Shelfie Spot', message: null });
});

// Handle Registration Form Submission
app.post('/register', async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body;

    // Validate input
    if (!username || !firstname || !lastname || !email || !password) {
        return res.render('register', { 
            title: 'Register - Shelfie Spot', 
            message: 'All fields are required!' 
        });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into MySQL
        const query = `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`;
        const values = [username, firstname, lastname, email, hashedPassword];

        db.query(query, values, (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.render('register', { 
                        title: 'Register - Shelfie Spot', 
                        message: 'Username or email already exists!' 
                    });
                }
                return res.render('register', { 
                    title: 'Register - Shelfie Spot', 
                    message: 'Database error occurred!' 
                });
            }
            res.render('register', { 
                title: 'Register - Shelfie Spot', 
                message: 'User registered successfully!' 
            });
        });
    } catch (error) {
        console.error(error);
        res.render('register', { 
            title: 'Register - Shelfie Spot', 
            message: 'An error occurred during registration.' 
        });
    }
});

// Render Login Page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Shelfie Spot', message: null });
});

// Handle Login Form Submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.render('login', { 
            title: 'Login - Shelfie Spot', 
            message: 'Please provide both username and password.' 
        });
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Database error occurred!' 
            });
        }

        if (results.length === 0) {
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Invalid username or password.' 
            });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Invalid username or password.' 
            });
        }

        res.render('login', { 
            title: 'Login - Shelfie Spot', 
            message: 'Login successful!' 
        });
    });
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
