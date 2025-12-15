import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from './ui/Button';
import { Save, Trash2, X } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  onSave: (product: Product) => void;
  onDelete?: (barcode: string) => void;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onDelete, onClose }) => {
  const [form, setForm] = useState<Product>({
    barcode: '',
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: 'diversos'
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = "w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white sm:text-sm border";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Barras</label>
              <input
                required
                type="text"
                value={form.barcode}
                disabled={!!initialData}
                onChange={e => setForm({ ...form, barcode: e.target.value })}
                className={inputClass}
                autoFocus
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Custo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Venda</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estoque Atual</label>
              <input
                required
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                value={form.minStock}
                onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" className="flex-1 gap-2">
              <Save size={18} /> Salvar
            </Button>
            {initialData && onDelete && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                        onDelete(form.barcode);
                    }
                }}
                className="gap-2"
              >
                <Trash2 size={18} /> Excluir
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};