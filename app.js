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

const apiRouter = require('./routes/api');

const cookieParser = require('cookie-parser'); // Ensure cookie-parser is installed
app.use(cookieParser());

// ** Fix: Ensure session middleware is initialized first **
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to restore cart from cookies
app.use((req, res, next) => {
    if (!req.session.user && !req.session.cart && req.cookies.cart) { // Only for non-logged-in users
        try {
            req.session.cart = JSON.parse(req.cookies.cart);
            console.log("Restored cart from cookie:", req.session.cart);
        } catch (error) {
            console.error('Error parsing cart cookie:', error);
        }
    }
    next();
});

// Save cart to cookies when user exits (only for non-logged-in users)
app.use((req, res, next) => {
    if (!req.session.user) { // Only for non-logged-in users
        res.cookie('cart', JSON.stringify(req.session.cart || []), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // Store for 30 days
            httpOnly: true,
        });
    }
    next();
});


// Middleware to parse JSON
app.use(express.json());

// Register the API routes
app.use('/api', apiRouter);

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
            title: 'Home - The Cozy Nook',
            user: req.session.user,
            categories: categoryResults // Pass categories to the template
        });
    });
});


app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - The Cozy Nook'
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
            title: 'Search Results - The Cozy Nook',
            searchResults,
            query,
            category,
        });
    });
});


app.get('/account', (req, res) => res.redirect('/register'));
app.get('/register', (req, res) => res.render('register', { title: 'Register - The Cozy Nook', message: null }));
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
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (userId) {
        // Check if item already exists in cart
        const checkQuery = `SELECT id, quantity FROM cart WHERE book_id = ? AND user_id = ?`;

        db.query(checkQuery, [book_id, userId], (checkErr, results) => {
            if (checkErr) {
                console.error('Error checking cart:', checkErr);
                return res.status(500).send('Database error');
            }

            if (results.length > 0) {
                // Item exists, update quantity
                const newQuantity = results[0].quantity + 1;
                const updateQuery = `UPDATE cart SET quantity = ? WHERE id = ?`;

                db.query(updateQuery, [newQuantity, results[0].id], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating cart:', updateErr);
                        return res.status(500).send('Database error');
                    }
                    res.redirect('/cart');
                });

            } else {
                // Item does not exist, insert new
                const insertQuery = `INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, 1)`;

                db.query(insertQuery, [userId, book_id], (insertErr) => {
                    if (insertErr) {
                        console.error('Error adding to cart:', insertErr);
                        return res.status(500).send('Database error');
                    }
                    res.redirect('cart');
                });
            }
        });

    } else {
        // Handle session-based cart
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItemIndex = req.session.cart.findIndex(item => item.book_id === book_id);
        if (existingItemIndex >= 0) {
            req.session.cart[existingItemIndex].quantity += 1;
        } else {
            req.session.cart.push({
                book_id,
                book_title,
                price: book_price ? parseFloat(book_price) || 0 : 0,
                image_url: book_image_url,
                quantity: 1,
            });
        }

        // Insert session-based cart into database
        const insertSessionQuery = `
            INSERT INTO cart (user_session_id, book_id, quantity)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE quantity = quantity + 1
        `;
        
        db.query(insertSessionQuery, [userSessionId, book_id], (err) => {
            if (err) {
                console.error('Error inserting session cart:', err);
                return res.status(500).send('Database error');
            }
            console.log('Updated database for session-based cart');
            res.redirect('cart');
        });
    }
});


app.get('/cart', (req, res) => {
    if (req.session.user) {
        const userId = req.session.user.id;
        const query = `
            SELECT 
                cart.book_id, 
                cart.quantity, 
                books.title AS book_title, 
                CAST(books.price AS DECIMAL(10,2)) AS price,
                books.image_url
            FROM cart
            JOIN books ON cart.book_id = books.id
            WHERE cart.user_id = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) return res.status(500).send('Database error');

            const cartItems = results.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0, // Ensure price is a number
                subtotal: item.quantity * (parseFloat(item.price) || 0),
            }));
            
            console.log('Cart items for logged-in user:', cartItems);
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            res.render('cart', { title: 'Your Cart', cartItems, total });
        });
    } else {
        const cartItems = (req.session.cart || []).map(item => ({
            ...item,
            price: parseFloat(item.price) || 0, // Ensure price is a number
            subtotal: item.quantity * (parseFloat(item.price) || 0),
        }));
        
        console.log('Cart items for non-logged-in user:', cartItems);
        const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        res.render('cart', { title: 'Your Cart', cartItems, total });
    }
});


app.post('/move-to-cart', (req, res) => {
    const { book_id } = req.body;
    const userId = req.session.user ? req.session.user.id : null; // Get the user ID if logged in
    const userSessionId = req.sessionID; // Get the session ID for non-logged-in users

    if (userId) {
        // For logged-in users, insert into cart and remove from wishlist
        const addToCartQuery = `
            INSERT INTO cart (user_id, book_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        `;

        const removeFromWishlistQuery = `
            DELETE FROM wish_lists
            WHERE user_id = ? AND book_id = ?
        `;

        // Find the item in the wishlist and get the correct quantity
        const getWishlistItemQuery = `
            SELECT quantity FROM wish_lists
            WHERE user_id = ? AND book_id = ?
        `;

        db.query(getWishlistItemQuery, [userId, book_id], (wishlistErr, wishlistResult) => {
            if (wishlistErr) {
                console.error(wishlistErr);
                return res.status(500).send('Error fetching wishlist item');
            }

            const itemQuantity = wishlistResult[0] ? wishlistResult[0].quantity : 1; // Default to 1 if quantity not found

            db.query(addToCartQuery, [userId, book_id, itemQuantity, itemQuantity], (addErr) => {
                if (addErr) {
                    console.error(addErr);
                    return res.status(500).send('Database error while adding to cart');
                }

                db.query(removeFromWishlistQuery, [userId, book_id], (removeErr) => {
                    if (removeErr) {
                        console.error(removeErr);
                        return res.status(500).send('Database error while removing from wishlist');
                    }

                    res.redirect('cart'); // Redirect to the cart page after moving the item
                });
            });
        });
    } else {
        // For session-based users (non-logged-in users)
        if (req.session.wishlist) {
            const itemIndex = req.session.wishlist.findIndex(item => item.book_id === book_id);
            if (itemIndex !== -1) {
                const item = req.session.wishlist.splice(itemIndex, 1)[0]; // Remove the item from the wishlist

                // Initialise the session cart if not already initialised
                req.session.cart = req.session.cart || [];

                // Check if the item already exists in the session cart
                const existingItem = req.session.cart.find(cartItem => cartItem.book_id === book_id);
                if (existingItem) {
                    existingItem.quantity += item.quantity; // Increase the quantity
                    existingItem.subtotal = existingItem.quantity * existingItem.price; // Update the subtotal
                } else {
                    req.session.cart.push(item); // Add the item to the session cart
                }

                // Remove the item from the wishlist table in the database
                const removeFromWishlistQuery = `
                    DELETE FROM wish_lists
                    WHERE user_session_id = ? AND book_id = ?
                `;
                db.query(removeFromWishlistQuery, [userSessionId, book_id], (removeErr) => {
                    if (removeErr) {
                        console.error(removeErr);
                        return res.status(500).send('Database error while removing from wishlist');
                    }

                    // Add the item to the cart table in the database, using the item's quantity from wishlist
                    const addToCartQuery = `
                        INSERT INTO cart (user_session_id, book_id, quantity)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE quantity = quantity + ?
                    `;
                    db.query(addToCartQuery, [userSessionId, book_id, item.quantity, item.quantity], (addErr) => {
                        if (addErr) {
                            console.error(addErr);
                            return res.status(500).send('Database error while adding to cart');
                        }

                        res.redirect('cart'); // Redirect to the cart page after moving the item
                    });
                });
            } else {
                res.redirect('wishlist'); // Redirect back if item not found in the wishlist
            }
        } else {
            res.redirect('wishlist'); // Redirect if wishlist is empty
        }
    }
});


// Remove item from cart
app.post('/remove-from-cart', (req, res) => {
    const { book_id } = req.body; // Get the book ID
    const userId = req.session.user ? req.session.user.id : null; // Check if user is logged in
    const userSessionId = req.sessionID; // Use session ID for non-logged-in users

    if (userId) {
        // Remove the item from the database for logged-in users
        const query = `
            DELETE FROM cart
            WHERE user_id = ? AND book_id = ?
        `;
        db.query(query, [userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('/cart'); // Redirect back to the cart page
        });
    } else {
        // Remove the item from the session cart
        if (req.session.cart) {
            req.session.cart = req.session.cart.filter(item => item.book_id !== book_id);
        }

        // Remove the item from the database for session-based carts
        const query = `
            DELETE FROM cart
            WHERE user_session_id = ? AND book_id = ?
        `;
        db.query(query, [userSessionId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('cart'); // Redirect back to the cart page
        });
    }
});


app.post('/update-cart-quantity', (req, res) => {
    const { book_id, quantity } = req.body; // Get the book ID and new quantity
    const userId = req.session.user ? req.session.user.id : null; // Check if user is logged in
    const userSessionId = req.sessionID; // Use session ID for non-logged-in users

    // Check that the quantity is valid (positive integer)
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send('Invalid quantity');
    }

    // Update for logged-in users
    if (userId) {
        // Update quantity in the database for logged-in users
        const query = `
            UPDATE cart
            SET quantity = ?
            WHERE user_id = ? AND book_id = ?
        `;
        db.query(query, [quantity, userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('/cart'); // Redirect back to the cart page
        });
    } else {
        // Update quantity in the session and the database for non-logged-in users
        if (req.session.cart) {
            const item = req.session.cart.find(item => item.book_id === book_id);
            if (item) {
                item.quantity = parseInt(quantity, 10); // Update the session cart
                item.subtotal = item.quantity * item.price; // Update subtotal
            }
        }

        // Update the database for session-based carts
        const query = `
            UPDATE cart
            SET quantity = ?
            WHERE user_session_id = ? AND book_id = ?
        `;
        db.query(query, [quantity, userSessionId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('cart'); // Redirect back to the cart page
        });
    }
});

app.post('/move-to-wishlist', (req, res) => {
    const book_id = req.body.book_id;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    console.log(`Moving book_id=${book_id} to wishlist | User ID: ${userId || 'Guest'}`);

    // 🛠 Debugging: Ensure cart exists before moving
    if (!req.session.cart || req.session.cart.length === 0) {
        console.warn('Cart is empty - Re-fetching from database...');
        
        // Fetch the cart again from the database
        const fetchCartQuery = `
            SELECT 
                cart.book_id, cart.quantity, books.title AS book_title, 
                CAST(books.price AS DECIMAL(10,2)) AS price, books.image_url 
            FROM cart 
            JOIN books ON cart.book_id = books.id 
            WHERE cart.${userId ? 'user_id' : 'user_session_id'} = ?;
        `;

        db.query(fetchCartQuery, [userId || userSessionId], (err, results) => {
            if (err) {
                console.error('Database error fetching cart:', err);
                return res.status(500).send('Database error');
            }

            // Restore the cart in session
            req.session.cart = results;
            console.log('Re-fetched cart:', req.session.cart);

            // Retry moving to wishlist after restoring cart
            moveItemToWishlist(req, res, book_id);
        });

        return; // Stop execution here and wait for DB fetch
    }

    moveItemToWishlist(req, res, book_id);
});

// Function to actually move the item
function moveItemToWishlist(req, res, book_id) {
    const itemIndex = req.session.cart.findIndex(item => String(item.book_id) === String(book_id));
    
    if (itemIndex === -1) {
        console.warn(`Item not found in cart: book_id=${book_id}`);
        return res.redirect('/cart');
    }

    // Remove from cart & add to wishlist (session)
    const item = req.session.cart.splice(itemIndex, 1)[0];

    req.session.wishlist = req.session.wishlist || [];
    const existingWishlistItem = req.session.wishlist.find(wishlistItem => String(wishlistItem.book_id) === String(book_id));
    
    if (existingWishlistItem) {
        existingWishlistItem.quantity += item.quantity;
    } else {
        req.session.wishlist.push(item);
    }

    console.log('Updated wishlist (session):', req.session.wishlist);

    // Handle database updates
    const addToWishlistQuery = `
        INSERT INTO wish_lists (${req.session.user ? 'user_id' : 'user_session_id'}, book_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `;

    const removeFromCartQuery = `
        DELETE FROM cart WHERE ${req.session.user ? 'user_id' : 'user_session_id'} = ? AND book_id = ?
    `;

    db.query(addToWishlistQuery, [req.session.user?.id || req.sessionID, book_id, item.quantity, item.quantity], (addErr) => {
        if (addErr) {
            console.error('Database error while adding to wishlist:', addErr.sqlMessage);
            return res.status(500).send('Database error');
        }

        db.query(removeFromCartQuery, [req.session.user?.id || req.sessionID, book_id], (removeErr) => {
            if (removeErr) {
                console.error('Database error while removing from cart:', removeErr.sqlMessage);
                return res.status(500).send('Database error');
            }

            console.log(`Item successfully moved to wishlist: book_id=${book_id}`);
            res.redirect('wishlist');
        });
    });
}


app.get('/wishlist', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (userId || req.session.wishlist?.length) {
        // Fetch from database if logged in, else use session
        const query = `
            SELECT 
                wish_lists.book_id, 
                wish_lists.quantity, 
                books.title AS book_title, 
                CAST(books.price AS DECIMAL(10,2)) AS price, 
                books.image_url
            FROM wish_lists
            JOIN books ON wish_lists.book_id = books.id
            WHERE wish_lists.${userId ? 'user_id' : 'user_session_id'} = ?
        `;

        db.query(query, [userId || userSessionId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            const wishlistItems = results.map(item => ({
                ...item,
                subtotal: item.quantity * item.price,
            }));

            const total = wishlistItems.reduce((sum, item) => sum + item.subtotal, 0);
            res.render('wishlist', { title: 'Your Wishlist', wishlistItems, total });
        });

    } else {
        // Guest user: use session wishlist
        const wishlistItems = (req.session.wishlist || []).map(item => ({
            ...item,
            subtotal: item.quantity * item.price,
        }));

        const total = wishlistItems.reduce((sum, item) => sum + item.subtotal, 0);
        res.render('wishlist', { title: 'Your Wishlist', wishlistItems, total });
    }
});


app.post('/update-wishlist-quantity', (req, res) => {
    const { book_id, quantity } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send('Invalid quantity');
    }

    // Update for logged-in users
    if (userId) {
        const query = `
            UPDATE wish_lists
            SET quantity = ?
            WHERE user_id = ? AND book_id = ?
        `;
        db.query(query, [quantity, userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('/wishlist');
        });
    } else {
        // Update session-based wishlist
        if (req.session.wishlist) {
            const item = req.session.wishlist.find(item => item.book_id === book_id);
            if (item) {
                item.quantity = parseInt(quantity, 10);
                item.subtotal = item.quantity * item.price;
            }
        }

        // Update database for session-based users
        const query = `
            UPDATE wish_lists
            SET quantity = ?
            WHERE user_session_id = ? AND book_id = ?
        `;
        db.query(query, [quantity, userSessionId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('wishlist');
        });
    }
});


app.post('/remove-from-wishlist', (req, res) => {
    const { book_id } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (userId) {
        const query = `
            DELETE FROM wish_lists
            WHERE user_id = ? AND book_id = ?
        `;
        db.query(query, [userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('/wishlist');
        });
    } else {
        // Update session-based wishlist
        if (req.session.wishlist) {
            req.session.wishlist = req.session.wishlist.filter(item => item.book_id !== book_id);
        }

        // Remove from database for session-based users
        const query = `
            DELETE FROM wish_lists
            WHERE user_session_id = ? AND book_id = ?
        `;
        db.query(query, [userSessionId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('wishlist');
        });
    }
});


// Checkout Page Route
app.get('/checkout', (req, res) => {
    if (req.session.user) {
        const userId = req.session.user.id;
        const query = `
            SELECT 
                cart.book_id, 
                cart.quantity, 
                books.title AS book_title, 
                CAST(books.price AS DECIMAL(10,2)) AS price,
                books.image_url
            FROM cart
            JOIN books ON cart.book_id = books.id
            WHERE cart.user_id = ?
        `;

        db.query(query, [userId], (err, results) => {
            if (err) return res.status(500).send('Database error');

            const cartItems = results.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0, 
                subtotal: item.quantity * (parseFloat(item.price) || 0),
            }));

            console.log('Cart items for logged-in user:', cartItems);
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

            res.render('checkout', { title: 'Checkout - The Cozy Nook', cart: cartItems, total, user: req.session.user });
        });

    } else {
        let cart = req.session.cart || [];
        cart = cart.map(item => ({
            ...item,
            subtotal: item.price * (item.quantity || 1),
        }));

        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        
        res.render('checkout', { title: 'Checkout - The Cozy Nook', cart, total, user: {} });
    }
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
        title: 'Order Confirmation - The Cozy Nook',
        order: order
    });
});


const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
