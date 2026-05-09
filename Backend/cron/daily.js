const cron = require('node-cron');
const User = require('../models/user');
const { getDailyQuests } = require('../utils/rankupdater');
const sendEmail = require('../utils/sms');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
    try {
        console.log("Running 6 AM Daily Quest Cron Job...");
        const users = await User.find({ email:process.env.EMAIL_USER}); // Assuming we send to active users, or just all users
        if (!users) {
            // Fallback for this solo project
            console.log("no hunter found")
            return;
        }

        const dailyQuests = getDailyQuests();
        const appUrl = process.env.APP_URL || 'http://localhost:5000';

        // Send to each user
        for (const user of users) {
            // Generate magic links for each quest
            const formattedQuests = dailyQuests.map((q, i) => {
                const token = jwt.sign({ id: user._id, questId: q.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                const magicLink = `${appUrl}/api/users/quest/complete-magic?token=${token}`;
                return `${i + 1}. [${q.category.toUpperCase()}] ${q.title}\n   ${q.description}\n   Reward: +${q.bonusPoints} bonus points\n   Click to complete: ${magicLink}`;
            }).join('\n\n');

            const message = `Good morning Hunter ${user.name}!\n\nHere are your daily quests:\n\n${formattedQuests}\n\nComplete them to earn bonus points and level up!`;

            await sendEmail(user.email, "Today's Daily Quests (Solo Levelling)", message);
            console.log("Daily quests sent to", user.name || user.email);
        }
    } catch (error) {
        console.error("Error running daily quests cron job:", error.message);
    }
});

// Run every day at 23:55 (11:55 PM) to check for failed daily quests
cron.schedule('55 23 * * *', async () => {
    try {
        console.log("Running 11:55 PM Penalty Cron Job...");
        // Removing { isActive: true } because it doesn't exist in the schema
        const targetUsers = await User.find({});
        if (!targetUsers || targetUsers.length === 0) return;
        
        const now = new Date();
        for (const user of targetUsers) {
             const lastCompleted = user.dailyQuestLastCompleted;
             let failedToday = true;
             
             if (lastCompleted) {
                 const isSameDay =
                     lastCompleted.getFullYear() === now.getFullYear() &&
                     lastCompleted.getMonth()    === now.getMonth()    &&
                     lastCompleted.getDate()     === now.getDate();
                 if (isSameDay) {
                     failedToday = false;
                 }
             }
             
             if (failedToday) {
                 // Penalty: -10 points and reset streak
                 user.bonusPoints = Math.max(0, (user.bonusPoints || 0) - 10);
                 user.dailyQuestStreak = 0;
                 await user.save();
                 
                 const message = `Hunter ${user.name || 'Player'},\n\nYou failed to complete a daily quest today. The system does not tolerate weakness.\n\nPenalty: -10 points.\nStreak reset to 0.\n\nTotal points: ${user.bonusPoints}\n\nBe better tomorrow.`;
                 await sendEmail(user.email, "System Warning: Daily Quest Failed", message);
                 console.log(`Penalty applied to ${user.name || user.email}`);
             }
        }
    } catch (error) {
        console.error("Error running penalty cron job:", error.message);
    }
});
