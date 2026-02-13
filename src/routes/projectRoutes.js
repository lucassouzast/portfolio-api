const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', getProjects);

router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject)
router.delete('/:id', authMiddleware, deleteProject)

module.exports = router;