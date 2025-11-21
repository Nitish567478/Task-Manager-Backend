const { getDB } = require('../config/mongo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');

    const { username, password, role } = req.body;
    const existing = await users.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ username, password: hashed, role: role || 'user' });

    const user = { id: result.insertedId, username, role: role || 'user' };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection('users');

    const { username, password } = req.body;
    const user = await users.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
