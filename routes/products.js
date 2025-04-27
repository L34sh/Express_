const router = require('express').Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json('Access denied');

    const token = authHeader.split(' ')[1];
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json('Invalid token');
    }
};

// Create product
router.post('/', verifyToken, (req, res) => {
    const { name, price, quantity } = req.body;
    db.query('INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)', [name, price, quantity], (err, result) => {
        if (err) return res.status(500).json(err.message);
        res.status(201).json('Product created');
    });
});

// Read products
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json(err.message);
        res.json(results);
    });
});

// Update product
router.put('/:id', verifyToken, (req, res) => {
    const { name, price, quantity } = req.body;
    db.query('UPDATE products SET name=?, price=?, quantity=? WHERE id=?', [name, price, quantity, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err.message);
        res.json('Product updated');
    });
});

// Delete product
router.delete('/:id', verifyToken, (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err.message);
        res.json('Product deleted');
    });
});

module.exports = router;
