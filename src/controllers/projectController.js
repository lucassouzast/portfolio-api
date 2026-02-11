

const Project = require('../models/Project');

const createProject = async (req, res) => {
    try {
        const { title, description, image, githubLink, liveUrl, technologies } = req.body;
        
        if (!title || !description || !image || !liveUrl) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
        }

        const techArray = technologies || [];


        const newProject = new Project({
            title,
            description,
            image,
            githubLink,
            liveUrl,
            technologies: techArray
        });

        await newProject.save();

        res.status(201).json(newProject);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar o projeto', error: error.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects
};


