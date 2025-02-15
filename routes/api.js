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


// Get all users
router.get('/users', (req, res) => {
    const query = 'CALL GetAllUsers()';
    db.query(query, (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results[0]); // results[0] because stored procedures return a nested array
    });
});


// Get a specific user by ID
router.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    // Validate userId
    if (isNaN(userId) || userId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid user ID format');
    }

    const query = 'CALL GetUserById(?)';
    db.query(query, [userId], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        if (!results[0] || results[0].length === 0) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        sendSuccessResponse(res, results[0][0]); // Extract first result from stored procedure's nested array
    });
});


// Get all books with pagination
router.get('/books', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 books per page
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Set an upper limit to prevent large dataset queries
    if (limit > 100) return sendErrorResponse(res, 400, 'Limit cannot exceed 100 books per page.');

    const offset = (page - 1) * limit;

    const query = 'CALL GetBooks(?, ?)';
    db.query(query, [limit, offset], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results[0]); // results[0] because stored procedures return a nested array
    });
});


// Get a specific book by ID
router.get('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);

    // Validate bookId
    if (isNaN(bookId) || bookId <= 0) {
        return sendErrorResponse(res, 400, 'Invalid book ID format');
    }

    const query = 'CALL GetBookById(?)';
    db.query(query, [bookId], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        if (!results[0] || results[0].length === 0) {
            return sendErrorResponse(res, 404, 'Book not found');
        }
        sendSuccessResponse(res, results[0][0]); // results[0][0] because stored procedures return a nested array
    });
});


// Get all orders with pagination
router.get('/orders', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 orders per page
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Validate limit
    if (limit > 100) return sendErrorResponse(res, 400, 'Limit cannot exceed 100 orders per page.');

    const offset = (page - 1) * limit;

    const query = 'CALL GetOrders(?, ?)';
    db.query(query, [limit, offset], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        sendSuccessResponse(res, results[0]); // Extract first result from stored procedure's nested array
    });
});


// Place an order (POST /api/orders)
router.post('/orders', (req, res) => {
    const { userId, bookId, quantity } = req.body;

    // Validate the request body
    if (!userId || !bookId || !quantity || isNaN(quantity) || quantity <= 0) {
        return sendErrorResponse(res, 400, 'Missing or invalid fields');
    }

    const query = 'CALL PlaceOrder(?, ?, ?, @orderId); SELECT @orderId AS orderId;';
    db.query(query, [userId, bookId, quantity], (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Failed to place order');
        
        const orderId = results[1][0].orderId; // Extract the orderId from the second result set
        sendSuccessResponse(res, { orderId });
    });
});


// API to get all authors
router.get('/authors', (req, res) => {
    const query = 'CALL GetAllAuthors()';
    
    db.query(query, (err, results) => {
        if (err) return sendErrorResponse(res, 500, 'Database error');
        
        sendSuccessResponse(res, results[0]); // Extract the actual data from the results array
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



// Consolidated route to fetch book details from Google Books and Open Library APIs
router.get('/books/:id/details/all', async (req, res) => {
    const bookId = req.params.id;

    try {
        const [googleResponse, openLibraryResponse] = await Promise.all([
            axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`),
            axios.get(`https://openlibrary.org/api/volumes/brief/json/${bookId}`)
        ]);
        
        // Now proceed with processing both responses
        const googleBookData = googleResponse.data.volumeInfo;
        const openLibraryBookData = openLibraryResponse.data.records[bookId]?.data;

        if (!googleBookData && !openLibraryBookData) {
            return sendErrorResponse(res, 404, 'Book not found in both Google Books and Open Library');
        }

        // Combine both Google and Open Library data
        const combinedBookInfo = {
            title: googleBookData?.title || openLibraryBookData?.title || 'No title available',
            authors: googleBookData?.authors || openLibraryBookData?.authors || ['Unknown'],
            description: googleBookData?.description || openLibraryBookData?.description || 'No description available',
            publisher: googleBookData?.publisher || openLibraryBookData?.publishers || ['Unknown Publisher'],
            imageLinks: googleBookData?.imageLinks?.thumbnail || openLibraryBookData?.cover?.large || '/images/default.jpg'
        };

        sendSuccessResponse(res, combinedBookInfo);
    } catch (err) {
        console.error('Error fetching from external APIs:', err);
        sendErrorResponse(res, 500, 'Failed to fetch data from external APIs');
    }
});


//Fetch data from open libray api
router.get('/books/:id/details/openlibrary', async (req, res) => {
    const bookId = req.params.id;

    // Check if bookId is valid (not empty)
    if (!bookId) {
        return sendErrorResponse(res, 400, 'Invalid book ID');
    }

    try {
        // Try fetching data from Open Library using ISBN or OLID
        const response = await axios.get(`https://openlibrary.org/api/volumes/brief/json/${bookId}`);
        const bookData = response.data;

        console.log('Open Library API Response:', bookData);  // Debug log

        // Ensure the book data exists and contains the necessary information
        if (!bookData || !bookData[bookId] || !bookData[bookId].records) {
            return sendErrorResponse(res, 404, 'Book details not found from Open Library API');
        }

        // Access the first record in the 'records' object
        const bookKey = Object.keys(bookData[bookId].records)[0];
        const bookDetails = bookData[bookId].records[bookKey];

        // Ensure the book details contain data
        if (!bookDetails || !bookDetails.data) {
            return sendErrorResponse(res, 404, 'Book details not found in the response');
        }

        // Clean up the authors and publishers array if they're not empty
        const detailedBookInfo = {
            title: bookDetails.data.title || 'No title available',
            authors: bookDetails.data.authors ? bookDetails.data.authors.map(author => author.name).join(', ') : 'Unknown',
            description: bookDetails.data.description || 'No description available',
            publisher: bookDetails.data.publishers ? bookDetails.data.publishers.map(publisher => publisher.name).join(', ') : 'Unknown Publisher',
            imageLinks: bookDetails.data.cover ? bookDetails.data.cover.large : '/images/default.jpg'
        };

        sendSuccessResponse(res, detailedBookInfo);
    } catch (err) {
        console.error('Error while fetching data from Open Library API:', err);  // Debug log
        sendErrorResponse(res, 500, 'Failed to fetch data from Open Library API');
    }
});



// Fetch additional data from the Google Books API for a specific book
router.get('/books/:id/details/google', async (req, res) => {
    const bookId = req.params.id;

    // Check if bookId is valid (not empty)
    if (!bookId) {
        return sendErrorResponse(res, 400, 'Invalid book ID');
    }

    try {
        // Fetch data from Google Books API using the book ID
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const bookData = response.data;

        console.log('Google Books API Response:', bookData);  // Debug log

        // Ensure the book data exists and contains the necessary information
        if (!bookData || !bookData.volumeInfo) {
            return sendErrorResponse(res, 404, 'Book details not found from Google Books API');
        }

        // Extract necessary data from the Google Books API response
        const detailedBookInfo = {
            title: bookData.volumeInfo.title || 'No title available',
            authors: bookData.volumeInfo.authors ? bookData.volumeInfo.authors.join(', ') : 'Unknown',
            description: bookData.volumeInfo.description || 'No description available',
            publisher: bookData.volumeInfo.publisher || 'Unknown Publisher',
            pageCount: bookData.volumeInfo.pageCount || 'No page count available',
            imageLinks: bookData.volumeInfo.imageLinks?.thumbnail || '/images/default.jpg'
        };

        sendSuccessResponse(res, detailedBookInfo);
    } catch (err) {
        console.error('Error while fetching data from Google Books API:', err);  // Debug log
        sendErrorResponse(res, 500, 'Failed to fetch data from Google Books API');
    }
});


module.exports = router;
