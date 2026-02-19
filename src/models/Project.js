const mongoose = require("mongoose");

const projectImageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    imagePublicId: {
        type: String
    }
}, { _id: false });

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
    imagePublicId: {
        type: String
    },
    images: {
        type: [projectImageSchema],
        default: []
    },
    githubLink: {
        type: String,
    },
    liveUrl: {
        type: String,
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
