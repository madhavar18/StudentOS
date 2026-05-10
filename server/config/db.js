// config/db.js
// WHY a separate file for database connection:
// The connection logic (retry, error handling, logging) is infrastructure.
// index.js shouldn't contain infrastructure details — it just calls connect().
// If you switch from MongoDB to PostgreSQL, you change this file.
// index.js doesn't change.

const mongoose = require('mongoose');

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // These options silence deprecation warnings
        // Mongoose 6+ handles them internally but being explicit is good practice
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
        console.log(`database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        // Exit the process — if we can't connect to the database,
        // the server has no reason to run. Let the process manager restart it.
        // WHY exit(1): 0 = success, 1 = failure. Signals to the OS and
        // process managers (PM2, Docker) that the process failed abnormally.
        process.exit(1);
    }
}

// Handle connection events after initial connection
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

module.exports = connectDB;