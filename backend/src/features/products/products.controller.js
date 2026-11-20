// Layer: controller (products feature).
// Owns HTTP only: read params/body, call the service, send the
// response. No business logic, no SQL here.
const { asyncHandler } = require('../../common/http');
const { parseId } = require('../../middleware/validate');
const productsService = require('./products.service');

const list = asyncHandler(async (_req, res) => {
  res.json(await productsService.listProducts());
});

const get = asyncHandler(async (req, res) => {
  res.json(await productsService.getProduct(parseId(req.params.id)));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await productsService.createProduct(req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await productsService.updateProduct(parseId(req.params.id), req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await productsService.deleteProduct(parseId(req.params.id)));
});

module.exports = { list, get, create, update, remove };
