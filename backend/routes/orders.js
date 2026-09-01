const express = require('express');
const router = express.Router();
const store = require('../store');

/**
 * POST /api/orders
 * Places an order. Body: { customerInfo: { name, email, phone, address } }
 * Validates required fields, creates order, and clears the cart.
 */
router.post('/', (req, res, next) => {
  try {
    const { customerInfo } = req.body;

    if (!customerInfo) {
      return res.status(400).json({
        success: false,
        error: 'customerInfo is required',
      });
    }

    const required = ['name', 'email', 'phone', 'address'];
    const missing = required.filter((field) => !customerInfo[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const order = store.createOrder(customerInfo);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders
 * Returns all placed orders.
 */
router.get('/', (req, res) => {
  const orders = store.getOrders();
  res.json({ success: true, count: orders.length, data: orders });
});

/**
 * GET /api/orders/:id
 * Returns a single order by ID.
 */
router.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  res.json({ success: true, data: order });
});

module.exports = router;
