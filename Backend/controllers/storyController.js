const story = require('../models/story');
const Story = require('../models/story');

const createStory = async (req, res) => {
    try {
        const { content, struggles } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Content is required for your daily story" });
        }
        
        const newStory = new Story({
            user: req.user.id,
            title: req.body.title || 'Untitled Story',
            content,
            struggles
        });
        
        await newStory.save();
        res.status(201).json({ message: "Daily story saved successfully", story: newStory });
    } catch (error) {
        console.error('Create story error:', error.message);
        res.status(500).json({ message: "Server error creating story" });
    }
};

const getStories = async (req, res) => {
    try {
        const stories = await Story.find({ user: req.user.id }).sort({ date: -1 });
        if (stories.length === 0) {
            return res.status(200).json({ message: "No stories found for this user" });
        }
        res.status(200).json({ stories });
    } catch (error) {
        console.error('Get stories error:', error.message);
        res.status(500).json({ message: "Server error fetching stories" });
    }
};
const deleteStory = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findByIdAndDelete(id);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        res.status(200).json({ message: "Story deleted successfully" });
    } catch (error) {
        console.error('Delete story error:', error.message);
        res.status(500).json({ message: "Server error deleting story" });
    }
}
module.exports = {
    createStory,
    getStories,
    deleteStory
};
 