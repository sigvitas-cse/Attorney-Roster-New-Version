const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../models/guiestlogin");
const Data = require("../models/NewProfile");
const auth = require('../middleware/auth');

router.post('/guiestlogin', async (req, res) => {
  console.log('Now inside guiestlogin route', req.body);
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Reject bcrypt hash-like passwords
    if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
      console.log(`Invalid password format for email: ${email}`);
      return res.status(400).json({ message: 'Invalid password format' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.accessRevoked) {
      console.log(`Access revoked for user: ${email}`);
      return res.status(403).json({ message: 'Access revoked' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'TOKEN_ABC123DARSHAN', { expiresIn: '1h' });
    user.activityLog.push({ action: 'login', timestamp: new Date() });
    await user.save();

    console.log(`Login successful for user: ${email}`);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/validate-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.accessRevoked) {
      return res.status(401).json({ message: 'Invalid or revoked token' });
    }
    res.status(200).json({ valid: true });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/guiestdata', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.accessRevoked) {
      console.log(`Access revoked for user ID: ${req.user.userId}`);
      return res.status(403).json({ message: 'Access revoked' });
    }
    const page = parseInt(req.query.page) || user.currentPage;
    if (page < user.currentPage) {
      user.accessRevoked = true;
      user.activityLog.push({ action: 'attempted_previous_page', page, timestamp: new Date() });
      await user.save();
      console.log(`Access revoked for user ID: ${req.user.userId} due to previous page attempt`);
      return res.status(403).json({ message: 'Access revoked' });
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    const data = await Data.find().skip(skip).limit(limit);
    user.currentPage = page;
    user.activityLog.push({ action: 'view_page', page, timestamp: new Date() });
    await user.save();
    console.log(`Data fetched for user ID: ${req.user.userId}, page: ${page}`);
    res.json({ data });
  } catch (err) {
    console.error('Data fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/guiestlogout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.activityLog.push({ action: 'logout', timestamp: new Date() });
    await user.save();
    console.log(`Logout successful for user ID: ${req.user.userId}`);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/revoke', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.accessRevoked = true;
    user.activityLog.push({ action: 'access_revoked', timestamp: new Date() });
    await user.save();
    console.log(`Access revoked for user ID: ${req.user.userId}`);
    res.json({ message: 'Access revoked' });
  } catch (err) {
    console.error('Revoke access error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;