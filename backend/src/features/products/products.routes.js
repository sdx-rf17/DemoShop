// Layer: route (products feature).
// Owns mapping HTTP methods to the controller. Auth is applied in
// app.js when this router is mounted under /api/products.
const express = require('express');
const productsController = require('./products.controller');

const router = express.Router();
router.get('/', productsController.list);
router.post('/', productsController.create);
router.get('/:id', productsController.get);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.remove);

module.exports = router;
