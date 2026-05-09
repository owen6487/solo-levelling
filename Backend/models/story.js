const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    struggles: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Story", storySchema);
