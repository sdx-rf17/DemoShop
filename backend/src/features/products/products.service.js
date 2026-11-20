// Layer: service (products feature).
// Owns product business rules: required fields, number checks, and
// 404 when a product does not exist. Knows nothing about HTTP or SQL.
const { ApiError } = require('../../common/errors');
const productsRepository = require('./products.repository');

async function listProducts() {
  return productsRepository.findAll();
}

async function getProduct(id) {
  const product = await productsRepository.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

async function createProduct(body) {
  const { name, price, stock, category } = body || {};
  if (!name || price === undefined || price === null || price === '') {
    throw new ApiError(400, 'name and price are required');
  }
  if (Number.isNaN(Number(price))) {
    throw new ApiError(400, 'price must be a number');
  }
  return productsRepository.create({
    name,
    price: Number(price),
    stock: Number(stock || 0),
    category: category || 'General',
  });
}

async function updateProduct(id, body) {
  const existing = await productsRepository.findById(id);
  if (!existing) throw new ApiError(404, 'Product not found');
  const changes = {};
  if (body.name !== undefined) changes.name = body.name;
  if (body.price !== undefined) {
    if (Number.isNaN(Number(body.price))) throw new ApiError(400, 'price must be a number');
    changes.price = Number(body.price);
  }
  if (body.stock !== undefined) changes.stock = Number(body.stock);
  if (body.category !== undefined) changes.category = body.category;
  return productsRepository.update(id, changes);
}

async function deleteProduct(id) {
  const removed = await productsRepository.remove(id);
  if (!removed) throw new ApiError(404, 'Product not found');
  return { ok: true };
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
