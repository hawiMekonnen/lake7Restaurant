import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  Check,
  Search,
  Filter
} from 'lucide-react';
import { orderService } from '../lib/api';
import { Order, OrderStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await orderService.getAvailableDrivers();
      setDrivers(res.data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, nextStatus);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      await orderService.assignDriver(orderId, driverId);
      alert('Driver assigned successfully');
      fetchOrders();
    } catch (err) {
      console.error('Failed to assign driver:', err);
      alert('Failed to assign driver');
    }
  };



  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search orders, customers..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {(['all', ...Object.values(OrderStatus)] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                filter === s ? "bg-primary text-white shadow-sm" : "bg-white text-text-muted border border-border hover:bg-slate-50"
              )}
            >
              {s.replace('_', ' ').replace('all', 'All Orders')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center card border-dashed border-2 border-slate-200 bg-transparent">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-text-muted font-bold text-sm">No orders found matching this criteria.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="card group hover:border-primary transition-colors">
              <div className="card-header bg-slate-50/30">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-primary text-sm uppercase tracking-tighter">#{order.id.slice(0, 6)}</span>
                    <span className="px-1.5 py-0.5 bg-white border border-border text-text-muted rounded-[4px] text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                      {order.createdAt?.seconds ? format(order.createdAt.seconds * 1000, 'MMM d, HH:mm') : 'Just now'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-text-main leading-tight">{order.customerName}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary leading-tight">{formatCurrency(order.total)}</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{order.items.length} items</p>
                </div>
              </div>

              {/* Items List */}
              <div className="px-6 py-4 bg-white space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs items-center p-2 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                    <span className="text-text-main font-medium">
                      <span className="font-extrabold text-primary mr-2">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="text-text-muted font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Progress Tracker (Refined Horizontal) */}
              <div className="p-6 bg-slate-50/30 border-t border-border mt-auto">
                <div className="flex items-center justify-between relative px-2 mb-8">
                  <div className="absolute top-[15px] left-0 w-full h-[1.5px] bg-border z-0"></div>
                  
                  {[
                    { status: OrderStatus.RECEIVED, label: 'Received', icon: Clock },
                    { status: OrderStatus.PREPARED, label: 'Kitchen', icon: Package },
                    { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Dispatch', icon: Truck },
                    { status: OrderStatus.DELIVERED, label: 'Ready', icon: CheckCircle2 },
                  ].map((step, idx, array) => {
                    const stepIdx = array.findIndex(s => s.status === order.status);
                    const isCompleted = array.indexOf(step) < stepIdx || order.status === OrderStatus.DELIVERED;
                    const isCurrent = step.status === order.status;
                    const isNext = array.indexOf(step) === stepIdx + 1 && order.status !== OrderStatus.DELIVERED;

                    return (
                      <div key={step.status} className="relative z-10 flex flex-col items-center gap-3">
                        <button
                          disabled={!isNext}
                          onClick={() => isNext && updateStatus(order.id, step.status)}
                          className={cn(
                            "w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-300 border-2 font-bold text-[10px]",
                            isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : 
                            isCurrent ? "bg-white border-primary text-primary shadow-lg ring-4 ring-blue-50" :
                            isNext ? "bg-white border-blue-200 text-blue-300 hover:border-primary hover:text-primary cursor-pointer" :
                            "bg-white border-border text-slate-200"
                          )}
                        >
                          {isCompleted ? '✔' : step.status === OrderStatus.RECEIVED ? '1' : step.status === OrderStatus.PREPARED ? '2' : step.status === OrderStatus.OUT_FOR_DELIVERY ? '3' : '4'}
                        </button>
                        <span className={cn(
                          "absolute -bottom-6 text-[9px] font-extrabold uppercase tracking-widest whitespace-nowrap",
                          isCompleted ? "text-emerald-600" : isCurrent ? "text-primary" : "text-text-muted opacity-50"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Driver Assignment */}
                {order.status === OrderStatus.PREPARED && (
                  <div className="mb-4 space-y-2">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Assign Driver</p>
                    <select 
                      onChange={(e) => assignDriver(order.id, e.target.value)}
                      className="w-full p-2 bg-white border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20"
                      defaultValue=""
                    >
                      <option value="" disabled>Select available driver...</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.vehicleType || 'Bike'})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Button */}
                <div>
                  {order.status !== OrderStatus.DELIVERED ? (
                    <button 
                      onClick={() => {
                        const statuses = Object.values(OrderStatus);
                        const nextIdx = statuses.indexOf(order.status) + 1;
                        if (nextIdx < statuses.length) updateStatus(order.id, statuses[nextIdx]);
                      }}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-[10px] text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group"
                    >
                      <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                      Next Step: {Object.values(OrderStatus)[Object.values(OrderStatus).indexOf(order.status) + 1]?.replace('_', ' ')}
                    </button>
                  ) : (
                    <div className="w-full bg-emerald-50 text-emerald-600 py-2.5 rounded-[10px] text-xs font-extrabold uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2 shadow-sm">
                       <CheckCircle2 className="w-4 h-4" />
                       Order Completed
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
