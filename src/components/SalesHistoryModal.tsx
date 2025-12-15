import React, { useState, useMemo } from 'react';
import type { Sale, AppSettings } from '../types';
import { printReceipt } from '../utils/printer';
import { X, History, Search, Printer, Calendar } from 'lucide-react';
import { Button } from './ui/Button';

interface SalesHistoryModalProps {
  sales: Sale[];
  settings: AppSettings;
  onClose: () => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ sales, settings, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (sale.client && sale.client.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDate = dateFilter 
        ? new Date(sale.date).toISOString().slice(0, 10) === dateFilter 
        : true;

      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, dateFilter]);

  const handlePrint = (sale: Sale) => {
    printReceipt(sale, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-dark-bg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Histórico de Vendas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Consulte e reimprima cupons antigos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 bg-white dark:bg-dark-surface">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por código da venda ou cliente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
             <input 
                type="date" 
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
             />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-dark-bg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-dark-surface sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(sale.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {sale.client || '-'}
                    <div className="text-[10px] text-gray-400 font-mono">#{sale.id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {sale.items.length} itens
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 capitalize">
                      {sale.paymentMethod === 'money' ? 'Dinheiro' : sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => handlePrint(sale)} 
                      variant="secondary" 
                      size="sm"
                      className="gap-2"
                      title="Reimprimir Cupom"
                    >
                      <Printer size={16} /> Imprimir
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma venda encontrada com os filtros atuais.
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