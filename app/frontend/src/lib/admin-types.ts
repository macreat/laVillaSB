export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  sku?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  product_name?: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  location?: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
