const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createStory, getStories ,deleteStory} = require('../controllers/storyController');

router.post('/', authMiddleware, createStory);
router.get('/', authMiddleware, getStories);
router.delete('/:id', authMiddleware, deleteStory);
module.exports = router;
