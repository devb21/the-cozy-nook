const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const authRouter = require('./routes/auth'); // Import the auth router
const db = require('./db'); // Ensure this file correctly initializes your database connection

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Use auth routes for authentication (includes login and register)
app.use('/', authRouter);

// Homepage Route
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home - The Cozy Nook',
        user: req.session.user // Pass session user data to the template
    });
});

// Redirect 'Account' to the Register Page
app.get('/account', (req, res) => {
    res.redirect('/register');
});

// Render Registration Page
app.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register - The Cozy Nook', 
        message: null, 
        username: '', 
        firstname: '', 
        lastname: '', 
        email: '' 
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/'); // Redirect to home page after logging out
    });
});


// Use auth routes for registration and login
app.use('/auth', authRouter);




// Route for the shop page
app.get('/shop', (req, res) => {
    const query = `
        SELECT 
            books.id AS book_id,
            books.title AS book_title,
            books.genre,
            books.image_url,
            books.price,
            authors.name AS author_name,
            publisher.name AS publisher_name
        FROM books
        LEFT JOIN authors ON books.author_id = authors.id
        LEFT JOIN publisher ON books.publisher_id = publisher.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        // Organize books by genre
        const booksByGenre = results.reduce((acc, book) => {
            if (!acc[book.genre]) {
                acc[book.genre] = [];
            }

            // Ensure paths include '/public'
            const updatedBook = {
                ...book,
                image_url: `public${book.image_url}` // Prepend '/public'
            };

            acc[book.genre].push(updatedBook);
            return acc;
        }, {});

        // Render the shop page with books grouped by genre
        res.render('shop', {
            title: 'Shop - The Cozy Nook',
            booksByGenre: booksByGenre
        });
    });
});


// Route for product details page
app.get('/book/:book_id', (req, res) => {
    const bookId = req.params.book_id;

    const query = `
        SELECT 
            books.id AS book_id,
            books.title AS book_title,
            books.genre,
            books.image_url,
            books.price,
            books.summary AS book_bio,
            authors.name AS author_name,
            publisher.name AS publisher_name
        FROM books
        LEFT JOIN authors ON books.author_id = authors.id
        LEFT JOIN publisher ON books.publisher_id = publisher.id
        WHERE books.id = ?
    `;

    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).send('Book not found');
        }

        // Prepend '/public' to the image_url path
        const book = results[0];
        book.image_url = `/public${book.image_url}`;

        res.render('book-details', {
            title: book.book_title,
            book: book
        });
    });
});


app.get('/cart', (req, res) => {
    // Sample cart data (replace with your database query or session cart storage)
    const cartItems = [
        {
            id: 1,
            image_url: '/public/images/book1.jpg',
            name: 'Book Title 1',
            price: 15.99,
            quantity: 2,
            subtotal: 15.99 * 2
        },
        {
            id: 2,
            image_url: '/public/images/book2.jpg',
            name: 'Book Title 2',
            price: 9.99,
            quantity: 1,
            subtotal: 9.99
        }
    ];

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.render('cart', {
        title: 'Your Cart - The Cozy Nook',
        cartItems: cartItems,
        total: total
    });
});



// Start Server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
