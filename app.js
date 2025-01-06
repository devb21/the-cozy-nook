const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
require('dotenv').config();
const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For handling form submissions



// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Routes
app.use('/api/auth', authRoutes);


// Render Registration Page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Nook' });
});

// Render Login Page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - The Cozy Nook' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to The Cozy Nook!');
});

app.use('/public', express.static(path.join(__dirname, 'public')));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
