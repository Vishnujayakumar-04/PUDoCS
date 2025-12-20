const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('CRITICAL: MongoDB Connection Error');
        console.error(error.message);
        console.log('TIP: Check if your IP is whitelisted in MongoDB Atlas.');
    }
};

module.exports = connectDB;
