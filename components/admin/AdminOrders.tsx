import React, { useState } from 'react';
import { Search, Filter, Eye, Printer, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Mock Orders Data
  const orders = [
    { id: 'TH-1001', customer: 'سارة خالد', phone: '99887766', date: '2024-03-20', total: '45.000', status: 'جديد', payment: 'K-NET', rewardsUsed: '5.000', items: 3 },
    { id: 'TH-1002', customer: 'منال العتيبي', phone: '55443322', date: '2024-03-19', total: '12.500', status: 'مكتمل', payment: 'COD', rewardsUsed: '0.000', items: 1 },
    { id: 'TH-1003', customer: 'نور محمد', phone: '66112233', date: '2024-03-19', total: '80.000', status: 'قيد التجهيز', payment: 'Credit Card', rewardsUsed: '5.000', items: 5 },
  ];

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setView('detail');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let colors = 'bg-gray-100 text-gray-600';
    if (status === 'جديد') colors = 'bg-blue-100 text-blue-600';
    if (status === 'مكتمل') colors = 'bg-green-100 text-green-600';
    if (status === 'قيد التجهيز') colors = 'bg-yellow-100 text-yellow-700';
    if (status === 'ملغي') colors = 'bg-red-100 text-red-600';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors}`}>
        {status}
      </span>
    );
  };

  if (view === 'detail' && selectedOrder) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('list')} 
            className="text-app-textSec hover:text-app-gold font-bold flex items-center gap-2"
          >
            ← العودة للقائمة
          </button>
          <div className="flex gap-2">
            <button className="bg-white border border-app-card text-app-text px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-app-bg">
              <Printer size={18} />
              طباعة الفاتورة
            </button>
            <button className="bg-app-gold text-white px-4 py-2 rounded-xl font-bold hover:bg-app-goldDark">
              حفظ التغييرات
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
              <h3 className="text-lg font-bold text-app-text mb-4">المنتجات</h3>
              <div className="space-y-4">
                 {/* Mock Items */}
                 {[1, 2].map(i => (
                   <div key={i} className="flex items-center gap-4 py-2 border-b border-app-card/20 last:border-0">
                      <div className="w-16 h-16 bg-app-bg rounded-lg"></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-app-text">شامبو الكيراتين المرمم</h4>
                        <p className="text-xs text-app-textSec">24KERATS</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-app-text">12.500 د.ك</p>
                        <p className="text-xs text-app-textSec">الكمية: 1</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
              <h3 className="text-lg font-bold text-app-text mb-4">تفاصيل الدفع</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-textSec">المجموع الفرعي</span>
                  <span className="font-bold">48.000 د.ك</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-textSec">رسوم التوصيل</span>
                  <span className="font-bold">2.000 د.ك</span>
                </div>
                <div className="flex justify-between text-app-gold">
                   <span className="flex items-center gap-1"><AlertCircle size={14} /> خصم رصيد الجوائز</span>
                   <span className="font-bold">- {selectedOrder.rewardsUsed} د.ك</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-app-card/30 text-lg font-bold text-app-text">
                  <span>الإجمالي النهائي</span>
                  <span>{selectedOrder.total} د.ك</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
              <h3 className="text-lg font-bold text-app-text mb-4">بيانات العميل</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-app-textSec block">الاسم</label>
                  <p className="font-bold text-app-text">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="text-xs text-app-textSec block">رقم الهاتف</label>
                  <p className="font-bold text-app-text" dir="ltr">{selectedOrder.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-app-textSec block">العنوان</label>
                  <p className="text-sm text-app-text">حولي، السالمية، قطعة 5، شارع سالم المبارك، مبنى 12</p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 p-6">
              <h3 className="text-lg font-bold text-app-text mb-4">حالة الطلب</h3>
              <select 
                className="w-full p-3 bg-app-bg border border-app-card rounded-xl font-bold text-app-text outline-none focus:border-app-gold"
                defaultValue={selectedOrder.status}
              >
                <option value="جديد">جديد</option>
                <option value="قيد التجهيز">قيد التجهيز</option>
                <option value="تم الشحن">تم الشحن</option>
                <option value="مكتمل">مكتمل</option>
                <option value="ملغي">ملغي</option>
              </select>
              
              <div className="mt-4">
                <label className="text-xs text-app-textSec block mb-2">ملاحظات داخلية</label>
                <textarea className="w-full p-3 bg-app-bg border border-app-card rounded-xl h-24 text-sm outline-none focus:border-app-gold" placeholder="اكتب ملاحظات للموظفين..."></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">إدارة الطلبات</h2>
        <div className="flex gap-3">
           <button className="p-2 bg-white border border-app-card rounded-xl text-app-textSec hover:text-app-gold hover:border-app-gold">
             <Filter size={20} />
           </button>
           <button className="bg-app-gold text-white px-6 py-2 rounded-xl font-bold hover:bg-app-goldDark">
             تصدير CSV
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-app-card/30 flex flex-wrap gap-4 items-center bg-gray-50/50">
           <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-app-textSec" size={18} />
              <input type="text" placeholder="بحث برقم الطلب أو اسم العميل..." className="w-full pr-10 pl-4 py-2 border border-app-card rounded-xl outline-none focus:border-app-gold bg-white" />
           </div>
           <select className="px-4 py-2 border border-app-card rounded-xl bg-white outline-none focus:border-app-gold text-sm">
             <option>كل الحالات</option>
             <option>جديد</option>
             <option>مكتمل</option>
           </select>
           <select className="px-4 py-2 border border-app-card rounded-xl bg-white outline-none focus:border-app-gold text-sm">
             <option>كل التواريخ</option>
             <option>اليوم</option>
             <option>هذا الشهر</option>
           </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">عدد العناصر</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-app-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-app-text">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{order.customer}</div>
                    <div className="text-xs text-app-textSec" dir="ltr">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-app-textSec">{order.date}</td>
                  <td className="px-6 py-4">{order.items}</td>
                  <td className="px-6 py-4 font-bold text-app-gold">{order.total} د.ك</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className="p-2 text-app-gold hover:bg-app-gold/10 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-app-card/30 flex justify-between items-center text-xs text-app-textSec">
           <span>عرض 1-3 من أصل 3</span>
           <div className="flex gap-2">
             <button disabled className="px-3 py-1 border rounded opacity-50">السابق</button>
             <button disabled className="px-3 py-1 border rounded opacity-50">التالي</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;