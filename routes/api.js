const express = require('express');
const axios = require('axios'); // Ensure axios is installed
const cors = require('cors');  // Enable CORS for cross-origin requests
const db = require('../db');    // Assuming db is set up for your database connection
const rateLimit = require('express-rate-limit'); // For rate limiting

const router = express.Router();

// Helper function to send consistent error responses
function sendErrorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
        status: 'error',
        message: message
    });
}

// Helper function to send success responses
function sendSuccessResponse(res, data) {
    return res.json({
        status: 'success',
        data: data
    });
}

// Enable CORS for all routes
router.use(cors());

// Rate limiting middleware to prevent abuse of API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

// Apply rate limiting to all routes
router.use(limiter);

// Get all books with pagination
router.get('/books', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 books per page
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Set an upper limit to prevent large dataset queries
    if (limit > 100) return sendErrorResponse(res, 400, 'Limit cannot exceed 100 books per page.');

    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM books LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results);
    });
});

// Get a specific book by ID
router.get('/books/:id', (req, res) => {
    const bookId = req.params.id;

    // Check if bookId is a valid number
    if (isNaN(bookId) || bookId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid book ID format');
    }

    const query = 'SELECT * FROM books WHERE id = ?';
    db.query(query, [bookId], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        if (results.length === 0) {
            return sendErrorResponse(res, 404, 'Book not found');
        }
        sendSuccessResponse(res, results[0]);
    });
});

// Get all orders with pagination
router.get('/orders', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 orders per page
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Set an upper limit to prevent large dataset queries
    if (limit > 100) return sendErrorResponse(res, 400, 'Limit cannot exceed 100 orders per page.');

    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM orders LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results);
    });
});

// Get a specific user by ID
router.get('/users/:id', (req, res) => {
    const userId = req.params.id;

    // Check if userId is a valid number and greater than 0
    if (isNaN(userId) || userId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid user ID format');
    }

    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        if (results.length === 0) return sendErrorResponse(res, 404, 'User not found');
        sendSuccessResponse(res, results[0]);
    });
});

// Fetch additional data from the Google Books API for a specific book
router.get('/books/:id/details', async (req, res) => {
    const bookId = req.params.id;

    // Check if bookId is a valid number
    if (isNaN(bookId) || bookId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid book ID format');
    }

    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const bookData = response.data;

        // Check if data exists
        if (!bookData || !bookData.volumeInfo) {
            return sendErrorResponse(res, 404, 'Book details not found from Google Books API');
        }

        // Extract necessary data from the response
        const detailedBookInfo = {
            title: bookData.volumeInfo.title || 'No title available',
            authors: bookData.volumeInfo.authors || ['Unknown'],
            description: bookData.volumeInfo.description || 'No description available',
            publisher: bookData.volumeInfo.publisher || 'Unknown Publisher',
            pageCount: bookData.volumeInfo.pageCount,
            imageLinks: bookData.volumeInfo.imageLinks?.thumbnail || '/images/default.jpg'
        };

        sendSuccessResponse(res, detailedBookInfo);
    } catch (err) {
        console.error('Error while fetching data from Google Books API:', err);
        sendErrorResponse(res, 500, 'Failed to fetch data from Google Books API');
    }
});

// Fetch additional data from Open Library API for a specific book
router.get('/books/:id/details/openlibrary', async (req, res) => {
    const bookId = req.params.id;

    // Check if bookId is a valid number
    if (isNaN(bookId) || bookId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid book ID format');
    }

    try {
        const response = await axios.get(`https://openlibrary.org/api/volumes/brief/json/${bookId}`);
        const bookData = response.data;

        if (!bookData || !bookData.records) {
            return sendErrorResponse(res, 404, 'Book details not found from Open Library API');
        }

        const detailedBookInfo = {
            title: bookData.records[bookId].data.title || 'No title available',
            authors: bookData.records[bookId].data.authors || ['Unknown'],
            description: bookData.records[bookId].data.description || 'No description available',
            publisher: bookData.records[bookId].data.publishers || ['Unknown Publisher'],
            imageLinks: bookData.records[bookId].data.cover ? bookData.records[bookId].data.cover.large : '/images/default.jpg'
        };

        sendSuccessResponse(res, detailedBookInfo);
    } catch (err) {
        console.error('Error while fetching data from Open Library API:', err);
        sendErrorResponse(res, 500, 'Failed to fetch data from Open Library API');
    }
});

// Place an order (POST /api/orders)
router.post('/orders', (req, res) => {
    const { userId, bookId, quantity } = req.body;

    // Validate the request body
    if (!userId || !bookId || !quantity || isNaN(quantity) || quantity <= 0) {
        return sendErrorResponse(res, 400, 'Missing or invalid fields');
    }

    const query = 'INSERT INTO orders (user_id, book_id, quantity) VALUES (?, ?, ?)';
    db.query(query, [userId, bookId, quantity], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Failed to place order');
        sendSuccessResponse(res, { orderId: results.insertId });
    });
});


// API to get all authors
router.get('/authors', (req, res) => {
    const query = 'SELECT * FROM authors';
    db.query(query, (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results);
    });
});

// Fetch additional data from the Google Books API for a specific book
// Fetch additional data from the Google Books API for a specific book
router.get('/books/:id/details/google', async (req, res) => {
    const bookId = req.params.id;

    // Remove the numeric check since Google Books API uses alphanumeric book IDs
    if (!bookId) {
        return sendErrorResponse(res, 400, 'Invalid book ID');
    }

    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const bookData = response.data;

        // If Google Books API doesn't return any data, return fictional book details
        if (!bookData || !bookData.volumeInfo) {
            const fictionalBookInfo = {
                title: 'Fictional Book Title',
                authors: ['Fictional Author'],
                description: 'This is a description of a fictional book.',
                publisher: 'Fictional Publisher',
                pageCount: 250,
                imageLinks: '/images/default.jpg' // Placeholder image
            };
            return sendSuccessResponse(res, fictionalBookInfo);
        }

        // Extract necessary data from the Google Books API response
        const detailedBookInfo = {
            title: bookData.volumeInfo.title || 'No title available',
            authors: bookData.volumeInfo.authors || ['Unknown'],
            description: bookData.volumeInfo.description || 'No description available',
            publisher: bookData.volumeInfo.publisher || 'Unknown Publisher',
            pageCount: bookData.volumeInfo.pageCount,
            imageLinks: bookData.volumeInfo.imageLinks?.thumbnail || '/images/default.jpg'
        };

        sendSuccessResponse(res, detailedBookInfo);
    } catch (err) {
        console.error(err);
        sendErrorResponse(res, 500, 'Failed to fetch data from Google Books API');
    }
});



module.exports = router;
