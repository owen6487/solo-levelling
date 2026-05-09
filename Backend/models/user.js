const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
phone:{
    type:Number,
    default:0
},
email:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
profile_pic:{
    type:String,
    default:''
},
 totalXP: {
        type: Number,
        default: 0
    },
    streakDays: {
        type: Number,
        default: 0
    },
lastLogin:{
    type:Date,
    default:Date.now
},
loginAttempts:{
    type:Number,
    default:0
},
lockUntil:{
    type:Date,
    default:null
},
rank:{
    type:String,
    enum:["E","D","C","B","A","S"],
    default:"E"
},
resetToken:{
    type:String,
    default:null
},
resetTokenExpiry:{
    type:Date,
    default:null
},
totalProjectsCompleted: {
    type: Number,
    default: 0
},
bonusPoints: {
    type: Number,
    default: 0
},
dailyQuestLastCompleted: {
    type: Date,
    default: null
},
completedDailyQuestsId: {
    type: [String],
    default: []
},
dailyQuestStreak: {
    type: Number,
    default: 0
}

}, {timestamps:true});


userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.incrementLoginAttempts= async function(){
    try {
        
        if(this.lockUntil && this.lockUntil>Date.now()){
            const remainingTime = this.lockUntil - Date.now();
            throw new Error(`Account locked. Try again in ${Math.ceil(remainingTime/60000)} minutes`);
        }
        this.loginAttempts++;
        if(this.loginAttempts>=5){
            this.lockUntil = Date.now() + 30*60*1000;
            throw new Error("Too many failed attempts. Account locked for 30 minutes");
        }
        await this.save();
    } catch (error) {
        throw error;
    }
}
userSchema.methods.resetLoginAttempts = async function(){
    try {
        this.loginAttempts = 0;
        this.lockUntil = null;
        await this.save();
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model("User",userSchema);


