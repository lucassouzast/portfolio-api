require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado");

    const existingUser = await User.findOne({ username: "admin" });

    if (existingUser) {
      console.log("Usuário admin já existe");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("99706879", 10);

    const admin = new User({
      username: "admin",
      password: hashedPassword,
    });

    await admin.save();

    console.log("Admin criado com sucesso");
    process.exit();
  } catch (err) {
    console.error("Erro ao criar admin:", err);
    process.exit(1);
  }
};

createAdmin();
