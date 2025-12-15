import React, { useMemo, useState } from 'react';
import type { Sale } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X, TrendingUp, DollarSign, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button } from './ui/Button';

interface ReportsModalProps {
  sales: Sale[];
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ sales, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalSales = sales.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Group by payment method
    const byPayment = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
      return acc;
    }, {} as Record<string, number>);

    const paymentData = Object.entries(byPayment).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return { totalRevenue, totalSales, avgTicket, paymentData };
  }, [sales]);

  const handleAiAnalysis = async () => {
    if (sales.length === 0) {
      setAnalysis("Não há dados suficientes para análise.");
      return;
    }

    setLoadingAi(true);
    setAnalysis('');

    try {
      // Prepare a lightweight summary for the AI to save tokens and speed up
      const salesSummary = sales.slice(-50).map(s => ({
        date: s.date,
        items: s.items.map(i => `${i.qty}x ${i.name} (${i.category})`).join(', '),
        total: s.total,
        method: s.paymentMethod
      }));

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Atue como um consultor especialista em varejo para uma loja pequena de variedades. 
        Analise estes dados recentes de vendas (JSON abaixo) e forneça 3 insights curtos e estratégicos em português (pt-BR).
        Foque em: O que está vendendo bem? Qual o comportamento de pagamento? Uma sugestão para vender mais.
        Use formatação Markdown simples. Seja direto.
        
        Dados: ${JSON.stringify(salesSummary)}`,
      });

      setAnalysis(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error(error);
      setAnalysis("Erro ao conectar com a Inteligência Artificial. Verifique sua chave de API.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] bg-gray-50 dark:bg-dark-bg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de Vendas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* AI Analysis Section */}
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sparkles size={20} />
                <h3 className="font-bold">Consultor Inteligente (Gemini)</h3>
              </div>
              <Button 
                onClick={handleAiAnalysis} 
                disabled={loadingAi}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {loadingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loadingAi ? 'Analisando...' : 'Gerar Análise'}
              </Button>
            </div>
            
            {analysis && (
              <div className="prose dark:prose-invert max-w-none text-sm bg-white/50 dark:bg-black/20 p-4 rounded-lg animate-in fade-in duration-500">
                <div className="whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200">
                  {analysis}
                </div>
              </div>
            )}
            {!analysis && !loadingAi && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Clique no botão para receber insights sobre suas vendas, tendências e dicas para lucrar mais.
              </p>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vendas Realizadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Chart */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Formas de Pagamento</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {stats.paymentData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4] }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{entry.name === 'money' ? 'Dinheiro' : entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sales List */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Últimas Vendas</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {[...sales].reverse().slice(0, 10).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-xs text-gray-500">{sale.items.length} itens • {sale.paymentMethod}</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {sale.total.toFixed(2)}
                    </span>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Nenhuma venda registrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};