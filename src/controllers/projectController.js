const Project = require('../models/Project');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

const CLOUDINARY_DELETE_PREFIX = 'portfolio/';

const parseImagesField = (images) => {
    if (images === undefined) {
        return undefined;
    }

    let parsedImages = images;

    if (typeof parsedImages === 'string') {
        try {
            parsedImages = JSON.parse(parsedImages);
        } catch (error) {
            return null;
        }
    }

    if (!Array.isArray(parsedImages)) {
        return null;
    }

    return parsedImages
        .filter((imageItem) => imageItem && typeof imageItem === 'object')
        .map((imageItem) => ({
            imageUrl: imageItem.imageUrl,
            imagePublicId: imageItem.imagePublicId
        }))
        .filter((imageItem) => typeof imageItem.imageUrl === 'string' && imageItem.imageUrl.trim() !== '')
        .map((imageItem) => ({
            imageUrl: imageItem.imageUrl.trim(),
            imagePublicId: typeof imageItem.imagePublicId === 'string' ? imageItem.imagePublicId.trim() : undefined
        }));
};

const isSafeCloudinaryPublicId = (publicId) => {
    return typeof publicId === 'string' && publicId.startsWith(CLOUDINARY_DELETE_PREFIX);
};

const uploadFilesToCloudinary = async (files) => {
    const uploadedImages = await Promise.all(
        files.map((file) => uploadImage(file.buffer))
    );

    return uploadedImages.map((uploadedImage) => ({
        imageUrl: uploadedImage.imageUrl,
        imagePublicId: uploadedImage.publicId
    }));
};

const createProject = async (req, res) => {
    try {
        const { title, description, image, imagePublicId, images, githubLink, liveUrl, technologies, type } = req.body;

        const parsedImages = parseImagesField(images);
        if (parsedImages === null) {
            return res.status(400).json({ message: 'Campo images invalido. Use um array de objetos com imageUrl.' });
        }

        const normalizedImage = typeof image === 'string' && image.trim() !== ''
            ? image.trim()
            : undefined;

        const normalizedImagePublicId = typeof imagePublicId === 'string' && imagePublicId.trim() !== ''
            ? imagePublicId.trim()
            : undefined;

        const normalizedImages = parsedImages && parsedImages.length > 0
            ? parsedImages
            : [{ imageUrl: normalizedImage, imagePublicId: normalizedImagePublicId }];

        if (!title || !description || !normalizedImage || !type) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatorios' });
        }

        const techArray = technologies || [];

        const newProject = new Project({
            title,
            description,
            image: normalizedImage,
            imagePublicId: normalizedImagePublicId,
            images: normalizedImages,
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

const getProjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto nao encontrado' });
        }

        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar projeto', error: error.message });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, image, imagePublicId, images, githubLink, liveUrl, technologies, type } = req.body;

    try {
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto nao encontrado' });
        }

        const parsedImages = parseImagesField(images);
        if (parsedImages === null) {
            return res.status(400).json({ message: 'Campo images invalido. Use um array de objetos com imageUrl.' });
        }

        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;
        if (image !== undefined) project.image = image;
        if (imagePublicId !== undefined) project.imagePublicId = imagePublicId;
        if (parsedImages !== undefined) {
            const currentGalleryPublicIds = Array.isArray(project.images)
                ? project.images
                    .map((imageItem) => imageItem && imageItem.imagePublicId)
                    .filter((publicId) => typeof publicId === 'string' && publicId.trim() !== '')
                : [];

            const nextGalleryPublicIds = new Set(
                parsedImages
                    .map((imageItem) => imageItem && imageItem.imagePublicId)
                    .filter((publicId) => typeof publicId === 'string' && publicId.trim() !== '')
            );

            const effectiveCoverPublicId = imagePublicId !== undefined
                ? imagePublicId
                : project.imagePublicId;

            const protectedPublicIds = new Set(
                typeof effectiveCoverPublicId === 'string' && effectiveCoverPublicId.trim() !== ''
                    ? [effectiveCoverPublicId]
                    : []
            );

            const galleryPublicIdsToDelete = [...new Set(currentGalleryPublicIds)].filter((publicId) => {
                if (protectedPublicIds.has(publicId)) {
                    return false;
                }

                if (nextGalleryPublicIds.has(publicId)) {
                    return false;
                }

                return isSafeCloudinaryPublicId(publicId);
            });

            if (galleryPublicIdsToDelete.length > 0) {
                await Promise.all(
                    galleryPublicIdsToDelete.map((publicId) => deleteImage(publicId))
                );
            }

            project.images = parsedImages;
        }
        if (type !== undefined) project.type = type;
        if (githubLink !== undefined) project.githubLink = githubLink;
        if (liveUrl !== undefined) project.liveUrl = liveUrl;
        if (technologies !== undefined) project.technologies = technologies;

        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao editar o projeto', error: error.message });
    }
};

const uploadProjectImage = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                message: 'Nenhuma imagem enviada. Envie multipart/form-data com um arquivo de imagem.'
            });
        }

        const { imageUrl, publicId } = await uploadImage(req.file.buffer);

        return res.status(200).json({
            imageUrl,
            imagePublicId: publicId
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload da imagem', error: error.message });
    }
};

const uploadProjectImages = async (req, res) => {
    try {
        const files = req.files || [];

        if (!files.length) {
            return res.status(400).json({ message: 'Nenhuma imagem enviada' });
        }

        const uploadedImages = await uploadFilesToCloudinary(files);

        return res.status(200).json({
            images: uploadedImages
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload das imagens', error: error.message });
    }
};

const appendProjectImages = async (req, res) => {
    const { id } = req.params;

    try {
        const files = req.files || [];

        if (!files.length) {
            return res.status(400).json({ message: 'Nenhuma imagem enviada' });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto nao encontrado' });
        }

        const uploadedImages = await uploadFilesToCloudinary(files);

        project.images = [...(project.images || []), ...uploadedImages];

        if (!project.image && uploadedImages[0]) {
            project.image = uploadedImages[0].imageUrl;
            project.imagePublicId = uploadedImages[0].imagePublicId;
        }

        await project.save();

        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao adicionar imagens no projeto', error: error.message });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto nao encontrado' });
        }

        const publicIds = new Set();

        if (typeof project.imagePublicId === 'string' && project.imagePublicId.trim() !== '') {
            publicIds.add(project.imagePublicId);
        }

        if (Array.isArray(project.images)) {
            project.images.forEach((imageItem) => {
                if (
                    imageItem &&
                    typeof imageItem.imagePublicId === 'string' &&
                    imageItem.imagePublicId.trim() !== ''
                ) {
                    publicIds.add(imageItem.imagePublicId);
                }
            });
        }

        const deletablePublicIds = [...publicIds].filter(isSafeCloudinaryPublicId);

        if (deletablePublicIds.length > 0) {
            await Promise.all(
                deletablePublicIds.map((publicId) => deleteImage(publicId))
            );
        }

        await project.deleteOne();

        res.status(200).json({ message: 'Projeto deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar o projeto', error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    uploadProjectImage,
    uploadProjectImages,
    appendProjectImages
};
