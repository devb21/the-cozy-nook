// routes/auth.js
const express = require('express');
const router = express.Router();

// Route for user login
router.post('/login', (req, res) => {
    res.send('Login route');
});

module.exports = router;
