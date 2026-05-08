import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Truck, 
  BarChart3, 
  MessageSquare, 
  Box,
  ChevronRight,
  LogOut,
   Bell,
   Settings
} from 'lucide-react';
import Login from './components/Login';

import { cn } from './lib/utils';

// Pages - placeholder imports
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MenuManagement from './pages/MenuManagement';
import Inventory from './pages/Inventory';
import DeliveryCoordination from './pages/DeliveryCoordination';
import Analytics from './pages/Analytics';
import Feedback from './pages/Feedback';
import RestaurantProfile from './pages/RestaurantProfile';

type Page = 'dashboard' | 'orders' | 'menu' | 'inventory' | 'delivery' | 'analytics' | 'feedback' | 'profile';

export default function App() {
  const [user, setUser] = useState<{ email: string, displayName: string } | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, userData: any) => {
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }


  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-sidebar border-r border-border hidden md:flex flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <span className="font-extrabold text-2xl text-primary tracking-tight">lake7</span>
        </div>
        
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 border-r-3",
                activePage === item.id 
                  ? "bg-blue-50 text-primary border-primary" 
                  : "text-text-muted hover:text-text-main border-transparent"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.displayName}`} 
              className="w-10 h-10 rounded-full border border-slate-200"
              alt={user.displayName || 'User'}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border h-[64px] flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-lg font-semibold text-text-main">
            {activePage === 'dashboard' ? 'Orders Management' : activePage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-sm text-text-muted flex items-center gap-2">
               Kitchen Status: <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border border-border"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-bg">
          <div className="max-w-[1200px] mx-auto">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'orders' && <Orders />}
            {activePage === 'menu' && <MenuManagement />}
            {activePage === 'inventory' && <Inventory />}
            {activePage === 'delivery' && <DeliveryCoordination />}
            {activePage === 'analytics' && <Analytics />}
            {activePage === 'feedback' && <Feedback />}
            {activePage === 'profile' && <RestaurantProfile />}
          </div>
        </div>
      </main>
    </div>
  );
}
