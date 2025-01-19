const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const authRouter = require('./routes/auth'); 
const db = require('./db'); 

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);

app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home - The Cozy Nook',
        user: req.session.user 
    });
});

app.get('/account', (req, res) => res.redirect('/register'));
app.get('/register', (req, res) => res.render('register', { title: 'Register - Shelfie Spot', message: null }));
app.get('/logout', (req, res) => {
    req.session.destroy(err => res.redirect('/'));
});

app.use('/auth', authRouter);

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
        if (err) return res.status(500).send('Database error');
        const booksByGenre = results.reduce((acc, book) => {
            if (!acc[book.genre]) acc[book.genre] = [];
            acc[book.genre].push({ ...book, image_url: `public${book.image_url}` });
            return acc;
        }, {});
        res.render('shop', { title: 'Shop - The Cozy Nook', booksByGenre });
    });
});

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
        if (err || results.length === 0) return res.status(500).send('Book not found');
        const book = { ...results[0], image_url: `/public${results[0].image_url}` };
        res.render('book-details', { title: book.book_title, book });
    });
});

app.post('/add-to-cart', (req, res) => {
    const { book_id, book_title, book_price, book_image_url } = req.body;
    if (!req.session.cart) req.session.cart = [];
    const existingItem = req.session.cart.find(item => item.book_id === book_id);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        req.session.cart.push({
            book_id,
            book_title,
            price: parseFloat(book_price),
            quantity: 1,
            image_url: book_image_url,
            subtotal: parseFloat(book_price),
        });
    }
    res.redirect('cart');
});

app.get('/cart', (req, res) => {
    const cartItems = req.session.cart || [];
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    res.render('cart', { title: 'Your Cart - The Cozy Nook', cartItems, total });
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
