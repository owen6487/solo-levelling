const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter, authLimiter, passwordResetLimiter } = require('../middleware/ratelimeter');
const {
    register,
    login,
    logout,
    getProfile,
    getDailyQuestsHandler,
    completeDailyQuestHandler,
    resetpassword,
    forgetpassword_code
} = require('../controllers/usercontraller');

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgetpassword', passwordResetLimiter, forgetpassword_code);
router.post('/resetpassword', passwordResetLimiter, resetpassword);

// Protected routes (require JWT)
router.post('/logout', authMiddleware, logout);
router.get('/quest/complete-magic', require('../controllers/usercontraller').completeQuestViaMagicLink);

// Protected routes (require JWT)
router.get('/profile', authMiddleware, getProfile);
router.get('/daily-quests', authMiddleware, getDailyQuestsHandler);
router.post('/complete-quest', authMiddleware, completeDailyQuestHandler);

module.exports = router;
