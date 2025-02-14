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
    db.query('CALL FetchCategories()', (err, categoryResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        res.render('index', { 
            title: 'Home - The Cozy Nook',
            user: req.session.user,
            categories: categoryResults[0] // Stored procedures return an array of results
        });
    });
});




app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - The Cozy Nook',
        user: req.session.user

    });
});



// Search Route
app.get('/search', (req, res) => {
    const query = req.query.query || ''; // The search term
    const category = req.query.category || 'books'; // Default category
    const likeQuery = `${query}%`; // Search for items that start with the query

    let procedureName = ''; // The stored procedure name

    if (category === 'authors') {
        procedureName = 'SearchAuthors';
    } else if (category === 'publishers') {
        procedureName = 'SearchPublishers';
    } else { // Default to books
        procedureName = 'SearchBooks';
    }



 
    db.query(`CALL ${procedureName}(?)`, [query], (err, results) => {
        if (err) return res.status(500).send('Database error');

        // Since stored procedures return results in an array, we access results[0]
        const rawResults = results[0] || [];

        // Format the results for rendering
        const searchResults = rawResults.map(item => ({
            id: item.book_id,
            title: item.book_title,
            author: item.author_name || 'Unknown Author',
            publisher: item.publisher_name || 'Unknown Publisher',
            genre: item.genre,
            image_url: `/public${item.image_url}`,
            price: parseFloat(item.price),
            type: category === 'authors' ? 'Author' : category === 'publishers' ? 'Publisher' : 'Book',
        }));

        res.render('search-results', {
            title: 'Search Results - The Cozy Nook',
            searchResults,
            query,
            category,
            user: req.session.user
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
    const query = 'CALL GetAllBooks()';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Database error');

        // Stored procedures return results inside an array
        const books = results[0];

        // Group books by genre
        const booksByGenre = books.reduce((acc, book) => {
            if (!acc[book.genre]) acc[book.genre] = [];
            acc[book.genre].push({ ...book, image_url: `public${book.image_url}` });
            return acc;
        }, {});

        res.render('shop', { title: 'Shop - The Cozy Nook', booksByGenre, user: req.session.user });
    });
});


app.get('/book/:book_id', (req, res) => {
    const bookId = req.params.book_id;
    const query = 'CALL GetBookDetails(?)';

    db.query(query, [bookId], (err, results) => {
        if (err || !results[0].length) return res.status(404).send('Book not found');

        const book = { ...results[0][0], image_url: `/public${results[0][0].image_url}` };

        res.render('book-details', { title: book.book_title, book });
    });
});



app.post('/add-to-cart', (req, res) => {
    const { book_id, book_title, book_price, book_image_url } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (userId) {
        // Check if item already exists in cart
        db.query('CALL CheckCartItem(?, ?)', [userId, book_id], (checkErr, results) => {
            if (checkErr) {
                console.error('Error checking cart:', checkErr);
                return res.status(500).send('Database error');
            }

            if (results[0].length > 0) {
                // Item exists, update quantity
                const newQuantity = results[0][0].quantity + 1;
                db.query('CALL UpdateCartItem(?, ?)', [results[0][0].id, newQuantity], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating cart:', updateErr);
                        return res.status(500).send('Database error');
                    }
                    res.redirect('cart');
                });

            } else {
                // Item does not exist, insert new
                db.query('CALL InsertCartItem(?, ?)', [userId, book_id], (insertErr) => {
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
        db.query('CALL InsertSessionCartItem(?, ?)', [userSessionId, book_id], (err) => {
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

        // Call the stored procedure
        db.query('CALL GetCartItems(?)', [userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            const cartItems = results[0].map(item => ({
                ...item,
                price: parseFloat(item.price) || 0, // Ensure price is a number
                subtotal: item.quantity * (parseFloat(item.price) || 0),
            }));

            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            res.render('cart', { title: 'Your Cart', cartItems, total, user: req.session.user });
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
        // Call stored procedure for logged-in users
        db.query('CALL MoveToCartForUser(?, ?)', [userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error while moving item to cart');
            }
            res.redirect('cart');
        });
    } else {
        // Check if item exists in session wishlist
        if (req.session.wishlist) {
            const itemIndex = req.session.wishlist.findIndex(item => item.book_id === book_id);
            if (itemIndex !== -1) {
                const item = req.session.wishlist.splice(itemIndex, 1)[0]; // Remove from wishlist
                
                // Initialize session cart if not already initialized
                req.session.cart = req.session.cart || [];

                // Check if the item already exists in the session cart
                const existingItem = req.session.cart.find(cartItem => cartItem.book_id === book_id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    existingItem.subtotal = existingItem.quantity * existingItem.price;
                } else {
                    req.session.cart.push(item);
                }

                // Call stored procedure for session-based users
                db.query('CALL MoveToCartForSession(?, ?, ?)', [userSessionId, book_id, item.quantity], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error while moving item to cart');
                    }
                    res.redirect('cart');
                });
            } else {
                res.redirect('wishlist');
            }
        } else {
            res.redirect('wishlist');
        }
    }
});


// Remove item from cart
app.post('/remove-from-cart', (req, res) => {
    const { book_id } = req.body; // Get the book ID
    const userId = req.session.user ? req.session.user.id : null; // Check if user is logged in
    const userSessionId = req.sessionID; // Use session ID for non-logged-in users

    if (userId) {
        // Remove only the selected item from the cart for logged-in users
        const query = `CALL remove_item_from_cart_logged_in(?, ?)`;
        db.query(query, [userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('cart'); // Redirect back to the cart page
        });
    } else {
        // Remove the item from the session cart
        if (req.session.cart) {
            req.session.cart = req.session.cart.filter(item => item.book_id !== book_id);
        }

        // Remove only the selected item from the cart for session-based users
        const query = `CALL remove_item_from_cart_session(?, ?)`;
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
        // Call stored procedure for logged-in users
        const query = `
            CALL update_cart_logged_in(?, ?, ?)
        `;
        db.query(query, [userId, book_id, quantity], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('/cart'); // Redirect back to the cart page
        });
    } else {
        // Update quantity in the session for non-logged-in users
        if (req.session.cart) {
            const item = req.session.cart.find(item => item.book_id === book_id);
            if (item) {
                item.quantity = parseInt(quantity, 10); // Update the session cart
                item.subtotal = item.quantity * item.price; // Update subtotal
            }
        }

        // Call stored procedure for session-based carts
        const query = `
            CALL update_cart_session_based(?, ?, ?)
        `;
        db.query(query, [userSessionId, book_id, quantity], (err) => {
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

        // Fetch the cart using the stored procedure
        db.query('CALL FetchCart(?, ?)', [userId, userSessionId], (err, results) => {
            if (err) {
                console.error('Database error fetching cart:', err);
                return res.status(500).send('Database error');
            }

            // Restore the cart in session
            req.session.cart = results[0]; // Stored procedures return an array
            console.log('Re-fetched cart:', req.session.cart);

            // Retry moving to wishlist after restoring cart
            moveItemToWishlist(req, res, book_id);
        });

        return; // Stop execution here and wait for DB fetch
    }

    moveItemToWishlist(req, res, book_id);
});

// Function to move item to wishlist using stored procedure
function moveItemToWishlist(req, res, book_id) {
    const itemIndex = req.session.cart.findIndex(item => String(item.book_id) === String(book_id));
    
    if (itemIndex === -1) {
        console.warn(`Item not found in cart: book_id=${book_id}`);
        return res.redirect('cart');
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

    // Move item to wishlist using stored procedure
    db.query('CALL MoveItemToWishlist(?, ?, ?, ?)', [req.session.user?.id, req.sessionID, book_id, item.quantity], (addErr) => {
        if (addErr) {
            console.error('Database error while adding to wishlist:', addErr.sqlMessage);
            return res.status(500).send('Database error');
        }

        // Remove item from cart using stored procedure
        db.query('CALL RemoveFromCart(?, ?, ?)', [req.session.user?.id, req.sessionID, book_id], (removeErr) => {
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

    let wishlistItems = [];
    let total = 0;

    if (userId || req.session.wishlist?.length) {
        // Fetch wishlist using the stored procedure
        db.query('CALL FetchWishlist(?, ?)', [userId, userSessionId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            wishlistItems = results[0].map(item => ({
                ...item,
                subtotal: item.quantity * item.price,
            }));

            total = wishlistItems.reduce((sum, item) => sum + item.subtotal, 0);
            
            res.render('wishlist', { title: 'Your Wishlist', wishlistItems, total, user: req.session.user });
        });

    } else {
        // Guest user: use session wishlist
        wishlistItems = (req.session.wishlist || []).map(item => ({
            ...item,
            subtotal: item.quantity * item.price,
        }));

        total = wishlistItems.reduce((sum, item) => sum + item.subtotal, 0);
        res.render('wishlist', { title: 'Your Wishlist', wishlistItems, total, user: req.session.user });
    }
});


app.post('/update-wishlist-quantity', (req, res) => {
    const { book_id, quantity } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send('Invalid quantity');
    }

    // Update session-based wishlist first (in memory)
    if (!userId && req.session.wishlist) {
        const item = req.session.wishlist.find(item => item.book_id === book_id);
        if (item) {
            item.quantity = parseInt(quantity, 10);
            item.subtotal = item.quantity * item.price;
        }
    }

    // Use stored procedure to update wishlist quantity in the database
    db.query('CALL UpdateWishlistQuantity(?, ?, ?, ?)', [userId, userSessionId, book_id, quantity], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.redirect('wishlist');
    });
});



app.post('/remove-from-wishlist', (req, res) => {
    const { book_id } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const userSessionId = req.sessionID;

    if (userId) {
        // Use stored procedure for logged-in users
        db.query('CALL RemoveFromWishlistLoggedIn(?, ?)', [userId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('wishlist');
        });
    } else {
        // Update session-based wishlist
        if (req.session.wishlist) {
            req.session.wishlist = req.session.wishlist.filter(item => item.book_id !== book_id);
        }

        // Use stored procedure for guest users
        db.query('CALL RemoveFromWishlistSession(?, ?)', [userSessionId, book_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.redirect('wishlist');
        });
    }
});


app.get('/checkout', (req, res) => {
    if (!req.session.user) {
        req.session.checkoutRedirect = true; // Set the flag for redirect after login
    }

    if (req.session.user) {
        const userId = req.session.user.id;

        // Use stored procedure to fetch cart items
        db.query('CALL FetchCartForCheckout(?)', [userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            const cartItems = results[0].map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
                subtotal: item.quantity * (parseFloat(item.price) || 0),
            }));

            console.log('Cart items for logged-in user:', cartItems);
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

            res.render('checkout', { 
                title: 'Checkout - The Cozy Nook', 
                cart: cartItems, 
                total, 
                user: req.session.user // Pass user data to the template
            });
        });
    } else {
        let cart = req.session.cart || [];
        cart = cart.map(item => ({
            ...item,
            subtotal: item.price * (item.quantity || 1),
        }));

        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        
        res.render('checkout', { 
            title: 'Checkout - The Cozy Nook', 
            cart, 
            total, 
            user: {} // No user data if not logged in
        });
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
