const User = require('../models/user');
const Story = require('../models/story');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { updateUserRank, getDailyQuests, completeDailyQuest } = require('../utils/rankupdater');
const sendEmail = require('../utils/sms');
const dotenv = require('dotenv');
dotenv.config();

// ── Validators ──────────────────────────────────────────
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const normalizeEmail = (email) => email?.trim().toLowerCase();

// ── Register ────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, phone,} = req.body;

        

        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedName = name?.trim()?.toLowerCase();
        if (!trimmedName || !trimmedEmail || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        if (!validateEmail(trimmedEmail)) {
            return res.status(400).json({ message: "Invalid email" });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be 8+ chars with uppercase, lowercase, number, and special character"
            });
        }

        const existingUser = await User.findOne({ email: normalizeEmail(trimmedEmail) });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Model's pre-save hook handles hashing — do NOT hash here
        const newUser = new User({
            name: trimmedName,
            email: normalizeEmail(trimmedEmail),
            password,
            phone: phone || 0,
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// ── Login ───────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!validateEmail(trimmedEmail)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const existingUser = await User.findOne({ email: normalizeEmail(trimmedEmail) });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ── Account lock check ────────────────────────────────────
        if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
            const remainingMs = existingUser.lockUntil - Date.now();
            const minutes = Math.floor(remainingMs / 60000);
            const seconds = Math.ceil((remainingMs % 60000) / 1000);
            return res.status(423).json({
                message: `Account is locked. Please try again in ${minutes}m ${seconds}s.`,
                lockedUntil: existingUser.lockUntil
            });
        }

        // ── Password check ─────────────────────────────────────────
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            // Inline increment — avoids incrementLoginAttempts() throwing on lock (→ 500 error)
            existingUser.loginAttempts = (existingUser.loginAttempts || 0) + 1;
            if (existingUser.loginAttempts >= 5) {
                existingUser.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
                await existingUser.save();
                return res.status(423).json({
                    message: `Too many failed attempts. Account locked for 30 minutes.`,
                    lockedUntil: existingUser.lockUntil
                });
            }
            await existingUser.save();
            const attemptsLeft = 5 - existingUser.loginAttempts;
            return res.status(401).json({
                message: `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
            });
        }

        // ── Successful login: reset lock state ─────────────────────
        existingUser.loginAttempts = 0;
        existingUser.lockUntil = null;
        existingUser.lastLogin = Date.now();
        await existingUser.save();
        

        const token = jwt.sign(
            { 
                id: existingUser._id, 
                name: existingUser.name, 
                email: existingUser.email, 
                rank: existingUser.rank 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 3600000 // 1 hour
        });
        
        return res.status(200).json({ 
            message: "Login successful", 
            user: {
                name: existingUser.name,
                email: existingUser.email,
                rank: existingUser.rank,
                userId: existingUser._id
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: "Server error during login" });
    }
};
const forgetpassword_code =async (req,res)=>{
    try {
        const{email}=req.body;
            const trimmedEmail = email?.trim().toLowerCase();
        if(!validateEmail(trimmedEmail)){
            return res.status(400).json({message:"Invalid email"});
        }
        const user=await User.findOne({email:normalizeEmail(email)});
        if(user){
            const resetToken =Math.ceil(Math.random()*900000+100000).toString();
            const hashedToken = await bcrypt.hash(resetToken, 10);
            const tokenExpiry = Date.now() +5 * 60000; // 5 minutes from now
            user.resetToken=hashedToken;
            user.resetTokenExpiry=tokenExpiry;
            await user.save();
            await sendEmail(
                user.email,
                "Password Reset Code",
                `Hunter ${user.name},\n\nYour password reset code is: ${resetToken}\nThis code will expire in 5 minutes.\n\nIf you did not request a password reset, please ignore this email.`
            );
        }
        res.status(200).json({message:" a reset code has been sent to your email."});
     
    }
    catch(error){
        console.error('Forget password code error:', error.message);
        res.status(500).json({ message: "Server error during password reset" });
}
};
const resetpassword =async (req,res)=>{
    try {
        const {email,resetToken,newPassword}=req.body;
        const trimmedEmail = email?.trim().toLowerCase();
        if(!validateEmail(trimmedEmail)){
            return res.status(400).json({message:"Invalid email"});
        }
        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                message: "Password must be 8+ chars with uppercase, lowercase, number, and special character"
            });
        }
        if(!resetToken){
            return res.status(400).json({message:"Reset token is required"});
        }
        if(resetToken.length!==6){
            return res.status(400).json({message:"Invalid reset token"});
        }
        const user=await User.findOne({email:normalizeEmail(email)});
        if(!user || !user.resetToken || !user.resetTokenExpiry){
            return res.status(400).json({message:"Invalid or expired reset token"});
        }
        if(user.resetTokenExpiry < Date.now()){
            return res.status(400).json({message:"Reset token has expired"});
        }
        const isTokenValid = await bcrypt.compare(resetToken, user.resetToken);
        if(!isTokenValid){
            return res.status(400).json({message:"Invalid reset token"});
        }
        user.password=newPassword;
        user.resetToken=undefined;
        user.resetTokenExpiry=undefined;
        await user.save();
        res.status(200).json({message:"Password reset successful"});

        await sendEmail(
            user.email,
            "Password Reset Successful",
            `Hunter ${user.name},\n\nYour password has been reset successfully. If you did not perform this action, please contact support immediately.`
        );


    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: "Server error during password reset" });
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({ message: "Server error during logout" });
    }
};
// ── Get Profile ─────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const totalStories = await Story.countDocuments({ user: req.user.id });

        // Check if streak should be reset if user didn't complete quest today
        const now = new Date();
        const lastCompleted = user.dailyQuestLastCompleted;
        
        if (lastCompleted) {
            const isSameDay =
                lastCompleted.getFullYear() === now.getFullYear() &&
                lastCompleted.getMonth()    === now.getMonth()    &&
                lastCompleted.getDate()     === now.getDate();
            
            if (!isSameDay) {
                // Different day - user didn't complete quest today yet
                // Note: Streak will be reset if they miss it (handled by cron at 11:55 PM)
                // For now, just return current streak value
            }
        }

        res.status(200).json({ 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                rank: user.rank,
                totalXP: user.totalXP,
                dailyQuestStreak: user.dailyQuestStreak || 0,
                currentStreak: user.dailyQuestStreak || 0,
                totalProjectsCompleted: user.totalProjectsCompleted,
                bonusPoints: user.bonusPoints || 0,
                totalStories: totalStories,
                lastLogin: user.lastLogin
            } 
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};


const getDailyQuestsHandler = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    

        const dailyQuests = getDailyQuests();
        const now = new Date();
        const lastCompleted = user.dailyQuestLastCompleted;
        let completedToday = user.completedDailyQuestsId || [];
        if (lastCompleted) {
            const isSameDay =
                lastCompleted.getFullYear() === now.getFullYear() &&
                lastCompleted.getMonth()    === now.getMonth()    &&
                lastCompleted.getDate()     === now.getDate();

            if (isSameDay) {
                // Mark quests as completed based on user's completedDailyQuestsId
                dailyQuests.forEach(quest => {
                    if (completedToday.includes(quest.id)) {
                        quest.completed = true;
                    }
                });
            } else {
                // New day - reset completed quests
                user.completedDailyQuestsId = [];
                await user.save();
            }
        }
        const newDay = !lastCompleted || 
            lastCompleted.getFullYear() !== now.getFullYear() ||
            lastCompleted.getMonth() !== now.getMonth() ||
            lastCompleted.getDate() !== now.getDate();

        if(newDay){
            user.completedDailyQuestsId = [];
            await user.save();
        }

        // Return daily quests and minimal user info so frontend can mark completed quests
        const userSafe = {
            _id: user._id,
            name: user.name,
            email: user.email,
            completedDailyQuestsId: user.completedDailyQuestsId || [],
            dailyQuestLastCompleted: user.dailyQuestLastCompleted,
            dailyQuestStreak: user.dailyQuestStreak,
            bonusPoints: user.bonusPoints
        };

        res.status(200).json({ dailyQuests, user: userSafe });
    } catch (error) {
        console.error('Get daily quests error:', error.message);
        res.status(500).json({ message: "Server error fetching daily quests" });
    }
};


const completeDailyQuestHandler = async (req, res) => {
    try {
        const { questId } = req.body;
        if (!questId) {
            return res.status(400).json({ message: "questId is required" });
        }

        // Delegate all eligibility, streak and per-quest checks to the shared utility
        const result = await completeDailyQuest(req.user.id, questId);

        // Send email notification on successful quest completion
        if (result.success) {
            const user = await User.findById(req.user.id);
            await sendEmail(
                user.email,
                `Daily Quest Completed: ${result.quest}`,
                `Hunter ${user.name},\n\nYou completed the daily quest "${result.quest}"!\n\n+${result.pointsEarned} bonus points earned\nStreak: ${result.newStreak} day(s)\nTotal Bonus Points: ${result.totalBonusPoints}\n${result.message}\n\nKeep the streak alive, Hunter.`
            );
        }

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Complete quest error:', error.message);
        res.status(500).json({ message: error.message || "Server error completing quest" });
    }
};

const completeQuestViaMagicLink = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send("<h3>Missing token. Magic link is invalid.</h3>");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).send("<h3>Invalid or expired magic link.</h3>");
        }

        const { id: userId, questId } = decoded;
        
        // Pass userId manually instead of req.user.id
        const result = await completeDailyQuest(userId, questId);

        if (result.success) {
            const user = await User.findById(userId);
            // Optional: Send success email immediately
            await sendEmail(
                user.email,
                `Daily Quest Completed: ${result.quest}`,
                `Hunter ${user.name},\n\nYou completed the daily quest "${result.quest}" via magic link!\n\n+${result.pointsEarned} bonus points earned\nStreak: ${result.newStreak} day(s)\nTotal Bonus Points: ${result.totalBonusPoints}\n${result.message}\n\nKeep the streak alive.`
            );
            return res.send(`<h2>Quest Complete: ${result.quest}</h2><p>+${result.pointsEarned} points! Total: ${result.totalBonusPoints}</p><p>${result.message}</p>`);
        } else {
            return res.send(`<h3>Quest already completed or failed:</h3><p>${result.message}</p>`);
        }

    } catch (error) {
        console.error('Magic link completion error:', error.message);
        res.status(500).send("<h3>Server error completing quest</h3>");
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getDailyQuestsHandler,
    completeDailyQuestHandler,
    completeQuestViaMagicLink,
    logout,
    forgetpassword_code,
    resetpassword
};
