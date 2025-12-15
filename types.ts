export interface Product {
  barcode: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  client?: string;
}

export interface SuspendedSale {
  id: string;
  date: string;
  items: CartItem[];
  client: string;
}

export type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix';

export interface AppSettings {
  companyName: string;
  enableStockAlerts: boolean;
  soundEnabled: boolean;
}