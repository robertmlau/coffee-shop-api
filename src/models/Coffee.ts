export interface Coffee {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'espresso' | 'latte' | 'cappuccino' | 'americano' | 'specialty';
    size: 'small' | 'medium' | 'large';
    available: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateCoffeeRequest {
    name: string;
    description: string;
    price: number;
    category: Coffee['category'];
    size: Coffee['size'];
    available?: boolean;
  }
  
  export interface UpdateCoffeeRequest {
    name?: string;
    description?: string;
    price?: number;
    category?: Coffee['category'];
    size?: Coffee['size'];
    available?: boolean;
  }