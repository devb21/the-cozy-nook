const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
const path = require('path');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For handling form submissions


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to The Cozy Nook!');
});

// Render Registration Page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Book', message: null });
});

// Handle Registration Form Submission
app.post('/register', async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body;

    // Validate form input
    if (!username || !firstname || !lastname || !email || !password) {
        return res.render('register', { 
            title: 'Register - The Cozy Book', 
            message: 'All fields are required!' 
        });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`;
        const values = [username, firstname, lastname, email, hashedPassword];

        db.query(query, values, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.render('register', { 
                        title: 'Register - The Cozy Book', 
                        message: 'Username or email already exists!' 
                    });
                }
                return res.render('register', { 
                    title: 'Register - The Cozy Book', 
                    message: 'Database error occurred!' 
                });
            }

            // Successful registration
            res.render('register', { 
                title: 'Register - The Cozy Book', 
                message: 'User registered successfully!' 
            });
        });
    } catch (error) {
        res.render('register', { 
            title: 'Register - The Cozy Book', 
            message: 'Error processing your request. Please try again.' 
        });
    }
});

// Render Login Page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - The Cozy Book', message: null });
});

// Handle Login Form Submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate form input
    if (!username || !password) {
        return res.render('login', { 
            title: 'Login - The Cozy Book', 
            message: 'Both fields are required!' 
        });
    }

    // Check if user exists in the database
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Database error occurred!' 
            });
        }

        if (results.length === 0) {
            return res.render('login', { 
                title: 'Login - The Cozy Book', 
                message: 'Invalid username or password.' 
            });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login - The Cozy Book', 
                message: 'Invalid username or password.' 
            });
        }

        // Successful login
        res.render('login', { 
            title: 'Login - The Cozy Book', 
            message: 'Login successful!' 
        });
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
