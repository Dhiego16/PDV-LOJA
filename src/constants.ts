import type { Product, AppSettings } from './types';

export const INITIAL_PRODUCTS: Record<string, Product> = {
  '7891000100015': { barcode: '7891000100015', name: 'Garrafa Térmica Inox 1L', price: 49.90, cost: 25.00, stock: 20, minStock: 5, category: 'cozinha' },
  '7891000100022': { barcode: '7891000100022', name: 'Kit Potes Herméticos 5un', price: 89.90, cost: 45.00, stock: 12, minStock: 3, category: 'organizadores' },
  '7891000100039': { barcode: '7891000100039', name: 'Mop Giratório 360', price: 65.00, cost: 35.00, stock: 15, minStock: 5, category: 'limpeza' },
  '7891000100046': { barcode: '7891000100046', name: 'Jogo de Facas 6 Peças', price: 39.90, cost: 18.00, stock: 30, minStock: 10, category: 'cozinha' },
  '7891000100053': { barcode: '7891000100053', name: 'Vaso Decorativo Cerâmica', price: 29.90, cost: 12.00, stock: 8, minStock: 2, category: 'decoração' },
};

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'LS Utensílios e Variedades',
  cnpj: '00.000.000/0001-00',
  address: 'Rua Exemplo, 123 - Centro',
  phone: '(11) 99999-9999',
  receiptFooter: 'Obrigado pela preferência!',
  enableStockAlerts: true,
  soundEnabled: true,
  lowSpecMode: false,
};

export const CATEGORIES = [
  'cozinha', 
  'decoração', 
  'organizadores', 
  'limpeza', 
  'banheiro',
  'brinquedos',
  'ferramentas',
  'papelaria',
  'diversos'
];