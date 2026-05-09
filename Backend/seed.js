const mongoose = require('mongoose');
const User = require('./models/user');
const dotenv = require('dotenv');

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
            console.log('Connected to MongoDB for seeding...')
        

        const existingUser = await User.findOne({ email: 'murithiowen1@gmail.com' });
        if (!existingUser) {
            const newUser = new User({
                name: 'Murithi Owen',
                email: 'murithiowen1@gmail.com',
                password: 'password123'
            });
            await newUser.save();
            console.log('User seeded successfully');
        } else {
            console.log('User already exists');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }};

seedUser().then(() => mongoose.disconnect());