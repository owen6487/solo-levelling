const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/ratelimeter');
require('./cron/daily');

// Load env vars
dotenv.config();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set in environment variables!');
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({origin: ['http://localhost:3000','http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']}));  

app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Apply global rate limiter to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({
        message: "Solo Levelling System — API is running",
        endpoints: {
            users: '/api/users',
            projects: '/api/projects'
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Solo Levelling server running on port ${PORT}`);
});
