const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: "15d" // Token expires in 15 days
    });
};

// Function to verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
        return null; // Invalid token
    }
};

module.exports = { generateToken, verifyToken }; 