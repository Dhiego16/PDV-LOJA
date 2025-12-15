import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Search, X, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import { Button } from './ui/Button';

interface InventoryModalProps {
  products: Record<string, Product>;
  onEdit: (product: Product) => void;
  onDelete: (barcode: string) => void;
  onClose: () => void;
  onCreateNew: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
  products, 
  onEdit, 
  onDelete, 
  onClose,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return Object.values(products).filter((p: Product) => 
      p.name.toLowerCase().includes(term) || 
      p.barcode.includes(term) ||
      p.category.toLowerCase().includes(term)
    ).sort((a: Product, b: Product) => {
        // Sort by low stock first, then name
        const aLow = a.stock <= a.minStock ? 1 : 0;
        const bLow = b.stock <= b.minStock ? 1 : 0;
        if (aLow !== bLow) return bLow - aLow;
        return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-dark-bg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestão de Estoque</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(products).length} produtos cadastrados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-dark-surface">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou categoria..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={onCreateNew}>
             + Novo Produto
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-dark-bg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-dark-surface sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Preço</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estoque</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                return (
                  <tr key={product.barcode} className="bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                        <span className="text-xs text-gray-500 font-mono">{product.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                        isLowStock 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {isLowStock && <AlertTriangle size={14} />}
                        {product.stock}
                      </div>
                      {isLowStock && <div className="text-[10px] text-red-500 mt-1">Mín: {product.minStock}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm(`Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o produto:\n${product.name}?`)) {
                                onDelete(product.barcode);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};