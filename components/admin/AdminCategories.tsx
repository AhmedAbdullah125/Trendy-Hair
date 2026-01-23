
import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Search, X, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Category } from '../../types';

const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [search, setSearch] = useState('');

  // Default new category state
  const defaultCategory: Partial<Category> = {
    name: '',
    nameEn: '',
    isActive: true, // Default to true so all new categories are active by default
    sortOrder: 0
  };

  const openAddModal = () => {
    // Calculate new sort order (last + 1)
    const maxSortOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder || 0)) : 0;
    
    setEditingCategory({ 
      ...defaultCategory,
      sortOrder: maxSortOrder + 1,
      isActive: true // Force explicit true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingCategory || !editingCategory.name) return;

    const catData = editingCategory as Category;

    if (catData.id) {
      updateCategory(catData);
    } else {
      addCategory(catData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم إخفاؤه من التطبيق.')) {
      deleteCategory(id);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.nameEn && c.nameEn.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">الأقسام</h2>
        <button 
          onClick={openAddModal}
          className="bg-app-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-app-card/30 flex items-center gap-4 bg-app-bg/30">
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-app-textSec" size={18} />
              <input 
                type="text" 
                placeholder="بحث باسم القسم..." 
                className="w-full pr-10 pl-4 py-2 border border-app-card rounded-xl outline-none focus:border-app-gold bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">الاسم (عربي)</th>
                <th className="px-6 py-4">الاسم (إنجليزي)</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الترتيب</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30 text-sm">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-app-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-app-text">{cat.name}</td>
                  <td className="px-6 py-4 text-app-textSec font-medium">{cat.nameEn || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {cat.isActive ? 'مفعل' : 'غير مفعل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{cat.sortOrder}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-8 text-center text-app-textSec">لا توجد نتائج مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-app-card/30">
              <h3 className="text-xl font-bold text-app-text">
                {editingCategory.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-app-textSec hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">اسم القسم (عربي) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">اسم القسم (En)</label>
                  <input 
                      type="text" 
                      className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                      value={editingCategory.nameEn}
                      onChange={(e) => setEditingCategory({...editingCategory, nameEn: e.target.value})}
                  />
               </div>

               <div className="flex items-center gap-6 pt-2">
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-app-text mb-2">الترتيب</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                        value={editingCategory.sortOrder}
                        onChange={(e) => setEditingCategory({...editingCategory, sortOrder: parseInt(e.target.value) || 0})}
                    />
                 </div>
                 <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${editingCategory.isActive ? 'bg-app-gold border-app-gold' : 'border-app-textSec'}`}>
                        {editingCategory.isActive && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input 
                        type="checkbox" 
                        className="hidden"
                        checked={!!editingCategory.isActive}
                        onChange={(e) => setEditingCategory({...editingCategory, isActive: e.target.checked})}
                        />
                        <span className="text-sm font-bold text-app-text">مفعل</span>
                    </label>
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-app-card/30 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 font-bold text-app-textSec hover:bg-gray-200 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave} 
                disabled={!editingCategory.name}
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حفظ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
