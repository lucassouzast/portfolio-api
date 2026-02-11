const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());

const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const pingRoute = require('./routes/ping');


app.use('/ping', pingRoute);
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Could not connect to MongoDB', err));
