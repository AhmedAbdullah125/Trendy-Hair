import React from 'react';
import { 
  TrendingUp, Users, ShoppingBag, Award, 
  ArrowUpRight, ArrowDownRight, Coins 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { 
      label: 'مبيعات اليوم', 
      value: '245.500 د.ك', 
      trend: '+12%', 
      isUp: true, 
      icon: <TrendingUp size={24} className="text-white" />,
      bg: 'bg-green-500'
    },
    { 
      label: 'طلبات اليوم', 
      value: '18', 
      trend: '-2%', 
      isUp: false, 
      icon: <ShoppingBag size={24} className="text-white" />,
      bg: 'bg-app-gold'
    },
    { 
      label: 'عملاء نشطين', 
      value: '1,240', 
      trend: '+5%', 
      isUp: true, 
      icon: <Users size={24} className="text-white" />,
      bg: 'bg-blue-500'
    },
    { 
      label: 'مكافآت ممنوحة', 
      value: '450 د.ك', 
      trend: 'اليوم', 
      isUp: true, 
      icon: <Award size={24} className="text-white" />,
      bg: 'bg-purple-500'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-app-card/30 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
            <div>
              <p className="text-sm text-app-textSec font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-app-text mb-1">{stat.value}</h3>
              <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span className="mr-1">{stat.trend}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-gray-100 ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-app-text">أداء المبيعات</h3>
            <select className="bg-app-bg border border-app-card rounded-lg px-3 py-1 text-sm outline-none">
              <option>آخر 30 يوم</option>
              <option>هذا الأسبوع</option>
              <option>هذا العام</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
             {/* Mock Bars */}
             {[40, 60, 45, 80, 55, 70, 90, 65, 50, 75, 60, 85].map((h, i) => (
               <div key={i} className="w-full bg-app-bg rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-app-gold rounded-t-lg transition-all duration-500 group-hover:bg-app-goldDark"
                    style={{ height: `${h}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity">
                      {h * 10} د.ك
                    </div>
                  </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-app-textSec px-2">
            <span>1 مارس</span>
            <span>15 مارس</span>
            <span>30 مارس</span>
          </div>
        </div>

        {/* Wallet Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <h3 className="text-lg font-bold text-app-text mb-6">إحصائيات المحافظ</h3>
          
          <div className="space-y-6">
            <div>
               <div className="flex justify-between mb-2">
                 <span className="text-sm font-bold text-app-text flex items-center gap-2">
                   <Award size={16} className="text-app-gold" />
                   رصيد الجوائز
                 </span>
                 <span className="text-xs text-app-textSec">الإجمالي الممنوح</span>
               </div>
               <div className="w-full bg-app-bg rounded-full h-2 mb-1">
                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-app-textSec">تم استخدامه: 650 د.ك</span>
                 <span className="font-bold">1,000 د.ك</span>
               </div>
            </div>

            <div>
               <div className="flex justify-between mb-2">
                 <span className="text-sm font-bold text-app-text flex items-center gap-2">
                   <Coins size={16} className="text-blue-500" />
                   كاش باك
                 </span>
                 <span className="text-xs text-app-textSec">الإجمالي المكتسب</span>
               </div>
               <div className="w-full bg-app-bg rounded-full h-2 mb-1">
                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-app-textSec">تم استخدامه: 200 د.ك</span>
                 <span className="font-bold">500 د.ك</span>
               </div>
            </div>

            <div className="p-4 bg-app-bg rounded-xl border border-app-card/50">
               <h4 className="text-sm font-bold text-app-text mb-2">لعب المسابقة اليوم</h4>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-app-goldDark">145</span>
                 <span className="text-xs text-app-textSec mb-1">لاعب</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        <div className="p-6 border-b border-app-card/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-app-text">أحدث الطلبات</h3>
          <button className="text-sm text-app-gold font-bold hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30">
              {[1,2,3,4,5].map((item) => (
                <tr key={item} className="hover:bg-app-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-app-text">#TH-202{item}</td>
                  <td className="px-6 py-4 text-sm">نور أحمد</td>
                  <td className="px-6 py-4 text-sm text-app-textSec">2024-03-1{item}</td>
                  <td className="px-6 py-4 font-bold text-app-gold">{(25.500 * item).toFixed(3)} د.ك</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item % 2 === 0 ? 'مكتمل' : 'قيد التجهيز'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;