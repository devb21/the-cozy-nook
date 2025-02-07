const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Render Registration Page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Shelfie Spot', message: null, username: '', firstname: '', lastname: '', email: '' });
});

router.get('/login', (req, res) => {
    const redirect = req.query.redirect || '/';
    const title = 'Login Page';
    const message = req.query.message || ''; // Pass any message, or default to an empty string
    const username = req.query.username || ''; // Pass the username, default to empty if not provided

    res.render('login', { redirect, title, message, username });
});


// Register route with stored procedure
router.post('/register', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('username').matches(/^[a-zA-Z0-9]+$/).withMessage('Username must be alphanumeric'),
    body('username').isLength({ min: 2, max: 20 }).withMessage('Username must be between 2 and 20 characters'),
    body('firstname').trim().escape().notEmpty().withMessage('First name is required'),
    body('firstname').isLength({ min: 2, max: 20 }).withMessage('First name must be between 2 and 20 characters'),
    body('firstname').isAlphanumeric().withMessage('First name must be alphanumeric'),
    body('lastname').trim().escape().notEmpty().withMessage('Last name is required'),
    body('lastname').isLength({ min: 2, max: 20 }).withMessage('Last name must be between 2 and 20 characters'),
    body('lastname').isAlphanumeric().withMessage('Last name must be alphanumeric'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/).withMessage('Password must be at least 6 characters and include an uppercase letter, a number, and a special character')
], async (req, res) => {
    const errors = validationResult(req);
    const { username, firstname, lastname, email } = req.body;

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg).join('<br>');
        return res.status(400).render('register', {
            title: 'Register - Shelfie Spot',
            message: messages,
            username: username || '',
            firstname: firstname || '',
            lastname: lastname || '',
            email: email || ''
        });
    }

    try {
        // Check if username or email already exists
        const checkUserQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
        db.query(checkUserQuery, [username, email], async (err, results) => {
            if (err) {
                console.error('Error checking user existence:', err);
                return res.status(400).render('register', {
                    title: 'Register - Shelfie Spot',
                    message: 'Error checking for existing user.',
                    username,
                    firstname,
                    lastname,
                    email
                });
            }

            if (results.length > 0) {
                return res.status(400).render('register', {
                    title: 'Register - Shelfie Spot',
                    message: 'Username or email is already in use.',
                    username,
                    firstname,
                    lastname,
                    email
                });
            }

            // Proceed with user registration if no existing user
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const query = `CALL sp_register_user(?, ?, ?, ?, ?)`;

            db.query(query, [username, firstname, lastname, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(400).render('register', {
                        title: 'Register - Shelfie Spot',
                        message: err.sqlMessage || 'Database error occurred.',
                        username,
                        firstname,
                        lastname,
                        email
                    });
                }

                req.session.user = { firstname };
                res.redirect('index');
            });
        });
    } catch (error) {
        res.status(500).render('register', {
            title: 'Register - Shelfie Spot',
            message: 'Server error occurred.',
            username,
            firstname,
            lastname,
            email
        });
    }
});
 


// Login route with stored procedure
router.post('/login', [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    const { username, password } = req.body;

   
    const redirectUrl = req.body.redirect || '/';

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg).join('<br>');
        return res.render('login', { 
            title: 'Login - Shelfie Spot', 
            message: messages, 
            username 
        });
    }

    const query = `CALL sp_authenticate_user(?, ?)`;

    db.query(query, [username, null], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Database error occurred!', 
                username 
            });
        }

        if (!results || !results[0] || results[0].length === 0) {
            console.log('No user found with username/email:', username);
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        const user = results[0][0];

        if (!user || !user.password) {
            console.log('User retrieved but missing password:', user);
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Invalid username or password.', 
                username 
            });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Password does not match for user:', username);
                return res.render('login', { 
                    title: 'Login - Shelfie Spot', 
                    message: 'Invalid username or password.', 
                    username 
                });
            }

            // Store user session
            req.session.user = {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            };

            const userId = user.id;

            const updateCartSessionIdQuery = `
                UPDATE cart 
                SET user_session_id = ?
                WHERE user_id = ?;
            `;



            const updateWishlistsSessionIdQuery = `
                UPDATE wish_lists 
                SET user_session_id = ?
                WHERE user_id = ?;
            `;



            // Execute cart session update query
            db.query(updateCartSessionIdQuery, [req.sessionID, userId], (sessionErr, sessionResult) => {
                if (sessionErr) {
                    console.error('Error updating cart session ID after login:', sessionErr);
                } else {
                    console.log(`Updated session ID for cart for user ${userId}.`);
                }
            });

            // Execute wish_lists session update query separately
            db.query(updateWishlistsSessionIdQuery, [req.sessionID, userId], (sessionErr, sessionResult) => {
                if (sessionErr) {
                    console.error('Error updating wish_lists session ID after login:', sessionErr);
                } else {
                    console.log(`Updated session ID for wish_lists for user ${userId}.`);
                }
            });


            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'Strict' 
            });


            //Update cart items to assign user_id
            const updateCartQuery = `
                UPDATE cart 
                SET user_id = ?
                WHERE user_id IS NULL
            `;

            db.query(updateCartQuery, [userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating cart after login:', updateErr);
                } else {
                    console.log(`Updated ${updateResult.affectedRows} cart items for logged-in user.`);
                }

                // Merge duplicate cart items
                const mergeCartQuantityQuery = `
                    UPDATE cart c1
                    JOIN cart c2 
                    ON c1.book_id = c2.book_id 
                    AND c1.user_id = c2.user_id
                    AND c1.id > c2.id
                    SET c2.quantity = c2.quantity + c1.quantity;
                `;
            
                const deleteDuplicateCartQuery = `
                    DELETE c1 FROM cart c1
                    INNER JOIN cart c2 
                    ON c1.book_id = c2.book_id 
                    AND c1.user_id = c2.user_id 
                    AND c1.id > c2.id;
                `;
            
                // Execute the first query to merge quantities
                db.query(mergeCartQuantityQuery, (mergeErr, mergeResult) => {
                    if (mergeErr) {
                        console.error('Error merging duplicate cart item quantities:', mergeErr);
                        return;
                    }
                    console.log(`Updated quantities for ${mergeResult.affectedRows} cart items.`);
                
                    // Execute the second query to delete duplicates
                    db.query(deleteDuplicateCartQuery, (deleteErr, deleteResult) => {
                        if (deleteErr) {
                            console.error('Error deleting duplicate cart items:', deleteErr);
                            return;
                        }
                        console.log(`Removed ${deleteResult.affectedRows} duplicate cart items.`);
                    });
                });

                // Wishlist Handling Starts Here
                // Merge existing wishlist items for logged-in user
                const mergeWishlistQuery = `
                UPDATE wish_lists w1
                JOIN wish_lists w2 
                ON w1.book_id = w2.book_id 
                AND w2.user_id = ?  -- Logged-in user
                AND w1.user_id IS NULL  -- Session-based wishlist
                SET w2.quantity = w2.quantity + w1.quantity;  -- Merge quantities
            `;
            

            const deleteDuplicateWishlistQuery = `
                DELETE w1 FROM wish_lists w1
                INNER JOIN wish_lists w2 
                ON w1.book_id = w2.book_id 
                AND w1.user_id IS NULL  -- Remove only session-based duplicates
                AND w2.user_id = ?;  -- Keep only the logged-in user’s wishlist item
            `;

            const assignWishlistQuery = `
                UPDATE wish_lists
                SET user_id = ?
                WHERE user_id IS NULL;
            `;          
                        
            // Execute queries in the correct order
            db.query(mergeWishlistQuery, [userId], (mergeWishlistErr, mergeWishlistResult) => {
                if (mergeWishlistErr) {
                    console.error('Error merging wishlist items:', mergeWishlistErr);
                    return;
                }

                console.log(`Merged ${mergeWishlistResult.affectedRows} wishlist items.`);

                db.query(deleteDuplicateWishlistQuery, [userId], (deleteWishlistErr, deleteWishlistResult) => {
                    if (deleteWishlistErr) {
                        console.error('Error deleting duplicate wishlist items:', deleteWishlistErr);
                        return;
                    }
                console.log(`Removed ${deleteWishlistResult.affectedRows} duplicate wishlist items.`);


            db.query(assignWishlistQuery, [userId], (assignWishlistErr, assignWishlistResult) => {
                if (assignWishlistErr) {
                    console.error('Error assigning session wishlist to user:', assignWishlistErr);
                    return;
                }
            console.log(`Assigned ${assignWishlistResult.affectedRows} wishlist items to user.`);

            console.log("Redirect URL:", req.query.redirect); // Debugging line
            

            // Debugging: Log redirect URL
        console.log("Redirecting user to:", redirectUrl);
 
        res.redirect(redirectUrl);
            
          
            
        });
    });
});

});


        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.render('login', { 
                title: 'Login - Shelfie Spot', 
                message: 'Error comparing passwords.', 
                username 
            });
        }
    });
});



 // Function to merge guest cart with the user's cart and delete guest items

async function mergeGuestCartWithUserCart(guestCart, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Consolidate guest cart items (sum up quantities for duplicate book_ids)
            const guestCartMap = new Map();
            guestCart.forEach(item => {
                if (!item.user_id) { // Only process guest items
                    guestCartMap.set(item.book_id, (guestCartMap.get(item.book_id) || 0) + item.quantity);
                }
            });

            // Step 2: Convert guestCartMap to an array of values for bulk insert
            const cartValues = [];
            for (let [book_id, guestQuantity] of guestCartMap.entries()) {
                cartValues.push([userId, book_id, guestQuantity]);
            }

            if (cartValues.length === 0) {
                console.log("No guest cart items to merge.");
                return resolve();
            }

            // Step 3: Insert or Update (Upsert) to avoid duplicates
            const upsertQuery = `
                INSERT INTO cart (user_id, book_id, quantity) 
                VALUES ? 
                ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
            `;

            await queryAsync(upsertQuery, [cartValues]);

            // Step 4: Delete guest cart items (where user_id IS NULL) after merging
            await queryAsync(`DELETE FROM cart WHERE user_id IS NULL`);

            console.log("Guest cart successfully merged.");
            resolve();
        } catch (error) {
            console.error('Error merging guest cart:', error);
            reject(error);
        }
    });
}



        // Helper function to execute SQL queries with async/await

        function queryAsync(query, params = []) {
            return new Promise((resolve, reject) => {
                db.query(query, params, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }




        // Logout Route
        router.get('/logout', (req, res) => {
            if (req.session.user) {
                const username = req.session.user.username;
                console.log(`User ${username} logging out...`);

                // Remove only user-related cart items from session
                if (req.session.cart) {
                    // Keep only the items in the session that have no user_id (guest items)
                    req.session.cart = req.session.cart.filter(item => !item.user_id);
                    console.log("Cleared user-linked cart items from session.");
                }

                if (req.session.wishlist) {
                    // Clear user-related wishlist items in session
                    req.session.wishlist = req.session.wishlist.filter(item => !item.user_id);
                    console.log("Cleared user-linked wishlist items from session.");
                }

                // Now, destroy the session and clear the cookie
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        return res.redirect('index');
                    }

                    // Clear the cart cookie for guests
                    res.clearCookie('cart');
                    res.clearCookie('token');
                    console.log(`User ${username} logged out successfully.`);
                    res.redirect('login');
                });
            } else {
                res.redirect('login');
            }
        });




module.exports = router;
