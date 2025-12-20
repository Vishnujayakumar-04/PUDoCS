require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);

        const users = [
            { email: 'student@pu.edu', password: hashedPassword, role: 'Student' },
            { email: 'staff@pu.edu', password: hashedPassword, role: 'Staff' },
            { email: 'office@pu.edu', password: hashedPassword, role: 'Office' }
        ];

        console.log('⏳ Seeding users...');
        for (const userData of users) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                console.log(`+ Created ${userData.role} (${userData.email})`);
            } else {
                console.log(`- User ${userData.email} already exists`);
            }
        }

        console.log('✨ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEED ERROR:');
        console.error(error.message);
        console.log('\nTIP: If you see "Could not connect", your IP (61.2.54.87) is likely not whitelisted in MongoDB Atlas.');
        process.exit(1);
    }
};

seedUsers();
