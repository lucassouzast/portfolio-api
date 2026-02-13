

const Project = require('../models/Project');

const createProject = async (req, res) => {
    try {
        const { title, description, image, githubLink, liveUrl, technologies, type } = req.body;
        
        if (!title || !description || !image || !type) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
        }

        const techArray = technologies || [];


        const newProject = new Project({
            title,
            description,
            image,
            githubLink,
            liveUrl: liveUrl || undefined,
            technologies: techArray,
            type
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
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, image, githubLink, liveUrl, technologies, type } = req.body;

    try {
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado' });
        }

        if (title !== undefined ) project.title = title;
        if (description !== undefined) project.description = description;
        if (image !== undefined ) project.image = image;
        if (type !== undefined ) project.type = type;

        if (githubLink !== undefined ) project.githubLink = githubLink;
        if (liveUrl !== undefined ) project.liveUrl = liveUrl;
        if (technologies !== undefined ) project.technologies = technologies;

        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao editar o projeto', error: error.message });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Projeto não encontrado' });
        }
        res.status(200).json({ message: 'Projeto deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar o projeto', error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject
};


