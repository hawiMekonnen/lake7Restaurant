import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown,
  History,
  Settings2
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { InventoryItem } from '../types';
import { cn } from '../lib/utils';

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));
    return unsubscribe;
  }, []);

  const updateStock = async (id: string, amount: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try {
      await updateDoc(doc(db, 'inventory', id), { 
        stockLevel: Math.max(0, item.stockLevel + amount),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${id}`);
    }
  };

  const filteredInventory = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Ingredients', value: inventory.length, icon: Box, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Low Stock Alerts', value: inventory.filter(i => i.stockLevel < 20).length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Out of Stock', value: inventory.filter(i => i.stockLevel === 0).length, icon: Box, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <div key={i} className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className={cn("text-2xl font-black", stat.color)}>{stat.value}</h3>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm min-h-[500px]">
        <div className="card-header shrink-0">
          <h3 className="text-sm font-bold text-text-main">Stock Levels</h3>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Find item..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-48"
              />
            </div>
            <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-sm shadow-blue-50">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-text-muted text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Ingredient / Item</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInventory.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-text-muted italic text-sm font-medium">No inventory records found.</td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-text-main text-sm">{item.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-base font-black",
                          item.stockLevel < 20 ? "text-red-600" : "text-text-main"
                        )}>
                          {item.stockLevel}
                        </span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              item.stockLevel < 20 ? "bg-red-500" : item.stockLevel < 50 ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(100, (item.stockLevel / 200) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "status-badge",
                        item.stockLevel === 0 ? "bg-red-100 text-red-700" : 
                        item.stockLevel < 20 ? "bg-amber-100 text-amber-700" : 
                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {item.stockLevel === 0 ? 'Out of Stock' : item.stockLevel < 20 ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted font-bold text-xs uppercase tracking-tighter">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => updateStock(item.id, -10)}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Decrease Stock"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateStock(item.id, 10)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Increase Stock"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-text-muted hover:text-text-main">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
