
import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, ArrowUp, ArrowDown, X, CheckCircle2, Circle, Search, Layers } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Package } from '../../types';

const AdminWidgets: React.FC = () => {
  const { packages, products, addPackage, updatePackage, deletePackage } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Partial<Package> | null>(null);
  
  // Product Selector State
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Derived
  const sortedWidgets = useMemo(() => {
    return [...packages].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [packages]);

  const canAddMore = packages.length < 5;

  const openAddModal = () => {
    setEditingWidget({
      name: '',
      isActive: true,
      displayOrder: packages.length + 1,
      price: '0', // Default, unused for visual widgets
      productIds: []
    });
    setSelectedProductIds([]);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (widget: Package) => {
    setEditingWidget(widget);
    setSelectedProductIds([...widget.productIds]);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingWidget || !editingWidget.name) return;

    const widgetData = {
      ...editingWidget,
      productIds: selectedProductIds,
      price: '0' // Ensure dummy price set
    } as Package;

    if (widgetData.id) {
      updatePackage(widgetData);
    } else {
      addPackage(widgetData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الودجت؟')) {
      deletePackage(id);
    }
  };

  // --- Product Selection Logic ---
  
  const availableProducts = useMemo(() => {
    return products.filter(p => 
      !selectedProductIds.includes(p.id) && 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, selectedProductIds, productSearch]);

  const selectedProductsObjects = useMemo(() => {
    return selectedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean);
  }, [selectedProductIds, products]);

  const addProductId = (id: number) => {
    setSelectedProductIds([...selectedProductIds, id]);
  };

  const removeProductId = (id: number) => {
    setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
  };

  const moveProductOrder = (index: number, direction: 'up' | 'down') => {
    const newIds = [...selectedProductIds];
    if (direction === 'up' && index > 0) {
      [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
    } else if (direction === 'down' && index < newIds.length - 1) {
      [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    }
    setSelectedProductIds(newIds);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-app-text">ودجات الرئيسية</h2>
          <p className="text-sm text-app-textSec mt-1">إدارة الأقسام والمنتجات المعروضة في الصفحة الرئيسية</p>
        </div>
        <button 
          onClick={openAddModal}
          disabled={!canAddMore}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${
            canAddMore 
              ? 'bg-app-gold text-white hover:bg-app-goldDark' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
          <span>إضافة ودجت جديد</span>
        </button>
      </div>

      {!canAddMore && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm font-bold border border-yellow-200">
           تنبيه: لقد وصلت للحد الأقصى المسموح به (5 ودجات). يرجى حذف أو تعديل الودجات الحالية.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">عنوان الودجت</th>
              <th className="px-6 py-4">عدد المنتجات</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الترتيب</th>
              <th className="px-6 py-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-card/30 text-sm">
            {sortedWidgets.map((widget, index) => (
              <tr key={widget.id} className="hover:bg-app-bg/50 transition-colors">
                <td className="px-6 py-4 text-app-textSec">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-app-text">{widget.name}</td>
                <td className="px-6 py-4">{widget.productIds.length} منتجات</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${widget.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {widget.isActive ? 'مفعل' : 'غير مفعل'}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">{widget.displayOrder}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => openEditModal(widget)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(widget.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {sortedWidgets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-app-textSec">لا توجد ودجات مضافة حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-app-card/30">
              <h3 className="text-xl font-bold text-app-text">
                {editingWidget.id ? 'تعديل الودجت' : 'إضافة ودجت جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-app-textSec hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-app-text mb-2">عنوان الودجت (عربي)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    placeholder="مثال: أحدث المنتجات"
                    value={editingWidget.name}
                    onChange={(e) => setEditingWidget({...editingWidget, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">الترتيب في الصفحة</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingWidget.displayOrder}
                    onChange={(e) => setEditingWidget({...editingWidget, displayOrder: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${editingWidget.isActive ? 'bg-app-gold border-app-gold' : 'border-app-textSec'}`}>
                      {editingWidget.isActive && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={editingWidget.isActive}
                      onChange={(e) => setEditingWidget({...editingWidget, isActive: e.target.checked})}
                    />
                    <span className="text-sm font-bold text-app-text">تفعيل الودجت</span>
                  </label>
                </div>
              </div>

              {/* Product Selector */}
              <div className="border-t border-app-card/30 pt-4">
                 <h4 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
                   <Layers size={18} className="text-app-gold" />
                   اختيار وترتيب المنتجات
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                    {/* Left: Available Products */}
                    <div className="border border-app-card rounded-xl flex flex-col overflow-hidden bg-app-bg/30">
                       <div className="p-3 bg-white border-b border-app-card flex items-center gap-2 sticky top-0">
                          <Search size={16} className="text-app-textSec" />
                          <input 
                            type="text" 
                            placeholder="بحث عن منتج..." 
                            className="flex-1 outline-none text-sm"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                          />
                       </div>
                       <div className="flex-1 overflow-y-auto p-2 space-y-2">
                          {availableProducts.map(p => (
                             <div 
                               key={p.id} 
                               onClick={() => addProductId(p.id)}
                               className="bg-white p-2 rounded-lg shadow-sm border border-app-card/20 flex items-center gap-3 cursor-pointer hover:border-app-gold transition-colors group"
                             >
                                <img src={p.image} className="w-10 h-10 rounded-md object-cover bg-gray-100" alt="" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold text-app-text truncate">{p.name}</p>
                                   <p className="text-[10px] text-app-textSec">{p.price}</p>
                                </div>
                                <Plus size={16} className="text-app-gold opacity-0 group-hover:opacity-100" />
                             </div>
                          ))}
                          {availableProducts.length === 0 && (
                            <div className="text-center py-4 text-xs text-app-textSec">لا توجد منتجات مطابقة</div>
                          )}
                       </div>
                    </div>

                    {/* Right: Selected Products */}
                    <div className="border border-app-card rounded-xl flex flex-col overflow-hidden bg-white">
                       <div className="p-3 bg-app-bg border-b border-app-card flex justify-between items-center">
                          <span className="text-xs font-bold text-app-text">المنتجات المختارة ({selectedProductIds.length})</span>
                          <span className="text-[10px] text-app-textSec">اسحب للترتيب (قريباً) أو استخدم الأسهم</span>
                       </div>
                       <div className="flex-1 overflow-y-auto p-2 space-y-2">
                          {selectedProductsObjects.map((p, idx) => (
                             p && (
                               <div key={p.id} className="bg-app-bg p-2 rounded-lg border border-app-card/50 flex items-center gap-3">
                                  <span className="text-xs font-bold text-app-textSec w-4">{idx + 1}</span>
                                  <img src={p.image} className="w-10 h-10 rounded-md object-cover bg-gray-100" alt="" />
                                  <div className="flex-1 min-w-0">
                                     <p className="text-xs font-bold text-app-text truncate">{p.name}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <button 
                                       onClick={() => moveProductOrder(idx, 'up')}
                                       disabled={idx === 0}
                                       className="p-1 hover:bg-white rounded disabled:opacity-30"
                                     >
                                       <ArrowUp size={14} />
                                     </button>
                                     <button 
                                       onClick={() => moveProductOrder(idx, 'down')}
                                       disabled={idx === selectedProductIds.length - 1}
                                       className="p-1 hover:bg-white rounded disabled:opacity-30"
                                     >
                                       <ArrowDown size={14} />
                                     </button>
                                     <button 
                                       onClick={() => removeProductId(p.id)}
                                       className="p-1 hover:bg-red-100 text-red-500 rounded ml-1"
                                     >
                                       <X size={14} />
                                     </button>
                                  </div>
                               </div>
                             )
                          ))}
                          {selectedProductIds.length === 0 && (
                            <div className="flex-1 flex items-center justify-center text-xs text-app-textSec italic">
                              لم يتم اختيار منتجات بعد
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-app-card/30 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 font-bold text-app-textSec hover:bg-gray-200 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave} 
                disabled={!editingWidget.name}
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حفظ الودجت
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminWidgets;
