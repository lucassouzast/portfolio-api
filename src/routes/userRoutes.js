const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const middleware = require("../middlewares/authMiddleware");

router.put("/", middleware, async (req, res) => {
  try {
    const { username, password, currentPassword } = req.body;
    if (!username && !password) {
      return res.status(400).json({
        message: "Informe username ou password para atualizar o usuário",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (username) {
      user.username = username;
    }

    if (password) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Informe a senha atual para atualizar a senha" });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao atualizar usuário", error: error.message });
  }
});

module.exports = router;




