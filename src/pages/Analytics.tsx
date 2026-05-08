import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format, subDays, isSameDay } from 'date-fns';

const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

export default function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);

      // Process Sales Data for last 7 days
      const days = Array.from({length: 7}).map((_, i) => subDays(new Date(), i)).reverse();
      const dailySales = days.map(day => {
        const dayOrders = data.filter(o => o.createdAt?.seconds && isSameDay(o.createdAt.seconds * 1000, day));
        return {
          name: format(day, 'EEE'),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length
        };
      });
      setSalesData(dailySales);

      // Process Category data (mocking items data if not available in sample)
      setCategoryData([
        { name: 'Main Course', value: 45 },
        { name: 'Drinks', value: 25 },
        { name: 'Desserts', value: 15 },
        { name: 'Appetizers', value: 15 }
      ]);
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border shadow-sm">
           <button className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">Week</button>
           <button className="px-4 py-1.5 text-text-muted text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-50 transition-colors">Month</button>
           <button className="px-4 py-1.5 text-text-muted text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-50 transition-colors">Year</button>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-text-main mb-1 uppercase tracking-tight">Weekly Revenue Flow</h3>
            <p className="text-[11px] text-text-muted font-medium">Tracking financial trends for current session</p>
          </div>
          <div className="h-80 w-full mb-6 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', fontSize: '10px', fontWeight: 'bold'}}
                  formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-8 pt-6 border-t border-border">
             <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-60">Avg. Basket Size</p>
                <div className="flex items-end gap-2">
                   <p className="text-2xl font-black text-text-main leading-none">$24.50</p>
                   <span className="text-[10px] font-black text-emerald-500 flex items-center mb-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                     <ArrowUpRight className="w-3 h-3" /> 12%
                   </span>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-border opacity-50"></div>
             <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-60">Total Sessions</p>
                <div className="flex items-end gap-2">
                   <p className="text-2xl font-black text-text-main leading-none">1,204</p>
                   <span className="text-[10px] font-black text-red-500 flex items-center mb-0.5 bg-red-50 px-1.5 py-0.5 rounded">
                     <ArrowDownRight className="w-3 h-3" /> 4%
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-8 flex flex-col">
          <h3 className="text-sm font-bold text-text-main mb-6 uppercase tracking-tight">Sales by Category</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total</p>
                  <p className="text-xl font-black text-text-main leading-none">100%</p>
               </div>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                   <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-[11px] font-black text-text-main">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Performance */}
      <div className="card overflow-hidden">
        <div className="card-header shrink-0">
           <div>
              <h3 className="text-sm font-bold text-text-main uppercase tracking-tight">Best Selling Items</h3>
              <p className="text-[10px] text-text-muted font-medium">Menu performance for the select period</p>
           </div>
           <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Full Report</button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[
             { name: 'Double Cheese Burger', orders: 245, growth: 15, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100' },
             { name: 'Crispy Fries Large', orders: 184, growth: 8, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=100' },
             { name: 'Tropical Smoothie', orders: 120, growth: -2, img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=100' },
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary transition-all group active:scale-[0.98]">
                <img src={item.img} className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt={item.name} referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                   <h4 className="font-extrabold text-text-main text-xs leading-tight mb-1 truncate">{item.name}</h4>
                   <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{item.orders} orders</p>
                </div>
                <div className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded shadow-sm border",
                  item.growth > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-red-500 bg-red-50 border-red-100"
                )}>
                   {item.growth > 0 ? '↑' : '↓'} {Math.abs(item.growth)}%
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
