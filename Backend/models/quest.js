const mongoose = require("mongoose");

const questSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    rank:{
        type:String,
        enum:["E","D","C","B","A","S"],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category: {
    type: String,
    enum: ["code", "study", "physical", "mental", "rest"],
    required: true
  },
  xpReward: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  dateAssigned: {
    type: Date,
    default: Date.now
  },
  dateCompleted: Date

    
});
questSchema.index({userId:1,dateAssigned:1,category:1},{unique:true});

module.exports = mongoose.model("Quest",questSchema);