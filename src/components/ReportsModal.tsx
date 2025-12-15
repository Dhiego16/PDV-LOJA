import React, { useMemo, useState } from 'react';
import type { Sale } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X, TrendingUp, DollarSign, Calendar, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button } from './ui/Button';

interface ReportsModalProps {
  sales: Sale[];
  onClose: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

    return { totalRevenue, totalSales, avgTicket, paymentData };
  }, [sales]);

  const handleAiAnalysis = async () => {
    if (sales.length === 0) {
      setAnalysis("Não há vendas registradas para analisar ainda. Faça algumas vendas primeiro!");
      return;
    }

    setLoadingAi(true);
    setAnalysis('');

    try {
      // Preparar resumo leve para a IA (economiza tokens e é mais rápido)
      const salesSummary = sales.slice(-40).map(s => ({
        data: new Date(s.date).toLocaleDateString(),
        hora: new Date(s.date).toLocaleTimeString(),
        itens: s.items.map(i => `${i.qty}x ${i.name}`).join(', '),
        total: s.total,
        pgto: s.paymentMethod
      }));

      // Inicializa Gemini
      // IMPORTANTE: A chave deve estar no arquivo .env como VITE_API_KEY ou process.env.API_KEY
      const apiKey = process.env.API_KEY; 
      
      if (!apiKey) {
        throw new Error("Chave de API não encontrada. Configure o process.env.API_KEY.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é um gerente de loja experiente analisando os dados de vendas de uma loja de utilidades (LS Utensílios).
        
        Dados das últimas vendas (JSON):
        ${JSON.stringify(salesSummary)}

        Analise esses dados e forneça um relatório curto e direto (em Markdown) com:
        1. 🏆 **O que está vendendo bem?** (Identifique padrões de produtos)
        2. 💳 **Comportamento de Pagamento** (O que os clientes preferem?)
        3. 💡 **Dica de Ouro** (Uma sugestão prática para vender mais amanhã)

        Seja encorajador, use emojis e fale português do Brasil.`,
      });

      setAnalysis(response.text || "A IA analisou mas não retornou texto. Tente novamente.");
    } catch (error) {
      console.error("Erro na IA:", error);
      setAnalysis("Não foi possível conectar ao consultor inteligente. \n\nErro: " + (error instanceof Error ? error.message : "Desconhecido") + "\n\nVerifique se você instalou o pacote: npm install @google/genai");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[90vh] bg-gray-50 dark:bg-dark-bg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de Vendas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral do faturamento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Área da Inteligência Artificial */}
          <div className="mb-8 rounded-xl overflow-hidden border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={100} />
            </div>
            
            <div className="p-6 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-indigo-900/50 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Consultor Inteligente (Gemini)</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">Analise suas vendas e receba dicas estratégicas</p>
                  </div>
                </div>
                <Button 
                  onClick={handleAiAnalysis} 
                  disabled={loadingAi}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/30"
                >
                  {loadingAi ? <Loader2 size={18} className="animate-spin mr-2" /> : <Lightbulb size={18} className="mr-2" />}
                  {loadingAi ? 'Analisando dados...' : 'Gerar Análise Agora'}
                </Button>
              </div>

              {analysis ? (
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-5 text-gray-800 dark:text-gray-200 text-sm leading-relaxed border border-indigo-100 dark:border-indigo-800/50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="whitespace-pre-line prose-sm dark:prose-invert">
                    {analysis}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-indigo-600/70 dark:text-indigo-400/70 bg-indigo-100/30 dark:bg-indigo-900/10 p-3 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800">
                  <Lightbulb size={16} />
                  <span>Dica: Clique no botão para descobrir qual produto é a estrela da sua loja hoje!</span>
                </div>
              )}
            </div>
          </div>

          {/* Cards de KPI */}
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
            {/* Gráfico de Pagamentos */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Formas de Pagamento</h3>
              <div className="h-64 w-full">
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {entry.name === 'money' ? 'Dinheiro' : 
                       entry.name === 'credit' ? 'Crédito' :
                       entry.name === 'debit' ? 'Débito' : entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Vendas Recentes */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Últimas Vendas</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {[...sales].reverse().slice(0, 15).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          {new Date(sale.date).toLocaleDateString('pt-BR')}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.items.length} itens • <span className="capitalize">{sale.paymentMethod}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {sale.total.toFixed(2)}
                      </span>
                      {sale.discount > 0 && (
                        <span className="text-[10px] text-red-400">Desc: -{sale.discount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <DollarSign size={40} className="mb-2 opacity-20" />
                    <p>Nenhuma venda registrada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};