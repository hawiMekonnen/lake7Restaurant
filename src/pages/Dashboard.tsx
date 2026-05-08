import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Package,
  Bike
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

import SeedData from '../components/SeedData';

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    activeOrders: 0
  });

  useEffect(() => {
    // Live stream recent orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
    });

    // Simple stat aggregation (would normally be handled by a backend or cached)
    const fetchStats = async () => {
      const snapshot = await getDocs(collection(db, 'orders'));
      const orders = snapshot.docs.map(doc => doc.data() as Order);
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const active = orders.filter(o => o.status !== OrderStatus.DELIVERED).length;
      
      setStats({
        revenue: totalRevenue,
        orders: orders.length,
        customers: new Set(orders.map(o => o.customerPhone)).size,
        activeOrders: active
      });
    };

    fetchStats();
    return unsubscribe;
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED: return 'bg-blue-50 text-blue-600 border-blue-100';
      case OrderStatus.PREPARED: return 'bg-amber-50 text-amber-600 border-amber-100';
      case OrderStatus.OUT_FOR_DELIVERY: return 'bg-purple-50 text-purple-600 border-purple-100';
      case OrderStatus.DELIVERED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <SeedData />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[12px] border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-xl font-extrabold text-text-main">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main Orders Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-text-main">Active Incoming Orders ({stats.activeOrders})</h2>
            <button className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
              + New Manual Order
            </button>
          </div>
          <div className="p-4 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-text-muted italic text-sm">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-slate-50 transition-colors group">
                  <div className="font-bold text-primary group-hover:scale-110 transition-transform">#{order.id.slice(0, 4)}</div>
                  <div>
                    <div className="font-bold text-sm text-text-main">{order.customerName}</div>
                    <div className="text-[11px] text-text-muted line-clamp-1">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </div>
                  <span className={cn(
                    "status-badge",
                    order.status === OrderStatus.RECEIVED ? "bg-blue-100 text-blue-800" : 
                    order.status === OrderStatus.PREPARED ? "bg-amber-100 text-amber-800" :
                    order.status === OrderStatus.OUT_FOR_DELIVERY ? "bg-emerald-100 text-emerald-800" :
                    "bg-slate-100 text-slate-800"
                  )}>
                    {order.status.replace('-', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Order Detail Visualizer */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-bold text-text-main">Active Workflow</h2>
              <button className="text-text-muted p-1 hover:text-text-main">...</button>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Order Received', icon: '📝', time: '10:45 AM', completed: true },
                { label: 'Food Prepared', icon: '🥣', time: 'Click to complete', active: true },
                { label: 'Out for Delivery', icon: '🚲', time: 'Assign Driver' },
                { label: 'Delivered', icon: '✅', time: 'Pending drop-off' },
              ].map((step, i, arr) => (
                <div key={i} className={cn("flex items-start gap-4 relative", step.active && "active")}>
                  {i !== arr.length - 1 && (
                    <div className={cn(
                      "absolute left-[14px] top-[30px] w-[2px] h-[30px] z-0",
                      step.completed ? "bg-emerald-500" : "bg-border"
                    )}></div>
                  )}
                  <div className={cn(
                    "w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-xs z-10 shrink-0",
                    step.completed ? "bg-emerald-500 border-emerald-500 text-white" : 
                    step.active ? "border-primary text-primary bg-white ring-4 ring-blue-50" : 
                    "border-border bg-white text-text-muted"
                  )}>
                    {step.completed ? '✔' : step.active ? step.icon : i + 1}
                  </div>
                  <div>
                    <div className={cn("text-xs font-bold", step.active ? "text-primary" : "text-text-main")}>{step.label}</div>
                    <div className="text-[10px] text-text-muted font-medium">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Card */}
          <div className="card p-5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-4">Daily Performance</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                 <p className="text-[10px] text-text-muted font-bold mb-1">REVENUE</p>
                 <p className="text-sm font-extrabold text-text-main">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                 <p className="text-[10px] text-text-muted font-bold mb-1">ORDERS</p>
                 <p className="text-sm font-extrabold text-text-main">{stats.orders}</p>
              </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-text-muted">TOP ITEM: <span className="text-primary uppercase">Beef Burger</span></span>
                 <span className="text-text-main">75%</span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Helper for cn if not using the dynamic import in this specific file context during initial creation
import { cn } from '../lib/utils';
