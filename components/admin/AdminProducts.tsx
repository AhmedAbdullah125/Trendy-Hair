
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Package as PkgType } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetAdminProducts } from '../requests/useGetAdminProducts';
import { useDeleteAdminProduct } from '../requests/useDeleteAdminProduct';
import { useAddAdminProduct } from '../requests/useAddAdminProduct';
import { useUpdateAdminProduct } from '../requests/useUpdateAdminProduct';
import { useGetAdminCategories } from '../requests/useGetAdminCategories';
import { useGetAdminBrands } from '../requests/useGetAdminBrands';

interface ProductFormData {
  id?: number;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  discounted_price?: number;
  quantity?: number;
  brand_id?: number;
  category_id?: number;
  position?: number;
  is_active: boolean;
  is_recently: boolean;
  image?: File;
  imageUrl?: string;
}

const AdminProducts: React.FC = () => {
  const { packages, deletePackage } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'products' | 'packages'>('products');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

  // Fetch products from API
  const { data, isLoading, error, refetch } = useGetAdminProducts(pageSize, currentPage, 'ar');

  // Fetch categories and brands for form selects
  const { data: categoriesData } = useGetAdminCategories(1000, 1, 'ar');
  const { data: brandsData } = useGetAdminBrands(1000, 1, 'ar');

  // Mutations
  const deleteMutation = useDeleteAdminProduct();
  const addMutation = useAddAdminProduct();
  const updateMutation = useUpdateAdminProduct();

  const products = data?.items?.data || [];
  const pagination = data?.items?.pagination || {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    page_size: 10
  };

  // Check for success message from redirect
  useEffect(() => {
    if (location.state?.successMessage) {
      setShowToast(location.state.successMessage);
      // Clear state history
      window.history.replaceState({}, document.title);
      // Auto hide
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [location]);

  // Client-side filtering based on brand and category
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (brandFilter !== 'all') {
      result = result.filter(p => p.brand.id.toString() === brandFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.id.toString() === categoryFilter);
    }

    return result;
  }, [products, brandFilter, categoryFilter]);

  // Get unique brands and categories from current products
  const availableBrands = useMemo(() => {
    const brandMap = new Map();
    products.forEach(p => {
      if (!brandMap.has(p.brand.id)) {
        brandMap.set(p.brand.id, p.brand);
      }
    });
    return Array.from(brandMap.values());
  }, [products]);

  const availableCategories = useMemo(() => {
    const categoryMap = new Map();
    products.forEach(p => {
      if (!categoryMap.has(p.category.id)) {
        categoryMap.set(p.category.id, p.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [products]);

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteMutation.mutateAsync(productToDelete);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditingProduct({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: 0,
      discounted_price: 0,
      quantity: 0,
      brand_id: undefined,
      category_id: undefined,
      position: 0,
      is_active: true,
      is_recently: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct({
      id: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      price: product.price,
      discounted_price: product.discounted_price,
      quantity: product.quantity,
      brand_id: product.brand.id,
      category_id: product.category.id,
      position: product.position || 0,
      is_active: product.is_active,
      is_recently: product.is_recently,
      imageUrl: product.main_image
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct || !editingProduct.name_ar || !editingProduct.price) return;

    const productData = {
      name_ar: editingProduct.name_ar,
      name_en: editingProduct.name_en,
      description_ar: editingProduct.description_ar,
      description_en: editingProduct.description_en,
      price: editingProduct.price,
      discounted_price: editingProduct.discounted_price,
      quantity: editingProduct.quantity,
      brand_id: editingProduct.brand_id,
      category_id: editingProduct.category_id,
      position: editingProduct.position,
      is_active: editingProduct.is_active ? 1 : 0,
      is_recently: editingProduct.is_recently ? 1 : 0,
      image: editingProduct.image
    };

    if (editingProduct.id) {
      // Update existing product
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        ...productData
      });
    } else {
      // Add new product
      await addMutation.mutateAsync(productData);
    }

    setIsModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
      // Reset filters when changing page
      setBrandFilter('all');
      setCategoryFilter('all');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-scaleIn font-bold">
          <CheckCircle2 size={20} />
          <span>{showToast}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">المنتجات</h2>

        {activeTab === 'products' && (
          <button
            onClick={openAddModal}
            className="bg-app-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2"
          >
            <Plus size={20} />
            <span>إضافة منتج جديد</span>
          </button>
        )}

        {activeTab === 'packages' && (
          <button
            onClick={() => alert("إدارة البكجات قيد التطوير")}
            className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"
          >
            <Plus size={20} />
            <span>إضافة بكج جديد</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-app-card/30">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'products' ? 'border-app-gold text-app-gold' : 'border-transparent text-app-textSec'}`}
        >
          المنتجات
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'packages' ? 'border-app-gold text-app-gold' : 'border-transparent text-app-textSec'}`}
        >
          البكجات والعروض
        </button>
      </div>

      {/* Filters (Products only) */}
      {activeTab === 'products' && !isLoading && (
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-sm font-bold text-app-textSec">تصفية:</span>
          <select
            className="bg-white border border-app-card rounded-lg px-3 py-2 text-sm outline-none focus:border-app-gold"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">كل العلامات التجارية</option>
            {availableBrands.map(b => (
              <option key={b.id} value={b.id}>{b.name_ar}</option>
            ))}
          </select>
          <select
            className="bg-white border border-app-card rounded-lg px-3 py-2 text-sm outline-none focus:border-app-gold"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">كل الأقسام</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name_ar}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        {activeTab === 'products' ? (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-app-gold/30 border-t-app-gold rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-app-textSec">جاري تحميل المنتجات...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-500 font-bold">حدث خطأ في تحميل المنتجات</p>
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
                    <th className="px-6 py-4">المنتج</th>
                    <th className="px-6 py-4">العلامة التجارية</th>
                    <th className="px-6 py-4">القسم</th>
                    <th className="px-6 py-4">السعر</th>
                    <th className="px-6 py-4">المخزون</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-card/30 text-sm">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-app-bg/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-app-card">
                          <img src={p.main_image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="font-bold text-app-text">{p.name_ar}</div>
                          <div className="text-xs text-app-textSec">{p.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-app-textSec">{p.brand.name_ar}</td>
                      <td className="px-6 py-4 text-app-textSec">{p.category.name_ar}</td>
                      <td className="px-6 py-4">
                        {p.has_discount ? (
                          <div>
                            <div className="font-bold text-app-gold">{p.discounted_price} ر.س</div>
                            <div className="text-xs text-app-textSec line-through">{p.price} ر.س</div>
                          </div>
                        ) : (
                          <div className="font-bold text-app-gold">{p.price} ر.س</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${p.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                          {p.quantity} متوفر
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {p.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-app-textSec">لا توجد منتجات مطابقة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {!isLoading && !error && pagination.total_pages > 1 && (
              <div className="p-4 border-t border-app-card/30 flex items-center justify-between bg-app-bg/30">
                <div className="text-sm text-app-textSec">
                  صفحة {pagination.current_page} من {pagination.total_pages} • إجمالي المنتجات: {pagination.total_items}
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
        ) : (
          <div className="overflow-x-auto">
            {/* Packages List */}
            <table className="w-full text-right">
              <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">البكج</th>
                  <th className="px-6 py-4">عدد المنتجات</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-card/30 text-sm">
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 font-bold text-app-text">{pkg.name}</td>
                    <td className="px-6 py-4">{pkg.productIds.length}</td>
                    <td className="px-6 py-4 font-bold text-app-gold">{pkg.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${pkg.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {pkg.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                      <button onClick={() => { if (confirm('حذف؟')) deletePackage(pkg.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-app-textSec">لا توجد بكجات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center p-6 border-b border-app-card/30">
              <h3 className="text-xl font-bold text-app-text">
                {editingProduct.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-app-textSec hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">
                    اسم المنتج (عربي) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.name_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">اسم المنتج (En)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.name_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">الوصف (عربي)</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold resize-none"
                    value={editingProduct.description_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">الوصف (En)</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold resize-none"
                    value={editingProduct.description_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                  />
                </div>
              </div>

              {/* Category and Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">القسم</label>
                  <select
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value) })}
                  >
                    <option value="">اختر القسم</option>
                    {categoriesData?.items?.data?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">العلامة التجارية</label>
                  <select
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.brand_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand_id: parseInt(e.target.value) })}
                  >
                    <option value="">اختر العلامة التجارية</option>
                    {brandsData?.items?.data?.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>{brand.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">
                    السعر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">سعر الخصم</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.discounted_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discounted_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">الكمية</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.quantity || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-app-text mb-2">صورة المنتج</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingProduct({ ...editingProduct, image: file });
                      }
                    }}
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-app-gold file:text-white hover:file:bg-app-goldDark cursor-pointer"
                  />

                  {(editingProduct.image || editingProduct.imageUrl) && (
                    <div className="relative w-32 h-32 border-2 border-app-card rounded-xl overflow-hidden">
                      <img
                        src={editingProduct.image ? URL.createObjectURL(editingProduct.image) : editingProduct.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {editingProduct.image && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          جديد
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Position and Status */}
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-bold text-app-text mb-2">الترتيب</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingProduct.position || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, position: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${editingProduct.is_active ? 'bg-app-gold border-app-gold' : 'border-app-textSec'}`}>
                      {editingProduct.is_active && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!editingProduct.is_active}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-app-text">مفعل</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${editingProduct.is_recently ? 'bg-app-gold border-app-gold' : 'border-app-textSec'}`}>
                      {editingProduct.is_recently && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!editingProduct.is_recently}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_recently: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-app-text">إضافة حديثة</span>
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
                disabled={!editingProduct.name_ar || !editingProduct.price || addMutation.isPending || updateMutation.isPending}
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(addMutation.isPending || updateMutation.isPending) && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{editingProduct.id ? 'تحديث' : 'حفظ'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slideUp">

            <div className="bg-red-500 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">تأكيد الحذف</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-app-text font-bold text-lg mb-2">هل أنت متأكد من حذف هذا المنتج؟</p>
              <p className="text-app-textSec text-sm">لا يمكن التراجع عن هذا الإجراء</p>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProductToDelete(null);
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

export default AdminProducts;
