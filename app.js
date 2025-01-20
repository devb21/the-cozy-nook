const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const authRouter = require('./routes/auth'); 
const db = require('./db'); 

const paypalRoutes = require('./routes/paypal'); // Import the PayPal routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/paypal', paypalRoutes); // Add PayPal route

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
    // Fetch the categories dynamically from the database
    const categoryQuery = `
        SELECT DISTINCT category_name AS name FROM categories;
    `;
    db.query(categoryQuery, (err, categoryResults) => {
        if (err) return res.status(500).send('Database error');

        res.render('index', { 
            title: 'Home - Shelfie Spot',
            user: req.session.user,
            categories: categoryResults // Pass categories to the template
        });
    });
});



// Search Route
app.get('/search', (req, res) => {
    const query = req.query.query || ''; // The search term
    const category = req.query.category || 'books'; // Default category
    const likeQuery = `${query}%`; // Search for items that start with the query

    let searchQuery = ''; // The SQL query to be used

    if (category === 'authors') {
        searchQuery = `
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
            WHERE authors.name LIKE ?
        `;
    } else if (category === 'publishers') {  // Update 'publisher' to 'publishers'
        searchQuery = `
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
            WHERE publisher.name LIKE ?
        `;
    } else { // Default to books
        searchQuery = `
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
            WHERE books.title LIKE ?
        `;
    }
    



    db.query(searchQuery, [likeQuery], (err, results) => {
        if (err) return res.status(500).send('Database error');

        // Format the results for rendering
        let searchResults = [];
        if (category === 'authors') {
            searchResults = results.map(author => ({
                
                id: author.book_id,
                title: author.book_title,
                author: author.author_name || 'Unknown Author',
                publisher: author.publisher_name || 'Unknown Publisher',
                genre: author.genre,
                image_url: `/public${author.image_url}`,
                price: parseFloat(author.price),
                type: 'Author',
                
               
            }));
        } else if (category === 'publishers') {
            searchResults = results.map(publisher => ({
                id: publisher.book_id,
                title: publisher.book_title,
                author: publisher.author_name || 'Unknown Author',
                publisher: publisher.publisher_name || 'Unknown Publisher',
                genre: publisher.genre,
                image_url: `/public${publisher.image_url}`,
                price: parseFloat(publisher.price),
                type: 'publisher',
                
            }));
        } else {
            // For books, include author and publisher details
            searchResults = results.map(book => ({
                id: book.book_id,
                title: book.book_title,
                author: book.author_name || 'Unknown Author',
                publisher: book.publisher_name || 'Unknown Publisher',
                genre: book.genre,
                image_url: `/public${book.image_url}`,
                price: parseFloat(book.price),
                type: 'Book',
            }));
        }

        res.render('search-results', {
            title: 'Search Results - Shelfie Spot',
            searchResults,
            query,
            category,
        });
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
        res.render('shop', { title: 'Shop - Shelfie Spot', booksByGenre });
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
    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cartItems = req.session.cart || [];
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    res.render('cart', { title: 'Your Cart - Shelfie Spot', cartItems, total });
});

// Checkout Page Route
app.get('/checkout', (req, res) => {
    const cart = req.session.cart || []; // Retrieve cart from session
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    res.render('checkout', {
        title: 'Checkout - Shelfie Spot',
        cart: cart,
        total: total,
        user: req.session.user || {} // Include user details if logged in
    });
});

// Handle order placement
app.post('/place-order', (req, res) => {
    const { firstname, lastname, address, city, postcode, phone, email } = req.body;

    // Simulate saving order details (replace with actual database code)
    const order = {
        user: { firstname, lastname, address, city, postcode, phone, email },
        cart: req.session.cart || [],
        total: req.session.cart.reduce((sum, item) => sum + item.subtotal, 0),
        date: new Date()
    };

    console.log('Order placed:', order);

    // Clear the cart after order placement
    req.session.cart = [];

    // Redirect to a confirmation page or show a success message
    res.render('order-confirmation', {
        title: 'Order Confirmation - Shelfie Spot',
        order: order
    });
});


const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
