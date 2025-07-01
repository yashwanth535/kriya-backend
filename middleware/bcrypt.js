const bcrypt = require('bcrypt');

// Define the number of salt rounds (more rounds = slower but more secure)
const saltRounds = 10;

// Function to hash the password before saving it to the database
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
};

// Function to compare the plain text password with the hashed password
const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (err) {
        console.error('Error comparing passwords:', err);
        throw err;
    }
};

// Export the functions to use them in other parts of your app
module.exports = {
    hashPassword,
    comparePassword
}; 