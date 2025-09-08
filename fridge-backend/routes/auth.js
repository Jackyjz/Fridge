const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex for validation

  if (!emailRegex.test(email)) { // checks if a string matches the pattern defined by the regex
    return res.status(400).json({ error: 'Email is not valid' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// GET /auth/users
router.get('/users', async (req, res) => {
  const users = await User.find({}, 'email'); // Only return email field
  res.json(users);
});

module.exports = router;
