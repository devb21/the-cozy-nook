const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
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
    res.render('index', { title: 'The Cozy Nook - Home' });
});

// Redirect 'Account' to the Register Page
app.get('/account', (req, res) => {
    res.redirect('/register');
});

// Render Registration Page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - The Cozy Nook', message: null });
});

// Handle Registration Form Submission
app.post('/register', async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body;

    if (!username || !firstname || !lastname || !email || !password) {
        return res.render('register', { 
            title: 'Register - The Cozy Nook', 
            message: 'All fields are required!' 
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`;
    const values = [username, firstname, lastname, email, hashedPassword];

    db.query(query, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.render('register', { 
                    title: 'Register - The Cozy Nook', 
                    message: 'Username or email already exists!' 
                });
            }
            return res.render('register', { 
                title: 'Register - The Cozy Nook', 
                message: 'Database error occurred!' 
            });
        }

        res.render('register', { 
            title: 'Register - The Cozy Nook', 
            message: 'User registered successfully!' 
        });
    });
});

// Render Login Page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - The Cozy Nook', message: null });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
