
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Wallet, 
  Gamepad2, Home, FileBarChart, Settings, 
  LogOut, Menu, X, Bell, Search, ShieldCheck, Layers, Tag, Grid, Star, Trash2
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: '/admin/dashboard' },
    { icon: <Layers size={20} />, label: 'ودجات الرئيسية', path: '/admin/widgets' },
    { icon: <Grid size={20} />, label: 'الأقسام', path: '/admin/categories' },
    { icon: <Package size={20} />, label: 'المنتجات', path: '/admin/products' },
    { icon: <Tag size={20} />, label: 'العلامات التجارية', path: '/admin/brands' },
    { icon: <ShoppingBag size={20} />, label: 'الطلبات', path: '/admin/orders' },
    { icon: <Users size={20} />, label: 'العملاء', path: '/admin/customers' },
    { icon: <Wallet size={20} />, label: 'المحافظ والنقاط', path: '/admin/wallets' },
    { icon: <Gamepad2 size={20} />, label: 'مسابقة تريندي', path: '/admin/game' },
    { icon: <Star size={20} />, label: 'المراجعات', path: '/admin/reviews' },
    { icon: <Home size={20} />, label: 'إدارة المحتوى', path: '/admin/content' },
    { icon: <FileBarChart size={20} />, label: 'التقارير', path: '/admin/reports' },
    { icon: <ShieldCheck size={20} />, label: 'الصلاحيات', path: '/admin/users' },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: '/admin/settings' },
  ];

  const handleClearCache = async () => {
    if (window.confirm("هل أنت متأكد من مسح الكاش وإعادة ضبط البيانات التجريبية؟")) {
        // Clear Local Storage
        localStorage.clear();

        // Clear Cache Storage
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            } catch (e) {
                console.error("Error clearing cache storage:", e);
            }
        }

        // Reload the app
        window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F4EE] font-alexandria overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={`
          bg-white shadow-xl z-20 transition-all duration-300 flex flex-col fixed md:relative h-full
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full md:w-20 md:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-app-card/30 h-20">
          <h1 className={`text-xl font-bold text-app-goldDark truncate transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            لوحة الإدارة
          </h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-app-textSec hover:text-app-gold hidden md:block">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="text-app-textSec md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-1 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-app-gold text-white shadow-md shadow-app-gold/20' 
                  : 'text-app-textSec hover:bg-app-bg hover:text-app-goldDark'
                }
              `}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className={`whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-app-card/30 flex flex-col gap-2">
          <button 
            onClick={handleClearCache}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-app-textSec hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
            <span className={`whitespace-nowrap transition-opacity font-medium ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              مسح الكاش
            </span>
          </button>

          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className={`whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              تسجيل الخروج
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-20 shadow-sm border-b border-app-card/30 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-app-text">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-app-text">
               {menuItems.find(i => i.path === location.pathname)?.label || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="bg-app-bg border border-app-card/50 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:border-app-gold w-64"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-textSec" />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-app-bg text-app-textSec transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 mr-2">
               <div className="text-left hidden md:block">
                 <p className="text-sm font-bold text-app-text">مدير النظام</p>
                 <p className="text-[10px] text-app-textSec">Super Admin</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-app-gold text-white flex items-center justify-center font-bold text-lg shadow-sm">
                 A
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
