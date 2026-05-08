import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Clock, 
  UserPlus, 
  MoreHorizontal,
  Navigation,
  Circle
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, updateDoc, doc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Driver, Order, OrderStatus } from '../types';
import { cn } from '../lib/utils';

export default function DeliveryCoordination() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Listen to drivers
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)));
    });

    // Listen to orders that need delivery
    const qOrders = query(collection(db, 'orders'), where('status', 'not-in', [OrderStatus.DELIVERED]));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setActiveOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    return () => {
      unsubDrivers();
      unsubOrders();
    };
  }, []);

  const assignDriver = async (orderId: string, driverId: string) => {
     try {
       await updateDoc(doc(db, 'orders', orderId), { 
         driverId, 
         status: OrderStatus.OUT_FOR_DELIVERY, 
         updatedAt: new Date() 
       });
       await updateDoc(doc(db, 'drivers', driverId), { status: 'busy' });
     } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
     }
  };

  const ordersNeedingDriver = activeOrders.filter(o => !o.driverId && o.status === OrderStatus.PREPARED);
  const deliveryInProgress = activeOrders.filter(o => o.driverId && o.status === OrderStatus.OUT_FOR_DELIVERY);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 items-start">
        
        {/* Drivers List */}
        <div className="card h-full min-h-[600px] flex flex-col">
          <div className="card-header shrink-0">
            <h3 className="text-sm font-bold text-text-main">Delivery Team</h3>
            <button className="text-text-muted hover:text-primary transition-colors">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="p-4 rounded-xl border border-border bg-white hover:bg-slate-50 transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-border flex items-center justify-center relative shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=random`} className="w-8 h-8 rounded-lg" alt={driver.name} referrerPolicy="no-referrer" />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm",
                      driver.status === 'online' ? "bg-emerald-500" : driver.status === 'busy' ? "bg-amber-500" : "bg-slate-300"
                    )}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-text-main text-sm truncate leading-tight">{driver.name}</h4>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 font-bold">
                      <Phone className="w-2.5 h-2.5" /> {driver.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className={cn(
                       "status-badge",
                       driver.status === 'online' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                     )}>
                       {driver.status}
                     </span>
                   </div>
                   <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">History</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Panel */}
        <div className="space-y-6">
           {/* Map Placeholder */}
           <div className="card h-64 relative overflow-hidden group shadow-md border-none">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')] bg-center bg-cover grayscale opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="bg-primary p-4 rounded-full relative shadow-xl shadow-primary/30">
                       <Navigation className="text-white w-6 h-6" />
                    </div>
                 </div>
              </div>
              <div className="absolute top-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                 <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Active Deliveries</p>
                 <p className="text-3xl font-black text-white">{deliveryInProgress.length}</p>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-xl flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-main border border-white/20">
                <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 fill-primary text-primary" /> Kitchen</span>
                <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 fill-amber-500 text-amber-500" /> Drivers</span>
                <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Routes</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             {/* Pending Assignment */}
             <div className="space-y-4">
                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1">
                  <Clock className="w-4 h-4 text-amber-500" /> Pending Assignment
                  {ordersNeedingDriver.length > 0 && <span className="bg-amber-100 text-amber-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px] shadow-sm">{ordersNeedingDriver.length}</span>}
                </h3>
                <div className="space-y-3">
                  {ordersNeedingDriver.length === 0 ? (
                    <div className="card p-10 text-center italic text-text-muted text-xs font-bold border-dashed border-2 bg-transparent opacity-60">
                      All kitchen orders have drivers.
                    </div>
                  ) : (
                    ordersNeedingDriver.map(order => (
                      <div key={order.id} className="card p-5 space-y-4 hover:border-primary transition-all group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter">#{order.id.slice(0, 6)}</p>
                            <h4 className="font-extrabold text-text-main text-sm mt-0.5">{order.customerName}</h4>
                          </div>
                          <span className="status-badge bg-amber-100 text-amber-700 shadow-sm border border-amber-200">Prepared</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block opacity-70">Assign Available Driver</label>
                          <div className="flex flex-wrap gap-2">
                            {drivers.filter(d => d.status === 'online').slice(0, 3).map(driver => (
                              <button 
                                key={driver.id}
                                onClick={() => assignDriver(order.id, driver.id)}
                                className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-bold text-text-main hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                              >
                                {driver.name.split(' ')[0]}
                              </button>
                            ))}
                            {drivers.filter(d => d.status === 'online').length === 0 && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider italic">No runners available</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* Out for Delivery */}
             <div className="space-y-4">
                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1">
                  <Bike className="w-4 h-4 text-primary" /> On the Way
                </h3>
                <div className="space-y-3">
                  {deliveryInProgress.length === 0 ? (
                    <div className="card p-10 text-center italic text-text-muted text-xs font-bold border-dashed border-2 bg-transparent opacity-60">
                      No active deliveries on road.
                    </div>
                  ) : (
                    deliveryInProgress.map(order => {
                      const driver = drivers.find(d => d.id === order.driverId);
                      return (
                        <div key={order.id} className="card bg-primary p-5 text-white border-none shadow-xl shadow-primary/10 space-y-4 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
                          <div className="absolute -right-4 -top-4 opacity-10">
                            <Navigation className="w-24 h-24 rotate-45" />
                          </div>
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">#{order.id.slice(0, 6)}</p>
                              <h4 className="font-extrabold text-base leading-tight mt-0.5">{order.customerName}</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                              <span className="text-[10px] font-black uppercase tracking-widest">In Transit</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl relative z-10 backdrop-blur-sm border border-white/10">
                            <img src={`https://ui-avatars.com/api/?name=${driver?.name || 'D'}&background=fff&color=2563eb`} className="w-8 h-8 rounded-lg shadow-sm" alt="Driver" />
                            <div className="flex-1 min-w-0">
                               <p className="text-[9px] text-white/70 font-black uppercase tracking-tighter">Assigned To</p>
                               <p className="font-extrabold text-sm truncate">{driver?.name || 'Unknown Driver'}</p>
                            </div>
                            <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                               <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
