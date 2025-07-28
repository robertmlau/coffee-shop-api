import { v4 as uuidv4 } from 'uuid';
import { Coffee, CreateCoffeeRequest } from '../../../src/models/Coffee';

export const createTestCoffee = (overrides: Partial<Coffee> = {}): Coffee => ({
  id: uuidv4(),
  name: 'Test Cappuccino',
  description: 'A test cappuccino for integration testing',
  price: 4.50,
  category: 'cappuccino',
  size: 'medium',
  available: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createTestCoffeeRequest = (overrides: Partial<CreateCoffeeRequest> = {}): CreateCoffeeRequest => ({
  name: 'Test Latte',
  description: 'A test latte for integration testing',
  price: 5.00,
  category: 'latte',
  size: 'large',
  available: true,
  ...overrides,
});

export const testCoffees = {
  espresso: createTestCoffee({
    name: 'Test Espresso',
    description: 'Strong test espresso',
    price: 3.00,
    category: 'espresso',
    size: 'small',
  }),
  latte: createTestCoffee({
    name: 'Test Latte',
    description: 'Creamy test latte',
    price: 5.00,
    category: 'latte',
    size: 'large',
  }),
  americano: createTestCoffee({
    name: 'Test Americano',
    description: 'Smooth test americano',
    price: 3.50,
    category: 'americano',
    size: 'medium',
  }),
};