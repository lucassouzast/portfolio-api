const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    await Project.findOne();
    res.json({ message: 'Ping recebido, cluster acordado!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no ping', error: err.message });
  }
});

module.exports = router;
