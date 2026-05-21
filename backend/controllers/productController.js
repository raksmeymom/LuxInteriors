const Product = require("../models/productModel");

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, sort, search } = req.query;
    const products = await Product.getAll({ category, sort, search });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.getCategories();
    res.json({ success: true, data: ["All", ...categories] });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
