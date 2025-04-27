const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).json(err.message);
            res.status(201).json('User registered successfully');
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json(err.message);
        if (results.length === 0) return res.status(404).json('User not found');

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json('Invalid credentials');

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.json({ token });
    });
});

module.exports = router;
