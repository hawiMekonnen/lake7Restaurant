import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Package,
  Truck,
  RefreshCw
} from 'lucide-react';
import { orderService, restaurantService } from '../lib/api';
import { OrderStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    activeOrders: 0,
    preparedOrders: 0,
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve restaurant ID on mount
  useEffect(() => {
    const loadRestaurant = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const res = await restaurantService.getProfile(user.email);
          setRestaurantId(res.data.id);
        } catch {
          setLoading(false);
        }
      }
    };
    loadRestaurant();
  }, []);

  // Fetch orders once restaurant ID is known
  useEffect(() => {
    if (restaurantId === null) return;
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders(restaurantId ?? undefined);
      const orders = res.data as any[];

      // Compute stats
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const activeOrders = orders.filter((o: any) =>
        o.status !== OrderStatus.DELIVERED &&
        o.status !== OrderStatus.COMPLETED &&
        o.status !== OrderStatus.CANCELLED
      ).length;
      const preparedOrders = orders.filter((o: any) => o.status === OrderStatus.PREPARED).length;

      setStats({
        revenue: totalRevenue,
        orders: orders.length,
        activeOrders,
        preparedOrders,
      });

      // Map recent 5 orders
      const mapped = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((o: any) => {
          let items: any[] = [];
          try {
            if (o.delivery?.itemDescription) {
              const parsed = JSON.parse(o.delivery.itemDescription);
              items = parsed.items || [];
            }
          } catch {
            items = [{ name: o.delivery?.itemDescription || 'Food Item', quantity: 1 }];
          }
          return {
            id: o.id,
            customerName: o.delivery?.receiverName || o.user?.fullName || 'Customer',
            items,
            status: o.status,
            total: o.totalAmount,
            createdAt: o.createdAt,
          };
        });

      setRecentOrders(mapped);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Ready for Pickup', value: stats.preparedOrders.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case OrderStatus.RECEIVED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.PREPARED: return 'bg-amber-100 text-amber-800';
      case OrderStatus.OUT_FOR_DELIVERY: return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-800';
      case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-900';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.RECEIVED: return <Clock className="w-3 h-3" />;
      case OrderStatus.PREPARED: return <Package className="w-3 h-3" />;
      case OrderStatus.OUT_FOR_DELIVERY: return <Truck className="w-3 h-3" />;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED: return <CheckCircle2 className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[12px] border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              {loading && <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />}
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-xl font-extrabold text-text-main">
              {loading ? <span className="block w-16 h-5 bg-slate-100 rounded animate-pulse" /> : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Recent Orders Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-text-main">
              Recent Orders ({stats.activeOrders} active)
            </h2>
            <button
              onClick={fetchData}
              className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-text-muted italic text-sm">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-slate-50 transition-colors group">
                  <div className="font-bold text-primary group-hover:scale-110 transition-transform text-sm">
                    #{order.id.slice(0, 6)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-main">{order.customerName}</div>
                    <div className="text-[11px] text-text-muted line-clamp-1">
                      {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || 'Items'}
                    </div>
                    {order.createdAt && (
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <span className={cn(
                      "status-badge flex items-center gap-1",
                      getStatusStyle(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status?.replace(/_/g, ' ') || 'Pending'}
                    </span>
                    <p className="text-[11px] font-bold text-primary">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Order Workflow Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-bold text-text-main">Order Workflow</h2>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Order Received', icon: '📝', desc: 'Restaurant confirms order', status: OrderStatus.RECEIVED },
                { label: 'Food Prepared', icon: '🥣', desc: 'Kitchen marks ready', status: OrderStatus.PREPARED },
                { label: 'Out for Delivery', icon: '🚲', desc: 'Cyclist picks up order', status: OrderStatus.OUT_FOR_DELIVERY },
                { label: 'Delivered', icon: '✅', desc: 'Customer receives order', status: OrderStatus.DELIVERED },
              ].map((step, i, arr) => {
                const count = recentOrders.filter(o => o.status === step.status).length;
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    {i !== arr.length - 1 && (
                      <div className="absolute left-[14px] top-[30px] w-[2px] h-[30px] z-0 bg-border" />
                    )}
                    <div className="w-[30px] h-[30px] rounded-full border-2 border-border bg-white flex items-center justify-center text-xs z-10 shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-text-main">{step.label}</div>
                      <div className="text-[10px] text-text-muted font-medium">{step.desc}</div>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Card */}
          <div className="card p-5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                <p className="text-[10px] text-text-muted font-bold mb-1">REVENUE</p>
                <p className="text-sm font-extrabold text-text-main">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                <p className="text-[10px] text-text-muted font-bold mb-1">ORDERS</p>
                <p className="text-sm font-extrabold text-text-main">{stats.orders}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                <p className="text-[10px] text-text-muted font-bold mb-1">ACTIVE</p>
                <p className="text-sm font-extrabold text-orange-600">{stats.activeOrders}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-border rounded-lg shadow-sm">
                <p className="text-[10px] text-text-muted font-bold mb-1">PICKUP READY</p>
                <p className="text-sm font-extrabold text-purple-600">{stats.preparedOrders}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
