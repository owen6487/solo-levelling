const User = require('../models/user');

// ─────────────────────────────────────────────
// Rank is determined ONLY by projects completed
// Daily quests earn bonus points, NOT rank
// ─────────────────────────────────────────────

const RANK_PROJECT_THRESHOLDS = [
    { rank: 'S', min: 25 },
    { rank: 'A', min: 20 },
    { rank: 'B', min: 15 },
    { rank: 'C', min: 10 },
    { rank: 'D', min: 5  },
    { rank: 'E', min: 0  },
];

/**
 * Returns the rank for the given number of completed projects.
 * E: 0-4 | D: 5-9 | C: 10-14 | B: 15-19 | A: 20-24 | S: 25+
 */
const getRankFromProjects = (totalProjectsCompleted) => {
    for (const threshold of RANK_PROJECT_THRESHOLDS) {
        if (totalProjectsCompleted >= threshold.min) {
            return threshold.rank;
        }
    }
    return 'E';
};

/**
 * Updates the user's rank based on totalProjectsCompleted.
 * Call this whenever a user marks a project as "completed".
 * Does NOT affect bonusPoints — rank and quests are separate systems.
 */
const updateUserRank = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const currentRank = user.rank || 'E';
        const newRank = getRankFromProjects(user.totalProjectsCompleted);

        if (currentRank !== newRank) {
            user.rank = newRank;
            await user.save();
            return {
                rankChanged: true,
                oldRank: currentRank,
                newRank,
                totalProjectsCompleted: user.totalProjectsCompleted,
                message: `⚡ RANK UP! You are now Rank ${newRank}!`
            };
        }

        const nextRankInfo = getNextRankInfo(currentRank, user.totalProjectsCompleted);
        return {
            rankChanged: false,
            currentRank,
            totalProjectsCompleted: user.totalProjectsCompleted,
            ...nextRankInfo
        };
    } catch (error) {
        console.error('Error updating user rank:', error.message);
        throw error;
    }
};

/**
 * Returns how many more projects are needed to reach the next rank.
 */
const getNextRankInfo = (currentRank, totalProjectsCompleted) => {
    const nextThreshold = [...RANK_PROJECT_THRESHOLDS]
        .reverse()
        .find(t => t.rank !== currentRank && t.min > totalProjectsCompleted);

    if (!nextThreshold) {
        return { nextRank: null, projectsToNextRank: 0, message: '🏆 You have reached the highest rank: S!' };
    }

    const projectsToNextRank = nextThreshold.min - totalProjectsCompleted;
    return {
        nextRank: nextThreshold.rank,
        projectsToNextRank,
        message: `${projectsToNextRank} more project(s) until Rank ${nextThreshold.rank}`
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// DAILY QUEST SYSTEM
// Quests are real-world challenges (pushups, coding, debugging, etc.)
// Completing them earns bonusPoints to help motivate more project work.
// Quests DO NOT affect rank.
// ─────────────────────────────────────────────────────────────────────────────

// The pool of daily Solo Leveling-style quests
const DAILY_QUEST_POOL = [

  // ─── PHYSICAL (achievable, no runs) ───────────────────────────────────────
  { id: 'pushups_20',         category: 'physical', title: '20 Push-Ups',                  description: 'Bang out 20 clean push-ups. Form over speed, Hunter.',           bonusPoints: 10 },
  { id: 'pushups_30',         category: 'physical', title: '30 Push-Ups',                  description: '30 push-ups. You are stronger than yesterday.',                   bonusPoints: 12 },
  { id: 'squats_30',          category: 'physical', title: '30 Squats',                    description: 'Do 30 bodyweight squats. Build that foundation.',                 bonusPoints: 10 },
  { id: 'squats_50',          category: 'physical', title: '50 Squats',                    description: '50 squats — legs are the engine of a hunter.',                    bonusPoints: 12 },
  { id: 'plank_60sec',        category: 'physical', title: '60 Second Plank',              description: 'Hold a plank for 60 seconds. Core strength is everything.',       bonusPoints: 10 },
  { id: 'plank_90sec',        category: 'physical', title: '90 Second Plank',              description: 'Push through 90 seconds of plank. Mental and physical grit.',     bonusPoints: 15 },
  { id: 'stretch_10min',      category: 'physical', title: '10 Min Morning Stretch',       description: 'Stretch for 10 minutes after waking up. Prepare your body.',      bonusPoints: 8  },
  { id: 'walk_20min',         category: 'physical', title: '20 Minute Walk',               description: 'Step outside and walk for 20 minutes. Fresh air, clear mind.',    bonusPoints: 10 },
  { id: 'walk_30min',         category: 'physical', title: '30 Minute Walk',               description: 'A longer walk today. Movement is medicine.',                      bonusPoints: 12 },
  { id: 'situps_30',          category: 'physical', title: '30 Sit-Ups',                   description: 'Core work. 30 sit-ups, controlled and deliberate.',               bonusPoints: 10 },
  { id: 'lunges_20',          category: 'physical', title: '20 Lunges',                    description: '20 lunges (10 each leg). Balance and strength combined.',         bonusPoints: 10 },
  { id: 'jumpingjacks_50',    category: 'physical', title: '50 Jumping Jacks',             description: 'Get your blood moving with 50 jumping jacks.',                   bonusPoints: 8  },
  { id: 'no_screen_morning',  category: 'physical', title: 'No Phone First 30 Minutes',    description: 'Wake up and avoid your screen for 30 minutes. Own your morning.', bonusPoints: 10 },
  { id: 'hydrate_2L',         category: 'physical', title: 'Drink 2L of Water',            description: 'Track your water. Hit 2 litres before the day ends.',            bonusPoints: 8  },
  { id: 'sleep_7hrs',         category: 'physical', title: 'Sleep Before Midnight',        description: 'Be in bed by midnight. Recovery is part of training.',           bonusPoints: 10 },

  // ─── CODE ─────────────────────────────────────────────────────────────────
  { id: 'code_45min',         category: 'code',     title: '45 Min Focused Coding',        description: 'Code for 45 minutes with no distractions. Pure focus.',          bonusPoints: 20 },
  { id: 'debug_20min',        category: 'code',     title: '20 Min Debugging Session',     description: 'Sit with a bug for 20 minutes. Patience is a skill.',            bonusPoints: 15 },
  { id: 'refactor_one',       category: 'code',     title: 'Refactor One Function',        description: 'Find one messy function and make it clean.',                     bonusPoints: 15 },
  { id: 'learn_concept',      category: 'code',     title: 'Learn One New Concept',        description: 'Study one new coding concept and write a summary of it.',        bonusPoints: 15 },
  { id: 'push_to_github',     category: 'code',     title: 'Push to GitHub Today',         description: 'Make at least one meaningful commit and push it.',               bonusPoints: 15 },
  { id: 'read_docs_20min',    category: 'code',     title: 'Read Docs for 20 Minutes',     description: 'Read official documentation. Know your tools deeply.',           bonusPoints: 10 },
  { id: 'build_component',    category: 'code',     title: 'Build One Small Component',    description: 'Create one small UI component or utility function today.',       bonusPoints: 20 },
  { id: 'write_comments',     category: 'code',     title: 'Comment Your Code',            description: 'Go back and add clear comments to uncommented code.',           bonusPoints: 10 },
  { id: 'watch_tutorial',     category: 'code',     title: 'Watch a Dev Tutorial',         description: 'Watch one focused coding tutorial and take notes.',              bonusPoints: 12 },
  { id: 'review_yesterday',   category: 'code',     title: 'Review Yesterday\'s Code',     description: 'Look at what you wrote yesterday. Spot improvements.',          bonusPoints: 12 },
  {id:'learn_new_framework', category:'code', title:'Learn a New Framework', description:'Spend time learning the basics of a new framework or library.', bonusPoints: 20}, 
  {id:'contribute_open_source', category:'code', title:'Contribute to Open Source', description:'Make a contribution to an open source project, no matter how small.', bonusPoints: 25},
  {id:'code_review', category:'code', title:'Do a Code Review', description:'Review a pull request or code snippet and provide feedback.', bonusPoints: 15},
  {id:'learn networking', category:'code', title:'Learn Basic Networking', description:'Spend time understanding basic networking concepts like HTTP, DNS, or TCP/IP.', bonusPoints: 15},
  {id:'build_api', category:'code', title:'Build a Simple API', description:'Create a simple RESTful API using Node.js or your preferred backend technology.', bonusPoints: 25},
  {id:'optimize_code', category:'code', title:'Optimize Existing Code', description:'Take a piece of code you wrote and optimize it for performance or readability.', bonusPoints: 20},
  {id:'learn_algorithm', category:'code', title:'Learn a New Algorithm', description:'Study a new algorithm (e.g., sorting, searching) and implement it.', bonusPoints: 20},
  {id:'pair_programming', category:'code', title:'Pair Programming Session', description:'Do a pair programming session with a friend or colleague.', bonusPoints: 15},
  {id:'read_code_book', category:'code', title:'Read a Coding Book Chapter', description:'Read a chapter from a well-known coding book (e.g., Clean Code, Eloquent JavaScript).', bonusPoints: 15},
  {id:'learn_version_control', category:'code', title:'Learn Version Control Basics', description:'Spend time learning the basics of Git and version control.', bonusPoints: 15},
  {id:'build_cli_tool', category:'code', title:'Build a CLI Tool', description:'Create a simple command-line tool using Node.js or Python.', bonusPoints: 25},
  {id:'learn_testing', category:'code', title:'Learn Testing Basics', description:'Spend time learning how to write tests for your code (unit, integration, etc.).', bonusPoints: 15},
  {id:'contribute_docs', category:'code', title:'Contribute to Documentation', description:'Improve the documentation of an open source project', bonusPoints: 10},

  // ─── STUDY (broad, not just code) ─────────────────────────────────────────
  { id: 'read_30min',         category: 'study',    title: 'Read for 30 Minutes',          description: 'Read anything educational for 30 minutes. Books, articles, docs.',bonusPoints: 15 },
  { id: 'read_textbook',      category: 'study',    title: 'Read a Textbook Chapter',      description: 'Open a textbook and get through at least one chapter.',          bonusPoints: 20 },
  { id: 'flashcards_10',      category: 'study',    title: 'Review 10 Flashcards',         description: 'Go through 10 flashcards or revision questions.',               bonusPoints: 10 },
  { id: 'explain_concept',    category: 'study',    title: 'Explain a Concept Out Loud',   description: 'Teach a concept to yourself or someone else. If you can explain it, you know it.', bonusPoints: 15 },
  { id: 'solve_problems_5',   category: 'study',    title: 'Solve 5 Practice Problems',    description: 'Work through 5 exercises or past questions in any subject.',    bonusPoints: 20 },
  { id: 'make_mindmap',       category: 'study',    title: 'Create a Mind Map',            description: 'Map out a topic visually. See the big picture.',               bonusPoints: 12 },
  { id: 'watch_lecture',      category: 'study',    title: 'Watch a Lecture or Class',     description: 'Attend or watch a recorded lecture and take notes.',            bonusPoints: 20 },
  { id: 'study_sprint_25',    category: 'study',    title: 'One Pomodoro Session',         description: '25 minutes of study, no interruptions. One task only.',        bonusPoints: 15 },
  { id: 'no_social_study',    category: 'study',    title: 'Study with No Social Media',   description: 'Lock social media away for your study block today.',           bonusPoints: 12 },
    { id: 'read_research',      category: 'study',    title: 'Read a Research Paper',        description: 'Find and read a research paper in your field of interest.',     bonusPoints: 20 },
    {id:'learn communication', category:'study', title:'Learn Communication Skills', description:'Spend time learning about effective communication, whether written or verbal.', bonusPoints: 15},
    {id:'learn_productivity', category:'study', title:'Learn a New Productivity Technique', description:'Study a new productivity method (e.g., Pomodoro, time blocking) and try it out.', bonusPoints: 15},
    {id:'learn_design', category:'study', title:'Learn Basic Design Principles', description:'Spend time learning about design principles like color theory, typography, or layout.', bonusPoints: 15},
    {id:'read_biography', category:'study', title:'Read a Tech Biography', description:'Read a chapter from a biography of a notable figure in tech (e.g., Elon Musk, Ada Lovelace).', bonusPoints: 15},
    {id:'learn_new_language', category:'study', title:'Learn Basics of a New Language', description:'Spend time learning the basics of a new spoken language.', bonusPoints: 20},
    {id:'learn_new_skill', category:'study', title:'Learn the Basics of a New Skill', description:'Pick a non-coding skill (e.g., cooking, drawing) and spend time learning it.', bonusPoints: 15},
    {id:'attend_webinar', category:'study', title:'Attend a Webinar or Workshop', description:'Find and attend an online webinar or workshop in your field.', bonusPoints: 20},
    {id:'learn_history', category:'study', title:'Learn Tech History', description:'Spend time learning about the history of technology and computing.', bonusPoints: 15},
    {id:'learn_hardware', category:'study', title:'Learn Basic Hardware Concepts', description:'Study the basics of computer hardware, how components work together.', bonusPoints: 15},
  // ─── PODCAST / LEARNING ───────────────────────────────────────────────────
  { id: 'podcast_tech',       category: 'podcast',  title: 'Listen to a Tech Podcast',     description: 'Pick a tech podcast and listen to one full episode.',          bonusPoints: 12 },
  { id: 'podcast_mindset',    category: 'podcast',  title: 'Listen to a Mindset Podcast',  description: 'Feed your mind with a motivational or mindset episode.',       bonusPoints: 10 },
  { id: 'podcast_note',       category: 'podcast',  title: 'Podcast + Take One Note',      description: 'Listen to any podcast and write down one key takeaway.',       bonusPoints: 15 },
  { id: 'podcast_business',   category: 'podcast',  title: 'Business or Startup Podcast',  description: 'Learn how others are building things. One episode.',           bonusPoints: 12 },
  { id: 'podcast_science',    category: 'podcast',  title: 'Science or Math Podcast',      description: 'Explore a science, maths or engineering topic through audio.', bonusPoints: 12 },
  { id: 'podcast_walk',       category: 'podcast',  title: 'Walk While Listening',         description: 'Combine your walk with a podcast. Double the gains.',          bonusPoints: 15 },
  

  // ─── MENTAL ───────────────────────────────────────────────────────────────
  { id: 'meditate_5min',      category: 'mental',   title: '5 Min Meditation',             description: 'Sit still for 5 minutes. Breathe. Reset.',                    bonusPoints: 8  },
  { id: 'journal_today',      category: 'mental',   title: 'Write a Journal Entry',        description: 'Write freely for 5–10 minutes. Clear your head.',             bonusPoints: 10 },
  { id: 'plan_tomorrow',      category: 'mental',   title: 'Plan Tomorrow Tonight',        description: 'Before bed, write down 3 priorities for tomorrow.',           bonusPoints: 10 },
  { id: 'gratitude_3',        category: 'mental',   title: 'Write 3 Things You\'re Grateful For', description: 'Train your mind to see progress, not just problems.',  bonusPoints: 8  },
  { id: 'no_complain_day',    category: 'mental',   title: 'Zero Complaint Day',           description: 'Go the whole day without complaining. Pure hunter mentality.',bonusPoints: 15 },
  { id: 'review_week',        category: 'mental',   title: 'Weekly Self Review',           description: 'Look at your week. What went well? What needs work?',        bonusPoints: 15 },

  // ─── ENTERTAINMENT / MOVIES ───────────────────────────────────────────────
  { id: 'watch_movie',        category: 'entertainment', title: 'Watch a Movie',         description: 'Take a break. Watch a good movie. Rest is also productive.', bonusPoints: 12 },
  { id: 'watch_series',       category: 'entertainment', title: 'Watch a Series Episode', description: 'Relax with your favourite series. One episode max.',        bonusPoints: 10 },
  {id:'watch anime', category:'entertainment', title:'Watch an Anime Episode', description:'Enjoy an episode of your favourite anime. Recharge your spirit.', bonusPoints: 10},
];

/**
 * Returns today's assigned daily quests for a user (randomly selected).
 * Always returns 3 unique quests per day.
 * Quests are randomly selected from the pool to ensure variety.
 */
const getDailyQuests = () => {
    const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
};

/**
 * Marks a daily quest as completed for a user and awards bonus points.
 * A quest can only be completed once per day.
 * Completing quests DOES NOT change rank — only bonus points are awarded.
 */
const completeDailyQuest = async (userId, questId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const quest = DAILY_QUEST_POOL.find(q => q.id === questId);
        if (!quest) throw new Error(`Quest "${questId}" not found`);

        const now = new Date();
        const lastCompleted = user.dailyQuestLastCompleted;

        // Ensure completed list exists
        user.completedDailyQuestsId = user.completedDailyQuestsId || [];

        // If lastCompleted is NOT today, reset the completed list for the new day
        let isSameDay = false;
        if (lastCompleted) {
            isSameDay =
                lastCompleted.getFullYear() === now.getFullYear() &&
                lastCompleted.getMonth()    === now.getMonth()    &&
                lastCompleted.getDate()     === now.getDate();
        }

        if (!isSameDay) {
            user.completedDailyQuestsId = [];
        }

        // Prevent completing the same quest more than once in the same day
        if (user.completedDailyQuestsId.includes(questId)) {
            return {
                success: false,
                message: 'You already completed this quest today.'
            };
        }

        // Determine if this is the first completion today (affects streak bonuses)
        const isFirstCompletionToday = !isSameDay || (isSameDay && user.completedDailyQuestsId.length === 0);

        // Compute streak only when it's the first completion of the day
        let newStreak = user.dailyQuestStreak || 0;
        if (isFirstCompletionToday) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const wasYesterday = lastCompleted &&
                lastCompleted.getFullYear() === yesterday.getFullYear() &&
                lastCompleted.getMonth()    === yesterday.getMonth() &&
                lastCompleted.getDate()     === yesterday.getDate();

            newStreak = wasYesterday ? (user.dailyQuestStreak || 0) + 1 : 1;
            user.dailyQuestStreak = newStreak;
        }

        // Points: quest points always awarded; streak bonus awarded only once when first completing today
        let pointsEarned = quest.bonusPoints;
        let streakBonus = 0;
        if (isFirstCompletionToday) {
            if (newStreak > 0 && newStreak % 7 === 0) {
                streakBonus = 25;
            } else if (newStreak > 0 && newStreak % 3 === 0) {
                streakBonus = 10;
            }
        }
        pointsEarned += streakBonus;

        // Update user's completion records
        user.completedDailyQuestsId.push(questId);
        user.dailyQuestLastCompleted = now;
        user.bonusPoints = (user.bonusPoints || 0) + pointsEarned;

        await user.save();

        return {
            success: true,
            quest: quest.title,
            pointsEarned,
            streakBonus,
            newStreak: user.dailyQuestStreak,
            totalBonusPoints: user.bonusPoints,
            message: streakBonus > 0
                ? `${user.dailyQuestStreak}-day streak! +${streakBonus} bonus points!`
                : `Quest complete! +${pointsEarned} bonus points earned.`
        };

    } catch (error) {
        console.error('Error completing daily quest:', error.message);
        throw error;
    }
};

module.exports = {
    getRankFromProjects,
    updateUserRank,
    getNextRankInfo,
    getDailyQuests,
    completeDailyQuest,

};
