import React from 'react';
import type { Sale, AppSettings } from '../types';
import { printReceipt } from '../utils/printer';
import { Button } from './ui/Button';
import { Check, Printer, ArrowRight } from 'lucide-react';

interface SaleSuccessModalProps {
  sale: Sale;
  change: number;
  settings: AppSettings;
  onClose: () => void;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({ sale, change, settings, onClose }) => {
  
  const handlePrint = () => {
    printReceipt(sale, settings);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Visual Header */}
        <div className="bg-emerald-500 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Check size={40} strokeWidth={4} />
          </div>
          <h2 className="text-2xl font-bold">Venda Realizada!</h2>
          <p className="opacity-90">Pedido #{sale.id.slice(-6)}</p>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          {/* Change Display */}
          {sale.paymentMethod === 'money' && (
            <div className="text-center w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Troco</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                R$ {change.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex w-full gap-3">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2 h-12 text-lg">
              <Printer size={20} /> Imprimir
            </Button>
            <Button onClick={onClose} className="flex-1 gap-2 h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
              Nova Venda <ArrowRight size={20} />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};