const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read products data' });
        }
        res.json(JSON.parse(data));
    });
});

// API endpoint to get a single product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read products data' });
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    });
});

// API endpoint to handle order placement
app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    console.log('New Order Received:', orderData);
    
    // In a real application, you would save this to a database
    // For this beginner-friendly version, we simply return a success response
    setTimeout(() => {
        res.json({ 
            success: true, 
            message: 'Order placed successfully!', 
            orderId: 'HT' + Math.floor(Math.random() * 1000000) 
        });
    }, 800); // Simulate brief network delay
});

// Start the server
app.listen(PORT, () => {
    console.log(`Healthytummy server is running on http://localhost:${PORT}`);
});
