const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        default: "general"
    },
    xpReward: {
        type: Number,
        default: 50
    },
    inspiration: {
        type: String,
        default: ""
    },
    expectedLook: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["upcoming", "pending", "completed"],
        default: "upcoming"
    },
    liveUrl: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);