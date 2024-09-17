const express = require('express');
const router = express.Router();

// Mock product data with IDs
let products = [
  { id: 1, name: "Product 1", price: 10.99 },
  { id: 2, name: "Product 2", price: 15.99 }
];

// Route to render product list
router.get('/', (req, res) => {
  res.render('product', { products });
});

// Render the 'Add Product' form
router.get('/add', (req, res) => {
    res.render('components/product/add-product');
  });
  
  // Handle the 'Add Product' form submission
  router.post('/add', (req, res) => {
    const { name, price } = req.body;
    const newProduct = {
      id: products.length + 1,
      name,
      price: parseFloat(price)
    };
    products.push(newProduct);
    res.redirect('/product');
  });

// Render the 'Set Product' (Update) form
router.get('/update/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  res.render('set-product', { product });
});

// Handle the 'Set Product' form submission (update product)
router.post('/update/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price } = req.body;
  products = products.map(p =>
    p.id === productId ? { id: productId, name, price: parseFloat(price) } : p
  );
  res.redirect('/product');
});

// Handle the 'Delete Product' form submission
router.post('/delete/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  products = products.filter(p => p.id !== productId);
  res.redirect('/product');
});

module.exports = router;
