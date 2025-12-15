import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, Sale, SuspendedSale, PaymentMethod, AppSettings } from './types';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from './constants';
import { Search, ShoppingCart, Settings, Moon, Sun, Trash2, Plus, AlertTriangle, Archive, Package, BarChart2, Save, Clock } from 'lucide-react';
import { Button } from './components/ui/Button';
import { ProductForm } from './components/ProductForm';
import { ReportsModal } from './components/ReportsModal';
import { InventoryModal } from './components/InventoryModal';
import { SuspendedSalesModal } from './components/SuspendedSalesModal';

// --- Helper Hook for LocalStorage ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue] as const;
}

const App: React.FC = () => {
  // State
  const [products, setProducts] = useLocalStorage<Record<string, Product>>('products', INITIAL_PRODUCTS);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [suspended, setSuspended] = useLocalStorage<SuspendedSale[]>('suspended', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', DEFAULT_SETTINGS);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);

  // Runtime State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('money');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSuspendedOpen, setIsSuspendedOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived Calculations
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
  const total = subtotal - discount;
  const change = paymentMethod === 'money' ? Math.max(0, (parseFloat(cashReceived) || 0) - total) : 0;

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return (Object.values(products) as Product[]).filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || p.barcode.includes(lowerQuery)
    ).slice(0, 5); // Limit results
  }, [searchQuery, products]);

  // Handlers
  const playBeep = () => {
    if (!settings.soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Produto sem estoque!');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.barcode === product.barcode);
      if (existing) {
        return prev.map(item => item.barcode === product.barcode ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    
    playBeep();
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const finalizeSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'money' && (parseFloat(cashReceived) || 0) < total) {
      alert('Valor recebido insuficiente!');
      return;
    }

    // Update stock
    const updatedProducts = { ...products };
    cart.forEach(item => {
      if (updatedProducts[item.barcode]) {
        updatedProducts[item.barcode].stock -= item.qty;
      }
    });
    setProducts(updatedProducts);

    // Save sale
    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount,
      total,
      paymentMethod,
      client: clientName || 'Cliente Geral'
    };
    setSales(prev => [...prev, newSale]);

    // Reset
    setCart([]);
    setCashReceived('');
    setClientName('');
    setDiscount(0);
    playBeep();
  };

  const handleProductSave = (product: Product) => {
    setProducts(prev => ({ ...prev, [product.barcode]: product }));
    setIsProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleProductDelete = (barcode: string) => {
    setProducts(prev => {
      const newProducts = { ...prev };
      delete newProducts[barcode];
      return newProducts;
    });
    setIsProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products[searchQuery];
    if (product) {
      addToCart(product);
    } else if (searchResults.length === 1) {
        addToCart(searchResults[0]);
    } else {
        // Maybe open create modal if not found?
        const createNew = window.confirm('Produto não encontrado. Deseja cadastrar?');
        if (createNew) {
            setEditingProduct({ barcode: searchQuery, name: '', price: 0, cost: 0, stock: 0, minStock: 5, category: 'diversos' });
            setIsProductModalOpen(true);
        }
    }
  };

  const handleRestoreSuspended = (sale: SuspendedSale) => {
      if (cart.length > 0) {
          if (!window.confirm('O carrinho atual não está vazio. Deseja substituir pelo pedido suspenso? Os itens atuais serão perdidos.')) {
              return;
          }
      }
      setCart(sale.items);
      setClientName(sale.client === 'N/A' ? '' : sale.client);
      setDiscount(0); // SuspendedSale simple type doesn't track discount yet
      
      // Remove from suspended list using functional update for safety
      setSuspended(prev => prev.filter(s => s.id !== sale.id));
      setIsSuspendedOpen(false);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F9') { e.preventDefault(); finalizeSale(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentMethod, cashReceived, total]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-bg overflow-hidden font-sans">
      
      {/* --- Left Column: Search & Product List --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {settings.companyName}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDV v3.0 Professional</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
                <Button variant="secondary" size="sm" onClick={() => setIsSuspendedOpen(true)} title="Vendas Suspensas">
                <Clock size={18} />
                </Button>
                {suspended.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                        {suspended.length}
                    </span>
                )}
            </div>
            
            <Button variant="secondary" size="sm" onClick={() => setIsInventoryOpen(true)} title="Gestão de Estoque">
              <Package size={18} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsReportsOpen(true)} title="Relatórios">
              <BarChart2 size={18} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} title="Novo Produto (F3)">
              <Plus size={18} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDarkMode(!darkMode)} title="Alternar Tema">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-4 py-3 border-2 border-primary-100 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-dark-surface dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-lg shadow-sm"
              placeholder="Escanear código de barras ou buscar nome (F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {/* Quick Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-dark-border z-20 overflow-hidden">
                {searchResults.map((product) => (
                  <div 
                    key={product.barcode}
                    onClick={() => addToCart(product)}
                    className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-0 border-gray-100 dark:border-dark-border"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">Estoque: {product.stock}</p>
                    </div>
                    <span className="font-bold text-primary-600">R$ {product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Quick Actions / Categories Filter could go here */}
        </div>

        {/* Product Grid / Cart View */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <ShoppingCart size={18} /> Itens da Venda
                    </h3>
                    <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                        {cart.length} itens
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
                            <Package size={64} strokeWidth={1} className="mb-4" />
                            <p className="text-lg">Carrinho vazio</p>
                            <p className="text-sm">Escaneie um produto para começar</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Produto</th>
                                    <th className="px-6 py-3 font-medium text-center">Qtd</th>
                                    <th className="px-6 py-3 font-medium text-right">Preço</th>
                                    <th className="px-6 py-3 font-medium text-right">Total</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {cart.map((item, index) => (
                                    <tr key={`${item.barcode}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{item.barcode}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 font-mono text-sm">
                                                {item.qty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                                            R$ {item.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                            R$ {(item.price * item.qty).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => removeFromCart(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- Right Column: Checkout Sidebar --- */}
      <div className="w-96 bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-dark-border flex flex-col shadow-xl z-20">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Total Display */}
            <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/30 text-center">
                <p className="text-primary-100 text-sm font-medium mb-1">Total a Pagar</p>
                <div className="text-5xl font-bold tracking-tight">
                    R$ {total.toFixed(2)}
                </div>
                {discount > 0 && (
                    <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded-md">
                        Desconto: -R$ {discount.toFixed(2)}
                    </div>
                )}
            </div>

            {/* Payment Controls */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['money', 'credit', 'debit', 'pix'] as const).map(method => (
                        <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                paymentMethod === method 
                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500' 
                                : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                            }`}
                        >
                            {method === 'money' && '💵 Dinheiro'}
                            {method === 'credit' && '💳 Crédito'}
                            {method === 'debit' && '💳 Débito'}
                            {method === 'pix' && '💠 Pix'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cash Inputs */}
            {paymentMethod === 'money' && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block">Valor Recebido</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                            <input
                                type="number"
                                value={cashReceived}
                                onChange={e => setCashReceived(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white focus:ring-primary-500 focus:border-primary-500 font-mono text-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    {parseFloat(cashReceived) > total && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Troco</span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R$ {change.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Client & Discount */}
            <div className="space-y-3 pt-2">
                 <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cliente (Opcional)</label>
                    <input 
                        type="text" 
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Nome do cliente"
                    />
                 </div>
                 <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Desconto (R$)</label>
                        <input 
                            type="number" 
                            value={discount || ''}
                            onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                            className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-dark-bg dark:text-white py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                        />
                     </div>
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border space-y-3">
             <Button 
                onClick={finalizeSale} 
                disabled={cart.length === 0}
                size="lg" 
                className="w-full text-lg font-bold shadow-xl shadow-primary-600/20"
            >
                Finalizar Venda (F9)
             </Button>
             
             <div className="grid grid-cols-2 gap-3">
                 <Button 
                    variant="outline" 
                    onClick={() => {
                        const suspendedSale: SuspendedSale = {
                             id: Date.now().toString(),
                             date: new Date().toISOString(),
                             items: [...cart],
                             client: clientName || 'N/A'
                        };
                        setSuspended(prev => [...prev, suspendedSale]);
                        setCart([]);
                        setClientName('');
                        setDiscount(0);
                    }}
                    disabled={cart.length === 0}
                 >
                     <Archive size={16} className="mr-2"/> Suspender
                 </Button>
                 <Button 
                    variant="danger" 
                    onClick={() => {
                        if(window.confirm('Cancelar venda atual?')) {
                            setCart([]);
                            setClientName('');
                            setDiscount(0);
                        }
                    }}
                    disabled={cart.length === 0}
                 >
                     Cancelar
                 </Button>
             </div>
        </div>
      </div>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductForm 
            initialData={editingProduct}
            onSave={handleProductSave}
            onDelete={handleProductDelete}
            onClose={() => setIsProductModalOpen(false)} 
        />
      )}

      {isReportsOpen && (
          <ReportsModal sales={sales} onClose={() => setIsReportsOpen(false)} />
      )}

      {isInventoryOpen && (
        <InventoryModal 
            products={products}
            onClose={() => setIsInventoryOpen(false)}
            onEdit={(product) => {
                setEditingProduct(product);
                setIsInventoryOpen(false); // Close inventory to show form
                setIsProductModalOpen(true);
            }}
            onDelete={(barcode) => {
                // Use functional update here as well for safety
                setProducts(prev => {
                    const newProducts = { ...prev };
                    delete newProducts[barcode];
                    return newProducts;
                });
            }}
            onCreateNew={() => {
                setEditingProduct(undefined);
                setIsInventoryOpen(false);
                setIsProductModalOpen(true);
            }}
        />
      )}

      {isSuspendedOpen && (
          <SuspendedSalesModal 
            suspendedSales={suspended} 
            onClose={() => setIsSuspendedOpen(false)} 
            onRestore={handleRestoreSuspended}
            onDelete={(id) => {
                // Use functional update here as well for safety
                setSuspended(prev => prev.filter(s => s.id !== id));
            }}
          />
      )}

    </div>
  );
};

export default App;