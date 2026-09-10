import * as productService from '../services/productService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const listProducts = async (req, res, next) => {
  try {
    const { search, category, subcategory, city, minPrice, maxPrice, sort, page, limit } = req.query;

    const result = await productService.getProducts({
      search,
      category,
      subcategory,
      city,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Products fetched successfully',
      data: result.products,
      meta: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: `Product with ID '${id}' not found`,
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Product details retrieved successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};
