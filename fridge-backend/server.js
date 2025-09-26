const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/items');

app.use('/items', itemRoutes);
// Load .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

// Health route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState

    });

});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
