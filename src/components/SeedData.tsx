import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OrderStatus } from '../types';
import { Database, Loader2 } from 'lucide-react';

export default function SeedData() {
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    try {
      // 1. Menu Items
      const menuItems = [
        { name: 'Classic Wagyu Burger', description: 'Juicy 100% Wagyu beef patty with smoked cheddar.', price: 18.99, category: 'Main Course', availability: 'available', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', stockLevel: 45 },
        { name: 'Truffle Parmesan Fries', description: 'Hand-cut fries tossed in truffle oil and aged parmesan.', price: 8.50, category: 'Appetizers', availability: 'available', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400', stockLevel: 120 },
        { name: 'Fresh Mint Lemonade', description: 'Spanking fresh mint leaves with organic lemons.', price: 5.50, category: 'Drinks', availability: 'available', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', stockLevel: 80 },
        { name: 'Lava Chocolate Cake', description: 'Warm melting heart chocolate cake with vanilla bean ice cream.', price: 9.99, category: 'Desserts', availability: 'available', imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62adda51?auto=format&fit=crop&q=80&w=400', stockLevel: 25 },
      ];

      for (const item of menuItems) {
        await addDoc(collection(db, 'menuItems'), { ...item, createdAt: serverTimestamp() });
      }

      // 2. Orders
      const orders = [
        { customerName: 'John Doe', customerPhone: '+1 234 567 890', items: [{ name: 'Classic Wagyu Burger', quantity: 2, price: 18.99 }], total: 37.98, status: OrderStatus.RECEIVED, createdAt: serverTimestamp() },
        { customerName: 'Alice Smith', customerPhone: '+1 987 654 321', items: [{ name: 'Fresh Mint Lemonade', quantity: 1, price: 5.50 }, { name: 'Truffle Parmesan Fries', quantity: 1, price: 8.50 }], total: 14.00, status: OrderStatus.PREPARED, createdAt: serverTimestamp() },
      ];

      for (const order of orders) {
        await addDoc(collection(db, 'orders'), order);
      }

      // 3. Inventory
      const inventory = [
        { name: 'Wagyu Beef Patties', stockLevel: 150, unit: 'pcs' },
        { name: 'Fresh Potatoes', stockLevel: 200, unit: 'kg' },
        { name: 'Brioche Buns', stockLevel: 80, unit: 'pcs' },
        { name: 'Fresh Mint', stockLevel: 15, unit: 'bundles' },
      ];

      for (const inv of inventory) {
        await addDoc(collection(db, 'inventory'), { ...inv, createdAt: serverTimestamp() });
      }

      // 4. Drivers
      const drivers = [
        { name: 'Sam Delivery', phone: '+1 111 222 333', status: 'online' },
        { name: 'Fast Fred', phone: '+1 444 555 666', status: 'online' },
      ];

      for (const driver of drivers) {
        await addDoc(collection(db, 'drivers'), { ...driver, createdAt: serverTimestamp() });
      }

      // 5. Feedback
      const feedbacks = [
        { orderId: 'DEMO1', rating: 5, comment: 'The Wagyu Burger was absolutely divine! Best in town.', createdAt: serverTimestamp() },
        { orderId: 'DEMO2', rating: 4, comment: 'Quick delivery, fries were still crispy. Great job.', createdAt: serverTimestamp() },
      ];

      for (const f of feedbacks) {
        await addDoc(collection(db, 'feedback'), f);
      }

      alert('Demo data seeded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to seed data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200 mb-8 border border-white/20">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
           <Database className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">New Setup?</h2>
          <p className="text-white/80 font-medium max-w-md">Initialize your restaurant with demo menu items, inventory, and sample orders to see the dashboard in action.</p>
        </div>
      </div>
      <button 
        disabled={loading}
        onClick={seed}
        className="px-8 py-4 bg-white text-[#2563eb] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Seed Demo Data'}
      </button>
    </div>
  );
}
