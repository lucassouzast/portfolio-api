const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    githubLink: {
        type: String,
    },
    liveUrl: {
        type: String,
        required: true
    },
    technologies: {
        type: [String],
    },
    type: {
        type: String,
        enum: ["completed", "learning"], 
        required: true
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
