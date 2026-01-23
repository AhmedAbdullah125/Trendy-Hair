import React from 'react';
import { Award, Coins, Settings, History } from 'lucide-react';

const AdminWallets: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-app-text">إدارة المحافظ والنقاط</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rewards Wallet Config */}
        <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-bold text-app-text">إعدادات رصيد الجوائز</h3>
          </div>
          
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-app-text mb-2">مدة صلاحية الرصيد (يوم)</label>
               <input type="number" defaultValue={30} className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" />
             </div>
             <div>
               <label className="block text-sm font-bold text-app-text mb-2">الحد الأقصى للخصم في الطلب (د.ك)</label>
               <input type="number" defaultValue={5} className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" />
             </div>
             <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-700 leading-relaxed">
               <strong>ملاحظة:</strong> يتم اكتساب رصيد الجوائز حصراً من خلال الفوز في مسابقة تريندي. عند انتهاء الصلاحية، يتم خصم الرصيد تلقائياً.
             </div>
             <button className="w-full bg-app-gold text-white font-bold py-3 rounded-xl hover:bg-app-goldDark">
               حفظ الإعدادات
             </button>
          </div>
        </div>

        {/* Cashback Wallet Config */}
        <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Coins size={20} />
            </div>
            <h3 className="text-lg font-bold text-app-text">إعدادات الكاش باك</h3>
          </div>
          
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-app-text mb-2">نسبة الكاش باك من الطلب (%)</label>
               <input type="number" defaultValue={10} className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" />
             </div>
             <div>
               <label className="block text-sm font-bold text-app-text mb-2">معادلة النقاط (نقاط = 1 د.ك)</label>
               <input type="number" defaultValue={100} className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" />
             </div>
             <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed">
               <strong>ملاحظة:</strong> يتم اكتساب الكاش باك عند إتمام الطلبات فقط.
             </div>
             <button className="w-full bg-app-gold text-white font-bold py-3 rounded-xl hover:bg-app-goldDark">
               حفظ الإعدادات
             </button>
          </div>
        </div>
      </div>

      {/* Global Transactions Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        <div className="p-6 border-b border-app-card/30 flex items-center gap-2">
           <History size={20} className="text-app-textSec" />
           <h3 className="text-lg font-bold text-app-text">سجل العمليات الأخير</h3>
        </div>
        <table className="w-full text-right">
            <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">المحفظة</th>
                <th className="px-6 py-4">نوع العملية</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30 text-sm">
               <tr>
                 <td className="px-6 py-4 font-bold">سارة خالد</td>
                 <td className="px-6 py-4 text-purple-600 font-bold">جوائز</td>
                 <td className="px-6 py-4">فوز بالمرحلة 1</td>
                 <td className="px-6 py-4 text-green-600 font-bold">+10.000 د.ك</td>
                 <td className="px-6 py-4 text-app-textSec">2024-03-20</td>
               </tr>
               <tr>
                 <td className="px-6 py-4 font-bold">نور محمد</td>
                 <td className="px-6 py-4 text-blue-600 font-bold">كاش باك</td>
                 <td className="px-6 py-4">شراء طلب #1003</td>
                 <td className="px-6 py-4 text-green-600 font-bold">+800 نقطة</td>
                 <td className="px-6 py-4 text-app-textSec">2024-03-19</td>
               </tr>
               <tr>
                 <td className="px-6 py-4 font-bold">منال العتيبي</td>
                 <td className="px-6 py-4 text-purple-600 font-bold">جوائز</td>
                 <td className="px-6 py-4">استخدام في طلب #1002</td>
                 <td className="px-6 py-4 text-red-500 font-bold">-5.000 د.ك</td>
                 <td className="px-6 py-4 text-app-textSec">2024-03-19</td>
               </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWallets;