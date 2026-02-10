import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone, Loader2 } from 'lucide-react';
import { adminLoginRequest } from '../requests/adminLoginRequest';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { phone?: string; password?: string } = {};

        if (!formData.phone.trim()) {
            newErrors.phone = 'رقم الهاتف مطلوب';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'كلمة المرور مطلوبة';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await adminLoginRequest(formData, setLoading, 'ar');

        if (result.success) {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7F4EE] via-[#FFF9F0] to-[#F7F4EE] flex items-center justify-center p-4 font-alexandria" dir="rtl">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-app-gold to-app-goldDark rounded-2xl shadow-xl mb-4">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-app-text mb-2">
                        لوحة إدارة تريندي
                    </h1>
                    <p className="text-app-textSec">
                        قم بتسجيل الدخول للوصول إلى لوحة التحكم
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Phone Input */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-app-text mb-2">
                                رقم الهاتف
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${errors.phone
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-app-card/30 focus:border-app-gold'
                                        }`}
                                    placeholder="أدخل رقم الهاتف"
                                    disabled={loading}
                                />
                                <Phone
                                    size={20}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-400' : 'text-app-textSec'
                                        }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-app-text mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pr-12 pl-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${errors.password
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-app-card/30 focus:border-app-gold'
                                        }`}
                                    placeholder="أدخل كلمة المرور"
                                    disabled={loading}
                                />
                                <Lock
                                    size={20}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-app-textSec'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-gold transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-app-gold to-app-goldDark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-app-gold/30 hover:shadow-xl hover:shadow-app-gold/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>جاري تسجيل الدخول...</span>
                                </>
                            ) : (
                                <span>تسجيل الدخول</span>
                            )}
                        </button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-app-textSec">
                            مخصص لإدارة النظام فقط
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-app-textSec">
                        © 2026 Trendy Hair. جميع الحقوق محفوظة
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
