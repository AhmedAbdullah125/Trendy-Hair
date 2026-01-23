

import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Box, Package, Image as ImageIcon, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Product, Package as PkgType } from '../../types';

const AdminProducts: React.FC = () => {
  const { products, packages, categories, brands, addProduct, updateProduct, deleteProduct, addPackage, updatePackage, deletePackage } = useData();
  
  const [activeTab, setActiveTab] = useState<'products' | 'packages'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  
  // Simple form state (not complete but functional for demo)
  const [pForm, setPForm] = useState<Partial<Product>>({
    name: '',
    price: '',
    image: '',
    categoryId: '',
    brandId: 0
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setPForm({ name: '', price: '', image: 'https://placehold.co/400', categoryId: categories[0]?.id, brandId: brands[0]?.id });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setPForm(p);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!pForm.name || !pForm.price) return;

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...pForm } as Product);
    } else {
      addProduct({
        name: pForm.name!,
        price: pForm.price!,
        image: pForm.image || 'https://placehold.co/400',
        brandId: Number(pForm.brandId),
        categoryId: pForm.categoryId,
        description: pForm.description || '',
        isActive: true,
        isNew: true
      });
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };

  const filteredProducts = useMemo(() => {
     let res = [...products];
     if (brandFilter !== 'all') {
        res = res.filter(p => p.brandId?.toString() === brandFilter);
     }
     return res;
  }, [products, brandFilter]);

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">المنتجات</h2>
        <button 
          onClick={openAddProduct}
          className="bg-app-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة {activeTab === 'products' ? 'منتج' : 'بكج'} جديد</span>
        </button>
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
      {activeTab === 'products' && (
         <div className="flex gap-4 items-center">
            <span className="text-sm font-bold text-app-textSec">تصفية حسب العلامة التجارية:</span>
            <select 
               className="bg-white border border-app-card rounded-lg px-3 py-2 text-sm outline-none focus:border-app-gold"
               value={brandFilter}
               onChange={(e) => setBrandFilter(e.target.value)}
            >
               <option value="all">الكل</option>
               {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
               ))}
            </select>
         </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        {activeTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">المنتج</th>
                  <th className="px-6 py-4">العلامة التجارية</th>
                  <th className="px-6 py-4">القسم</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-card/30 text-sm">
                {filteredProducts.map(p => {
                  const catName = categories.find(c => c.id === p.categoryId)?.name || '-';
                  const brandName = brands.find(b => b.id === p.brandId)?.name || '-';
                  return (
                    <tr key={p.id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-app-card">
                          <img src={p.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <span className="font-bold text-app-text">{p.name}</span>
                      </td>
                      <td className="px-6 py-4 text-app-textSec">{brandName}</td>
                      <td className="px-6 py-4 text-app-textSec">{catName}</td>
                      <td className="px-6 py-4 font-bold text-app-gold">{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {p.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => openEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-app-textSec">لا توجد منتجات</td>
                  </tr>
                )}
              </tbody>
            </table>
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
                        <button onClick={() => { if(confirm('حذف؟')) deletePackage(pkg.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
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

      {/* Basic Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">اسم المنتج</label>
                <input 
                  className="w-full border p-2 rounded-lg" 
                  value={pForm.name} 
                  onChange={e => setPForm({...pForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">السعر (د.ك)</label>
                  <input 
                    className="w-full border p-2 rounded-lg" 
                    value={pForm.price} 
                    onChange={e => setPForm({...pForm, price: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">القسم</label>
                   <select 
                     className="w-full border p-2 rounded-lg"
                     value={pForm.categoryId}
                     onChange={e => setPForm({...pForm, categoryId: e.target.value})}
                   >
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
              </div>
               <div>
                   <label className="block text-sm font-bold mb-1">العلامة التجارية</label>
                   <select 
                     className="w-full border p-2 rounded-lg"
                     value={pForm.brandId}
                     onChange={e => setPForm({...pForm, brandId: parseInt(e.target.value)})}
                   >
                     {brands.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-500">إلغاء</button>
              <button onClick={handleSaveProduct} className="px-6 py-2 bg-app-gold text-white rounded-lg font-bold">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;