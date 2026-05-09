const Project = require('../models/project');
const User = require('../models/user');
const {updateUserRank}=require('../utils/rankupdater');
const sendEmail = require('../utils/sms');

const createProject=async(req,res)=>{
    try {
        const {title, description, category, xpReward, inspiration, expectedLook, status} = req.body;
        if(!title || !description){
            return res.status(400).json({message:"Title and description are required"});
        }
        const newProject = new Project({
            title,
            description,
            inspiration: inspiration || "",
            expectedLook: expectedLook || "",
            status: status || "upcoming",
            category: category || "general",
            xpReward: xpReward || 50,
            userId: req.user.id
        });
        await newProject.save();

        // Send email to user's registered email
        const user = await User.findById(req.user.id);
        await sendEmail(user.email, "New Project Created", `Hunter ${user.name},\n\nYour project "${title}" has been created!\n\nGet it done and level up, Hunter.`);

        res.status(201).json({message:"Project created successfully", project: newProject});
    } catch (error) {
        console.error('Create project error:', error.message);
        res.status(500).json({ message: "Server error creating project" });
    }
}

const getProjects=async(req,res)=>{
    try {
        const projects=await Project.find({userId:req.user.id});
        res.status(200).json({projects});
    } catch (error) {
        console.error('Get projects error:', error.message);
        res.status(500).json({ message: "Server error fetching projects" });
    }
}

const completeProject=async(req,res)=>{
    try {
        const {id}=req.params;
        const project=await Project.findById(id);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        if(project.userId.toString() !== req.user.id){
            return res.status(403).json({message:"Unauthorized to complete this project"});
        }
    
        if(project.status==="completed"){
            return res.status(400).json({message:"Project is already completed"});
        }
        const { liveUrl } = req.body || {};
        project.status = "completed";
        if (liveUrl) project.liveUrl = liveUrl;
        project.completedAt = Date.now();
        await project.save();

        // Update user XP and rank
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.totalProjectsCompleted = (user.totalProjectsCompleted || 0) + 1;
        user.totalXP = (user.totalXP || 0) + 50;
        await user.save();

        const rankResult = await updateUserRank(req.user.id);

        // Send completion email
        await sendEmail(
            user.email,
            `Project Completed: ${project.title}`,
            `Hunter ${user.name},\n\nYou completed the project "${project.title}"!\n\n+50 XP earned\nTotal Projects: ${user.totalProjectsCompleted}\nRank: ${rankResult.rankChanged ? rankResult.newRank : rankResult.currentRank}\n${rankResult.message}\n\nKeep grinding, Hunter.`
        );

        res.status(200).json({message:"Project completed successfully", xpEarned: 50, rankInfo: rankResult, completedAt: project.completedAt});
    } catch (error) {
        console.error('Complete project error:', error.message);
        res.status(500).json({ message: "Server error completing project" });
    }
}

const deleteProject=async(req,res)=>{
    try {
        const {id}=req.params;
        const project=await Project.findByIdAndDelete(id);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        res.status(200).json({message:"Project deleted successfully"});
    } catch (error) {
        console.error('Delete project error:', error.message);
        res.status(500).json({ message: "Server error deleting project" });
    }
}

module.exports={
    createProject,
    getProjects,
    completeProject,
    deleteProject
}