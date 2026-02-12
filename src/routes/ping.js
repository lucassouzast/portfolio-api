const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('ERROR');
  }
});

module.exports = router;
