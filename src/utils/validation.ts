import { CreateCoffeeRequest, UpdateCoffeeRequest } from '../models/Coffee';

export const validateCreateCoffee = (data: any): CreateCoffeeRequest | string => {
  if (!data.name || typeof data.name !== 'string') {
    return 'Name is required and must be a string';
  }
  if (!data.description || typeof data.description !== 'string') {
    return 'Description is required and must be a string';
  }
  if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
    return 'Price is required and must be a positive number';
  }
  if (!data.category || !['espresso', 'latte', 'cappuccino', 'americano', 'specialty'].includes(data.category)) {
    return 'Category is required and must be one of: espresso, latte, cappuccino, americano, specialty';
  }
  if (!data.size || !['small', 'medium', 'large'].includes(data.size)) {
    return 'Size is required and must be one of: small, medium, large';
  }

  return {
    name: data.name.trim(),
    description: data.description.trim(),
    price: data.price,
    category: data.category,
    size: data.size,
    available: data.available !== undefined ? data.available : true,
  };
};

export const validateUpdateCoffee = (data: any): UpdateCoffeeRequest | string => {
  const updates: UpdateCoffeeRequest = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      return 'Name must be a string';
    }
    updates.name = data.name.trim();
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      return 'Description must be a string';
    }
    updates.description = data.description.trim();
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price <= 0) {
      return 'Price must be a positive number';
    }
    updates.price = data.price;
  }

  if (data.category !== undefined) {
    if (!['espresso', 'latte', 'cappuccino', 'americano', 'specialty'].includes(data.category)) {
      return 'Category must be one of: espresso, latte, cappuccino, americano, specialty';
    }
    updates.category = data.category;
  }

  if (data.size !== undefined) {
    if (!['small', 'medium', 'large'].includes(data.size)) {
      return 'Size must be one of: small, medium, large';
    }
    updates.size = data.size;
  }

  if (data.available !== undefined) {
    if (typeof data.available !== 'boolean') {
      return 'Available must be a boolean';
    }
    updates.available = data.available;
  }

  return updates;
};