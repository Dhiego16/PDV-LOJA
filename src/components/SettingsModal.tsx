import React, { useState } from 'react';
import type { AppSettings } from '../types';
import { Button } from './ui/Button';
import { Save, X, Building, Bell, Volume2, Zap, Database, Download, Upload, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose, onExport, onImport }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white sm:text-sm border";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-bg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Building className="text-primary-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Configurações</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Company Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Dados da Empresa (Cupom)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                  <input
                    required
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj || ''}
                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rodapé do Recibo</label>
                  <input
                    type="text"
                    value={formData.receiptFooter || ''}
                    onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                    className={inputClass}
                    placeholder="Ex: Volte sempre!"
                  />
                </div>
              </div>
            </div>

            {/* System Preferences */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Preferências do Sistema
              </h3>
              <div className="space-y-4">
                
                {/* Performance Mode */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Modo Desempenho (PC Antigo)</span>
                        <span className="block text-xs text-gray-600 dark:text-gray-400">Remove efeitos visuais e animações para rodar mais rápido.</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.lowSpecMode}
                      onChange={e => setFormData({...formData, lowSpecMode: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Volume2 className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sons do Sistema (Bips)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.soundEnabled}
                      onChange={e => setFormData({...formData, soundEnabled: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alertas de Estoque Baixo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.enableStockAlerts}
                      onChange={e => setFormData({...formData, enableStockAlerts: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                <Database size={16} /> Gestão de Dados e Backup
              </h3>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-bold mb-1">Segurança dos Dados</p>
                    <p className="text-xs opacity-80 mb-2">
                      Seus dados são salvos automaticamente no navegador.
                      Para segurança extra, faça backups regulares (download) dos seus dados.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="outline" onClick={onExport} className="flex-1 sm:flex-none gap-2 bg-white dark:bg-dark-surface">
                      <Download size={16} /> Fazer Backup
                    </Button>
                    <div className="relative flex-1 sm:flex-none">
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={onImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" className="w-full gap-2 bg-white dark:bg-dark-surface border-dashed border-gray-400">
                        <Upload size={16} /> Restaurar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="settings-form" className="gap-2">
            <Save size={18} /> Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};