import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, ArrowRight, Upload, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Product } from '../../types';

const AdminProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, categories, brands, addProduct, updateProduct } = useData();
  
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: '',
    oldPrice: '',
    image: '',
    images: [],
    description: '',
    categoryId: '',
    brandId: undefined,
    isActive: true,
    isNew: true
  });

  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const productToEdit = products.find(p => p.id === Number(id));
      if (productToEdit) {
        setFormData(productToEdit);
        setAdditionalImages(productToEdit.images || []);
      } else {
        navigate('/admin/products');
      }
    } else {
      // Set defaults for new product
      if (categories.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }
      if (brands.length > 0 && !formData.brandId) {
        setFormData(prev => ({ ...prev, brandId: brands[0].id }));
      }
    }
  }, [id, products, isEditMode, navigate, categories, brands]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name?.trim()) newErrors.name = 'اسم المنتج مطلوب';
    if (!formData.price?.trim()) newErrors.price = 'السعر مطلوب';
    if (!formData.categoryId) newErrors.categoryId = 'القسم مطلوب';
    if (!formData.image) newErrors.image = 'الصورة الرئيسية مطلوبة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const productData = {
        ...formData,
        images: additionalImages, // Save the additional images list
        // Ensure image has a fallback if something went wrong, though validate checks it
        image: formData.image || '', 
        brandId: Number(formData.brandId),
        // Ensure required fields for type safety
        name: formData.name!,
        price: formData.price!,
        categoryId: formData.categoryId!
    };

    if (isEditMode && id) {
      updateProduct(productData as Product);
    } else {
      addProduct(productData as any); // addProduct expects Omit<Product, 'id'>
    }

    // Navigate back with success state
    navigate('/admin/products', { 
        state: { successMessage: isEditMode ? 'تم حفظ التعديلات بنجاح' : 'تم إضافة المنتج بنجاح' } 
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
          alert('يرجى اختيار ملف صورة صحيح (jpg, png, webp)');
          return;
      }
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, image: base64 }));
        setErrors(prev => ({ ...prev, image: '' }));
      } catch (err) {
        console.error('Error converting file', err);
        alert('حدث خطأ أثناء رفع الصورة');
      }
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 3 - additionalImages.length;
      if (remainingSlots <= 0) return;

      const filesToProcess: File[] = Array.from(files).slice(0, remainingSlots);
      const newImages: string[] = [];

      for (const file of filesToProcess) {
         if (file.type.startsWith('image/')) {
            try {
               const base64 = await fileToBase64(file);
               newImages.push(base64);
            } catch (err) {
               console.error('Error converting additional image', err);
            }
         }
      }
      
      setAdditionalImages(prev => [...prev, ...newImages]);
      // Reset input value to allow selecting same file again if needed
      if (additionalImageInputRef.current) additionalImageInputRef.current.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/admin/products')}
                className="p-2 bg-white border border-app-card rounded-xl text-app-textSec hover:text-app-text transition-colors"
            >
                <ArrowRight size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-app-text">
                    {isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h2>
                <p className="text-sm text-app-textSec mt-1">
                    {isEditMode ? `ID: ${id}` : 'أدخل بيانات المنتج الجديد'}
                </p>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 font-bold text-app-textSec bg-white border border-app-card hover:bg-gray-50 rounded-xl transition-colors"
            >
                إلغاء
            </button>
            <button 
                onClick={handleSave}
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark transition-colors flex items-center gap-2 shadow-lg shadow-app-gold/20"
            >
                <Save size={18} />
                <span>{isEditMode ? 'حفظ التعديلات' : 'حفظ المنتج'}</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Basic Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
                <h3 className="text-lg font-bold text-app-text mb-6">البيانات الأساسية</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-app-text mb-2">اسم المنتج <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className={`w-full p-3 border rounded-xl outline-none focus:border-app-gold ${errors.name ? 'border-red-500' : 'border-app-card'}`}
                            placeholder="مثال: شامبو معالج للشعر"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-app-text mb-2">السعر (د.ك) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={`w-full p-3 border rounded-xl outline-none focus:border-app-gold ${errors.price ? 'border-red-500' : 'border-app-card'}`}
                                placeholder="0.000"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-app-text mb-2">السعر القديم (اختياري)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                                placeholder="0.000"
                                value={formData.oldPrice || ''}
                                onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-app-text mb-2">الوصف</label>
                        <textarea 
                            className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold h-32 resize-none"
                            placeholder="أدخل وصفاً تفصيلياً للمنتج..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Media Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
                <h3 className="text-lg font-bold text-app-text mb-6 flex items-center gap-2">
                    <ImageIcon size={20} className="text-app-gold" />
                    الصور والوسائط
                </h3>
                
                <div className="space-y-6">
                    {/* Main Image */}
                    <div>
                        <label className="block text-sm font-bold text-app-text mb-3">الصورة الرئيسية <span className="text-red-500">*</span></label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={mainImageInputRef}
                            onChange={handleMainImageUpload}
                        />
                        
                        {formData.image ? (
                            <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden border border-app-card shadow-sm group">
                                <img 
                                    src={formData.image} 
                                    alt="Main" 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <button 
                                        onClick={() => mainImageInputRef.current?.click()}
                                        className="bg-white text-app-text text-xs font-bold py-2 px-4 rounded-xl hover:bg-app-bg"
                                    >
                                        تغيير الصورة
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => mainImageInputRef.current?.click()}
                                className={`w-full max-w-[200px] aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50 hover:border-app-gold ${errors.image ? 'border-red-300 bg-red-50' : 'border-app-card'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-app-bg flex items-center justify-center text-app-gold mb-2">
                                    <Upload size={20} />
                                </div>
                                <span className="text-sm font-bold text-app-textSec">رفع صورة</span>
                                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP</span>
                            </div>
                        )}
                        {errors.image && <p className="text-red-500 text-xs mt-2 font-bold">{errors.image}</p>}
                    </div>

                    {/* Additional Images */}
                    <div>
                        <label className="block text-sm font-bold text-app-text mb-3">الصور الإضافية (حد أقصى 3)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden" 
                            ref={additionalImageInputRef}
                            onChange={handleAdditionalImageUpload}
                        />
                        
                        <div className="flex gap-4 flex-wrap">
                            {additionalImages.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-app-card shadow-sm group">
                                    <img src={img} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => removeAdditionalImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            
                            {additionalImages.length < 3 && (
                                <button 
                                    onClick={() => additionalImageInputRef.current?.click()}
                                    className="w-24 h-24 rounded-xl border-2 border-dashed border-app-card flex flex-col items-center justify-center hover:border-app-gold hover:bg-gray-50 transition-colors text-app-textSec hover:text-app-gold"
                                >
                                    <Plus size={24} />
                                    <span className="text-[10px] font-bold mt-1">إضافة</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
            {/* Organization */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
                <h3 className="text-lg font-bold text-app-text mb-6">التصنيف</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-app-text mb-2">القسم</label>
                        <select 
                            className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold bg-white"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-app-text mb-2">العلامة التجارية</label>
                        <select 
                            className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold bg-white"
                            value={formData.brandId}
                            onChange={(e) => setFormData({...formData, brandId: Number(e.target.value)})}
                        >
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Status & Visibility */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
                <h3 className="text-lg font-bold text-app-text mb-6">الحالة والظهور</h3>
                
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-app-bg rounded-xl border border-app-card cursor-pointer">
                        <span className="text-sm font-bold text-app-text">منتج نشط</span>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.isActive ? '-translate-x-6' : '-translate-x-0'}`} />
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={formData.isActive}
                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-app-bg rounded-xl border border-app-card cursor-pointer">
                        <span className="text-sm font-bold text-app-text">منتج جديد (New)</span>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isNew ? 'bg-app-gold' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.isNew ? '-translate-x-6' : '-translate-x-0'}`} />
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={formData.isNew}
                            onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                        />
                    </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;