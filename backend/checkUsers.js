require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const users = await User.find({}, 'email role');
        console.log('Existing Users:');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
