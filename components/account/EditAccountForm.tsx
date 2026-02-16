import React, { useState } from 'react';
import { ArrowRight, User, Phone, Mail, Edit2, Save, CheckCircle2 } from 'lucide-react';

interface EditAccountFormProps {
    currentUser: {
        name: string;
        phone: string;
        email: string;
        photo: string;
    };
    navigate: (path: string) => void;
}

const EditAccountForm: React.FC<EditAccountFormProps> = ({ currentUser, navigate }) => {
    const [name, setName] = useState(currentUser.name || '');
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [email, setEmail] = useState(currentUser.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, photo: 'يرجى اختيار صورة صالحة' });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, photo: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' });
                return;
            }

            setPhotoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Clear photo error if exists
            const newErrors = { ...errors };
            delete newErrors.photo;
            setErrors(newErrors);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) newErrors.name = 'يرجى إدخال الاسم';
        if (!phone.trim()) newErrors.phone = 'يرجى إدخال رقم الهاتف';

        // Basic email validation if entered
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare update data
        const updateData: any = { name, phone };
        if (email.trim()) {
            updateData.email = email;
        }
        if (photoFile) {
            updateData.photo = photoFile;
        }

        try {
            // Call the updateProfile API
            const { updateProfile } = await import('../requests/updateProfile');
            await updateProfile(updateData, setIsLoading, 'ar', navigate);

            setSuccessMsg('تم حفظ التعديلات بنجاح');
            setErrors({});

            setTimeout(() => {
                navigate('/account');
            }, 1500);
        } catch (error) {
            console.error('Update profile error:', error);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn bg-app-bg font-alexandria">
            <header className="flex items-center gap-4 px-6 mb-8 pt-2">
                <button
                    onClick={() => navigate('/account')}
                    className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex items-center gap-2"
                >
                    <ArrowRight size={24} />
                </button>
                <h1 className="text-xl font-bold text-app-text flex-1 text-center pl-10">تعديل الحساب</h1>
            </header>

            <form onSubmit={handleSave} className="flex-1 px-6 space-y-5 overflow-y-auto no-scrollbar pb-24">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="relative">
                        {photoPreview || (currentUser.photo && !currentUser.photo.includes('unknown.svg')) ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-app-gold/20">
                                <img
                                    src={photoPreview || currentUser.photo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-app-gold/10 border-4 border-app-gold/20 flex items-center justify-center">
                                <User size={48} className="text-app-gold/50" />
                            </div>
                        )}
                        <label
                            htmlFor="photo-upload"
                            className="absolute bottom-0 right-0 p-2 bg-app-gold rounded-full cursor-pointer shadow-lg hover:bg-app-goldDark transition-colors"
                        >
                            <Edit2 size={16} className="text-white" />
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>
                    {errors.photo && <p className="text-red-500 text-xs font-bold">{errors.photo}</p>}
                    <p className="text-[10px] text-app-textSec text-center">اضغط على الأيقونة لتغيير الصورة</p>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-app-text mb-2">الاسم</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full p-4 bg-white border rounded-2xl outline-none focus:border-app-gold text-right pr-12 text-app-text font-medium ${errors.name ? 'border-red-500' : 'border-app-card'}`}
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-bold text-app-text mb-2">رقم الهاتف</label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full p-4 bg-white border rounded-2xl outline-none focus:border-app-gold text-right pr-12 text-app-text font-medium ${errors.phone ? 'border-red-500' : 'border-app-card'}`}
                            dir="ltr"
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
                </div>

                {/* Email (Optional) */}
                <div>
                    <label className="block text-sm font-bold text-app-text mb-2">البريد الإلكتروني <span className="text-[10px] text-app-textSec font-normal">(اختياري)</span></label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-4 bg-white border rounded-2xl outline-none focus:border-app-gold text-right pr-12 text-app-text font-medium ${errors.email ? 'border-red-500' : 'border-app-card'}`}
                            dir="ltr"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                </div>

                {/* Success Toast */}
                {successMsg && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold animate-scaleIn">
                        <CheckCircle2 size={20} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4 space-y-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>حفظ التعديلات</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/account')}
                        className="w-full text-app-textSec font-bold py-3 hover:bg-white rounded-2xl transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAccountForm;
