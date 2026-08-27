export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  categoryGroup?: string;
  image?: string;
  sku?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  whatsapp_sent: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface InventoryItem {
  product_id: number;
  sku: string | null;
  quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
