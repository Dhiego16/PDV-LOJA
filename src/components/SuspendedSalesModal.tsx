import React from 'react';
import type { SuspendedSale } from '../types';
import { X, Clock, Play, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';

interface SuspendedSalesModalProps {
  suspendedSales: SuspendedSale[];
  onRestore: (sale: SuspendedSale) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const SuspendedSalesModal: React.FC<SuspendedSalesModalProps> = ({ 
  suspendedSales, 
  onRestore, 
  onDelete, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl h-[80vh] bg-white dark:bg-dark-bg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendas Suspensas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {suspendedSales.length} vendas aguardando
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-bg space-y-4">
          {suspendedSales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
              <p className="text-lg">Nenhuma venda suspensa</p>
            </div>
          ) : (
            suspendedSales.map((sale) => {
              const totalItems = sale.items.reduce((acc, item) => acc + item.qty, 0);
              const totalValue = sale.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

              return (
                <div key={sale.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {sale.client !== 'N/A' ? sale.client : 'Cliente Não Identificado'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                        {new Date(sale.date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {totalItems} itens • Total: <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ {totalValue.toFixed(2)}</span>
                    </p>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {sale.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                          {item.qty}x {item.name}
                        </span>
                      ))}
                      {sale.items.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-400">+ {sale.items.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                     <Button 
                        type="button"
                        variant="danger" 
                        size="sm"
                        onClick={(e) => {
                           e.stopPropagation();
                           if(window.confirm('Tem certeza que deseja excluir esta venda suspensa permanentemente?')) {
                               onDelete(sale.id);
                           }
                        }}
                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir Venda"
                     >
                        <Trash2 size={18} />
                     </Button>
                     <Button 
                        type="button"
                        size="sm" 
                        onClick={() => onRestore(sale)}
                        className="gap-2 pl-3 pr-4"
                     >
                        <Play size={16} fill="currentColor" /> Resgatar
                     </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};