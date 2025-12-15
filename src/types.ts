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

export type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix';

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

export interface AppSettings {
  companyName: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  receiptFooter?: string;
  enableStockAlerts: boolean;
  soundEnabled: boolean;
  lowSpecMode: boolean;
}