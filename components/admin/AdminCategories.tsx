
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAdminCategories } from '../requests/useGetAdminCategories';
import { useAddAdminCategory } from '../requests/useAddAdminCategory';
import { useUpdateAdminCategory } from '../requests/useUpdateAdminCategory';
import { useDeleteAdminCategory } from '../requests/useDeleteAdminCategory';

interface CategoryFormData {
  id?: number;
  name: string;
  nameEn?: string;
  isActive: boolean;
  sortOrder: number;
  image?: File;
  imageUrl?: string; // For displaying existing image
}

const AdminCategories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryFormData> | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Fetch categories from API
  const { data, isLoading, error, refetch } = useGetAdminCategories(pageSize, currentPage, 'ar');

  // Mutations
  const addMutation = useAddAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const categories = data?.items?.data || [];
  const pagination = data?.items?.pagination || {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    page_size: 10
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((cat: any) =>
    cat.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
    cat.name_en?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    // Calculate new sort order (last + 1)
    const maxSortOrder = categories.length > 0 ? Math.max(...categories.map((c: any) => c.position || 0)) : 0;

    setEditingCategory({
      name: '',
      nameEn: '',
      isActive: true,
      sortOrder: maxSortOrder + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name_ar,
      nameEn: cat.name_en,
      isActive: cat.is_active === 1,
      sortOrder: cat.position,
      imageUrl: cat.image // Store existing image URL
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory || !editingCategory.name) return;

    if (editingCategory.id) {
      // Update existing category
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        name_ar: editingCategory.name,
        name_en: editingCategory.nameEn,
        position: editingCategory.sortOrder,
        is_active: editingCategory.isActive ? 1 : 0,
        image: editingCategory.image
      });
    } else {
      // Add new category
      await addMutation.mutateAsync({
        name_ar: editingCategory.name,
        name_en: editingCategory.nameEn,
        position: editingCategory.sortOrder,
        is_active: editingCategory.isActive ? 1 : 0,
        image: editingCategory.image
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteMutation.mutateAsync(categoryToDelete);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

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
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-app-gold/30 border-t-app-gold rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-app-textSec">جاري تحميل الأقسام...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-red-500 font-bold">حدث خطأ في تحميل الأقسام</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-6 py-2 bg-app-gold text-white rounded-xl hover:bg-app-goldDark"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">الصورة</th>
                  <th className="px-6 py-4">الاسم (عربي)</th>
                  <th className="px-6 py-4">الاسم (إنجليزي)</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">الترتيب</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-card/30 text-sm">
                {filteredCategories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={cat.image}
                        alt={cat.name_ar}
                        className="w-12 h-12 object-cover rounded-lg border border-app-card/30"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-app-text">{cat.name_ar}</td>
                    <td className="px-6 py-4 text-app-textSec font-medium">{cat.name_en || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {cat.is_active ? 'مفعل' : 'غير مفعل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{cat.position}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEditModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-app-textSec">لا توجد نتائج مطابقة</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && pagination.total_pages > 1 && (
          <div className="p-4 border-t border-app-card/30 flex items-center justify-between bg-app-bg/30">
            <div className="text-sm text-app-textSec">
              صفحة {pagination.current_page} من {pagination.total_pages} • إجمالي الأقسام: {pagination.total_items}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-app-card hover:bg-app-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
              {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                let page;
                if (pagination.total_pages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= pagination.total_pages - 2) {
                  page = pagination.total_pages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === page
                      ? 'bg-app-gold text-white'
                      : 'border border-app-card hover:bg-app-bg'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.total_pages}
                className="p-2 rounded-lg border border-app-card hover:bg-app-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        )}
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
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-app-text mb-2">اسم القسم (En)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                  value={editingCategory.nameEn}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-app-text mb-2">صورة القسم</label>
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingCategory({ ...editingCategory, image: file });
                        }
                      }}
                      className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-app-gold file:text-white hover:file:bg-app-goldDark cursor-pointer"
                    />
                  </div>

                  {/* Image Preview */}
                  {(editingCategory.image || editingCategory.imageUrl) && (
                    <div className="relative w-32 h-32 border-2 border-app-card rounded-xl overflow-hidden">
                      <img
                        src={editingCategory.image ? URL.createObjectURL(editingCategory.image) : editingCategory.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {editingCategory.image && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          جديد
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-app-text mb-2">الترتيب</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingCategory.sortOrder}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sortOrder: parseInt(e.target.value) || 0 })}
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
                      onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
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
                disabled={!editingCategory.name || addMutation.isPending || updateMutation.isPending}
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(addMutation.isPending || updateMutation.isPending) && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{editingCategory.id ? 'تحديث' : 'حفظ'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slideUp">

            {/* Header */}
            <div className="bg-red-500 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">تأكيد الحذف</h3>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-app-text font-bold text-lg mb-2">هل أنت متأكد من حذف هذا القسم؟</p>
              <p className="text-app-textSec text-sm">لا يمكن التراجع عن هذا الإجراء</p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-6 py-3 font-bold text-app-text bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteMutation.isPending && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>حذف</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
