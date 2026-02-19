const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    uploadProjectImage,
    uploadProjectImages,
    appendProjectImages
} = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const { singleImageUpload, multipleImagesUpload } = require('../middlewares/uploadMiddleware');

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/upload-image', authMiddleware, singleImageUpload('image'), uploadProjectImage);
router.post('/upload-images', authMiddleware, multipleImagesUpload('images', 10), uploadProjectImages);
router.post('/:id/upload-images', authMiddleware, multipleImagesUpload('images', 10), appendProjectImages);
router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject)
router.delete('/:id', authMiddleware, deleteProject)

module.exports = router;
