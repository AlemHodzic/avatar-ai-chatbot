
// config.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3000
}


