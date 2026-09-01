const express = require('express');
const router = express.Router();
const store = require('../store');

/**
 * GET /api/cart
 * Returns current cart contents with subtotal and item count.
 */
router.get('/', (req, res) => {
  const cart = store.getCart();
  res.json({ success: true, data: cart });
});

/**
 * POST /api/cart
 * Adds an item to the cart. Body: { productId, quantity? }
 */
router.post('/', (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }

    const cart = store.addToCart(productId, quantity || 1);
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:productId
 * Updates the quantity of a cart item. Body: { quantity }
 */
router.put('/:productId', (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: 'quantity is required',
      });
    }

    const cart = store.updateCartItem(req.params.productId, quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:productId
 * Removes a specific item from the cart.
 */
router.delete('/:productId', (req, res, next) => {
  try {
    const cart = store.removeFromCart(req.params.productId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart
 * Clears the entire cart.
 */
router.delete('/', (req, res) => {
  const cart = store.clearCart();
  res.json({ success: true, data: cart });
});

module.exports = router;
