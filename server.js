const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/mongo');
const createAdminUser = require('./config/createAdmin');   // <-- IMPORTANT

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

// Connect DB + Create Admin
connectDB()
  .then(async () => {
    await createAdminUser();   // <-- ADMIN CREATED ON SERVER START
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection failed:', err));
