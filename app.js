const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();
const authRouter = require('./routes/auth'); // Import the auth router

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


// Use auth routes for authentication (includes login and register)
app.use('/', authRouter);


// Homepage Route
app.get('/', (req, res) => {
    res.render('index', { title: 'The Cozy Nook - Home' });
});

// Redirect 'Account' to the Register Page
app.get('/account', (req, res) => {
    res.redirect('/register');
});

// Render Registration Page
app.get('register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Nook', message: null, username: '', firstname: '', lastname: '', email: '' });
});

// Use auth routes for registration and login
app.use('/auth', authRouter);

// Start Server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
