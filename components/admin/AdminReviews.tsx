
import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Search, X, CheckCircle2, Video } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Review } from '../../types';

const AdminReviews: React.FC = () => {
  const { reviews, addReview, updateReview, deleteReview } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [search, setSearch] = useState('');

  // Default new review state
  const defaultReview: Partial<Review> = {
    customerName: '',
    thumbnailUrl: 'https://placehold.co/400x600',
    videoUrl: '',
    isActive: true,
    sortOrder: 0,
    date: new Date().toISOString()
  };

  const openAddModal = () => {
    const maxSortOrder = reviews.length > 0 ? Math.max(...reviews.map(r => r.sortOrder || 0)) : 0;
    setEditingReview({ 
      ...defaultReview,
      sortOrder: maxSortOrder + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview({ ...review });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingReview || !editingReview.customerName) return;

    const reviewData = editingReview as Review;

    if (reviewData.id) {
      updateReview(reviewData);
    } else {
      addReview({ ...reviewData, date: new Date().toISOString() });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المراجعة؟')) {
      deleteReview(id);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => 
      r.customerName.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [reviews, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">المراجعات</h2>
        <button 
          onClick={openAddModal}
          className="bg-app-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة مراجعة جديدة</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-app-card/30 flex items-center gap-4 bg-app-bg/30">
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-app-textSec" size={18} />
              <input 
                type="text" 
                placeholder="بحث باسم العميل..." 
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
                <th className="px-6 py-4">صورة مصغرة</th>
                <th className="px-6 py-4">اسم العميل</th>
                <th className="px-6 py-4">تاريخ الإضافة</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الترتيب</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30 text-sm">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-app-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-app-card bg-white relative group">
                      <img src={review.thumbnailUrl} alt={review.customerName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Video size={16} className="text-white" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-app-text">{review.customerName}</td>
                  <td className="px-6 py-4 text-app-textSec text-xs" dir="ltr">
                    {new Date(review.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${review.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {review.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{review.sortOrder}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEditModal(review)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-8 text-center text-app-textSec">لا توجد مراجعات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-app-card/30">
              <h3 className="text-xl font-bold text-app-text">
                {editingReview.id ? 'تعديل المراجعة' : 'إضافة مراجعة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-app-textSec hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">اسم العميل <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingReview.customerName}
                    onChange={(e) => setEditingReview({...editingReview, customerName: e.target.value})}
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">رابط الفيديو (URL)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold dir-ltr"
                    value={editingReview.videoUrl}
                    onChange={(e) => setEditingReview({...editingReview, videoUrl: e.target.value})}
                    placeholder="https://..."
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">رابط الصورة المصغرة (URL)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold dir-ltr"
                    value={editingReview.thumbnailUrl}
                    onChange={(e) => setEditingReview({...editingReview, thumbnailUrl: e.target.value})}
                  />
                  {editingReview.thumbnailUrl && (
                      <div className="mt-2 w-20 h-28 border border-app-card rounded-lg overflow-hidden bg-white mx-auto">
                          <img src={editingReview.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                  )}
               </div>

               <div className="flex items-center gap-6 pt-2">
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-app-text mb-2">الترتيب</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                        value={editingReview.sortOrder}
                        onChange={(e) => setEditingReview({...editingReview, sortOrder: parseInt(e.target.value) || 0})}
                    />
                 </div>
                 <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${editingReview.isActive ? 'bg-app-gold border-app-gold' : 'border-app-textSec'}`}>
                        {editingReview.isActive && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input 
                        type="checkbox" 
                        className="hidden"
                        checked={!!editingReview.isActive}
                        onChange={(e) => setEditingReview({...editingReview, isActive: e.target.checked})}
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
                disabled={!editingReview.customerName}
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

export default AdminReviews;
