const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    if(!JWT_SECRET) {
      return res.status(500).json({ message: 'JWT NAO DEFINIDO' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    )
    res.json({ token });
  }  catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
