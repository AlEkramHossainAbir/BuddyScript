const mongoose = require("mongoose")

const ConnectDb = async (url) => {
    // Ensure URL is provided (no fallback)
    if (!url) {
        console.error("CRITICAL: Database URL is required but not provided");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(url)
        console.log("✓ Successfully connected to MongoDB")
    } catch (err) {
        console.error("✗ Error connecting to MongoDB:", err.message)
        process.exit(1) // Exit if database connection fails
    }
}

module.exports = {ConnectDb}