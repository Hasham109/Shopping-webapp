const express = require('express');
const router = express.Router();
const store = require('../store');

/**
 * GET /api/products
 * Returns all products. Supports ?category= and ?search= query params.
 */
router.get('/', (req, res) => {
  const { category, search } = req.query;
  const products = store.getProducts({ category, search });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * GET /api/products/:id
 * Returns a single product by ID.
 */
router.get('/:id', (req, res) => {
  const product = store.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

module.exports = router;
