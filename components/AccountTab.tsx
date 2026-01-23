import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Heart, ClipboardList, Info, Mail, Phone, ChevronLeft, XCircle, Instagram, Ghost, Music2, ArrowRight, ShoppingBag, Package, Plus, Minus, Wallet, QrCode, Gamepad2, Award, Calendar, ArrowDownLeft, ArrowUpRight, History, Trash2, User, Lock, Eye, EyeOff, Edit2, Save, CheckCircle2
} from 'lucide-react';
import { Order } from '../App';
import { Product, WalletTransaction } from '../types';
import { LOYALTY_POINT_VALUE_KD, DEMO_REWARDS_TRANSACTIONS, DEMO_CASHBACK_TRANSACTIONS } from '../constants';
import ProductCard from './ProductCard';
import { useGetProfile } from './requests/useGetProfile';

interface AccountTabProps {
  orders: Order[];
  onNavigateToHome: () => void;
  initialOrderId?: string | null;
  onClearInitialOrder?: () => void;
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  gameBalance: number;
  loyaltyPoints: number;
  onLogout: () => void;
}

const STORAGE_SESSION_KEY = 'trandy_current_session';
const STORAGE_USERS_KEY = 'trandy_users_v1';


const AccountTab: React.FC<AccountTabProps> = ({ orders, onNavigateToHome, initialOrderId, onClearInitialOrder, favourites, onToggleFavourite, onAddToCart, gameBalance, loyaltyPoints, onLogout }) => {
  const navigate = useNavigate();

  // Fetch profile data from API
  const { data: profileData, isLoading: profileLoading, error: profileError } = useGetProfile('ar');

  // Use profile data or fallback
  const currentUser = useMemo(() => {
    if (profileData) {
      return {
        name: profileData.name || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        photo: profileData.photo || '',
        wallet: profileData.wallet || '0.00'
      };
    }
    return { name: '', phone: '', email: '', photo: '', wallet: '0.00' };
  }, [profileData]);

  useEffect(() => {
    if (initialOrderId) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        navigate(`/account/order/${order.id}`);
        onClearInitialOrder?.();
      }
    }
  }, [initialOrderId, orders, onClearInitialOrder, navigate]);

  const Menu = () => (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-app-text">الحساب</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] p-5 flex items-center justify-between shadow-sm mb-4 border border-app-card/30">
        <div className="flex items-center gap-4">
          {currentUser.photo && !currentUser.photo.includes('unknown.svg') ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-app-gold/10 flex-shrink-0 shadow-inner">
              <img
                src={currentUser.photo}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-app-gold/10 border-2 border-app-gold/20 flex-shrink-0 shadow-inner flex items-center justify-center">
              <User size={32} className="text-app-gold/50" />
            </div>
          )}
          <div className="flex flex-col text-right">
            <span className="font-bold text-lg text-app-text">{currentUser.name}</span>
            <span className="text-sm text-app-textSec font-medium" dir="ltr">{currentUser.phone}</span>
            <button
              onClick={() => navigate('/account/edit')}
              className="flex items-center gap-1 text-[10px] font-bold text-app-gold mt-1 hover:text-app-goldDark transition-colors w-fit"
            >
              <Edit2 size={12} />
              <span>تعديل الحساب</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-2xl transition-all active:scale-95"
          >
            <span className="mt-0.5">تسجيل الخروج</span>
            <XCircle size={22} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Cards Grid (3 Columns) - All Square Aspect Ratio */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        {/* Game Wallet Card - Clickable */}
        <div
          onClick={() => navigate('/account/wallet/rewards')}
          className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-app-card/30 flex flex-col justify-between relative overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform"
        >
          <div className="absolute -bottom-2 -right-2 p-2 opacity-5">
            <Gamepad2 size={48} />
          </div>
          <div className="flex flex-col items-start gap-1 z-10">
            <div className="p-1.5 bg-app-bg rounded-xl text-app-gold shrink-0">
              <Wallet size={14} />
            </div>
            <span className="text-[11px] font-bold text-app-text leading-tight">رصيد الجوائز</span>
          </div>
          <div className="z-10">
            <span className="text-lg font-bold text-app-gold block leading-none mb-0.5">{gameBalance} دك</span>
            <span className="text-[8px] font-medium text-app-textSec block leading-tight">العبي للحصول على المزيد من رصيد الجوائز</span>
          </div>
        </div>

        {/* Loyalty Points Card - Clickable */}
        <div
          onClick={() => navigate('/account/wallet/cashback')}
          className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-app-card/30 flex flex-col justify-between relative overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform"
        >
          <div className="absolute -bottom-2 -right-2 p-2 opacity-5">
            <Award size={48} />
          </div>
          <div className="flex flex-col items-start gap-1 z-10">
            <div className="p-1.5 bg-app-bg rounded-xl text-app-gold shrink-0">
              <Award size={14} />
            </div>
            <span className="text-[11px] font-bold text-app-text leading-tight">كاش باك</span>
          </div>
          <div className="z-10">
            <span className="text-lg font-bold text-app-gold block leading-none mb-0.5">{loyaltyPoints}</span>
            <span className="text-[8px] font-medium text-app-textSec block leading-tight">100 ≈ 1 دك</span>
          </div>
        </div>

        {/* QR Code Card - Image Only */}
        <div className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-app-card/30 flex items-center justify-center relative overflow-hidden aspect-square">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TrandyHair-User-${currentUser.phone}&color=1F1F1F&bgcolor=FFFFFF`}
            alt="User QR Code"
            className="w-full h-full object-contain mix-blend-multiply opacity-90 p-1"
          />
        </div>

      </div>

      {/* Info Menu List */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-app-card/30 mb-10">

        {/* Orders */}
        <div
          onClick={() => navigate('/account/history')}
          className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
              <ShoppingBag size={22} />
            </div>
            <span className="text-sm font-bold text-app-text">طلباتي السابقة</span>
          </div>
          <ChevronLeft className="text-app-textSec opacity-40" size={20} />
        </div>

        {/* About */}
        <div className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
              <Info size={22} />
            </div>
            <span className="text-sm font-bold text-app-text">عن Trandy Hair</span>
          </div>
          <ChevronLeft className="text-app-textSec opacity-40" size={20} />
        </div>

        {/* Email */}
        <div className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
              <Mail size={22} />
            </div>
            <span className="text-sm font-bold text-app-text">Trendhair@info.com</span>
          </div>
          <ChevronLeft className="text-app-textSec opacity-40" size={20} />
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between p-5 active:bg-app-bg transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
              <Phone size={22} />
            </div>
            <span className="text-sm font-bold text-app-text" dir="ltr">96554647655</span>
          </div>
          <ChevronLeft className="text-app-textSec opacity-40" size={20} />
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center items-center gap-8 mb-4">
        <button className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg">
          <Music2 size={26} />
        </button>
        <button className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg">
          <Instagram size={26} />
        </button>
        <button className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg">
          <Ghost size={26} fill="currentColor" />
        </button>
      </div>
    </div>
  );

  const EditAccount = () => {
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
        const { updateProfile } = await import('./requests/updateProfile');
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

  const WalletDetailsPage: React.FC<{
    title: string;
    balance: number;
    currencyLabel: string;
    explanation: string;
    transactions: WalletTransaction[];
  }> = ({ title, balance, currencyLabel, explanation, transactions }) => {

    // Format date helper
    const formatDate = (isoString: string) => {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    return (
      <div className="animate-fadeIn h-full flex flex-col">
        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/account')}
            className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-xl font-bold text-app-text">{title}</h1>
        </header>

        {/* Header Summary */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-app-card/30 mb-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-app-text">
            <Wallet size={120} />
          </div>
          <h2 className="text-sm font-bold text-app-textSec mb-2">الرصيد الحالي</h2>
          <div className="text-4xl font-bold text-app-gold mb-4 font-alexandria flex items-end gap-1">
            <span>{balance}</span>
            <span className="text-base mb-1.5 opacity-80">{currencyLabel}</span>
          </div>
          <p className="text-xs text-app-textSec leading-relaxed max-w-[80%] mx-auto">
            {explanation}
          </p>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          <div className="flex items-center gap-2 mb-4 px-2">
            <History size={16} className="text-app-textSec" />
            <h3 className="text-sm font-bold text-app-text">سجل العمليات</h3>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              const isDebit = tx.type === 'debit';
              const isExpiry = tx.type === 'expiry';

              const isNegative = isDebit || isExpiry;

              return (
                <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-app-card/20 flex gap-4 items-start">
                  {/* Icon Box */}
                  <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                      ${isCredit ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}
                   `}>
                    {isCredit ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-lg font-bold font-alexandria ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : '−'}{tx.amount} {currencyLabel}
                      </span>
                      <span className="text-[10px] font-bold text-app-textSec bg-app-bg px-2 py-1 rounded-lg">
                        {formatDate(tx.date)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-app-text mb-2 leading-snug">
                      {tx.description}
                    </p>

                    {isCredit && tx.expiryDate && (
                      <div className="flex items-center gap-1 text-[10px] text-app-textSec">
                        <Calendar size={10} />
                        <span>صالح حتى {formatDate(tx.expiryDate)}</span>
                      </div>
                    )}

                    {isExpiry && (
                      <span className="text-[10px] text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">
                        منتهي الصلاحية
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const OrdersHistory = () => (
    <div className="animate-fadeIn h-full flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/account')}
          className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold text-app-text">سجل طلباتي</h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-app-gold/40 border border-app-card/30">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-app-text mb-6">لا يوجد أي طلبات حتى الآن</h2>
          <button
            onClick={onNavigateToHome}
            className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
          >
            تسوّق الآن
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-app-text">رقم الطلب: {order.id}</span>
                <span className="text-[10px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-app-textSec">
                  <span>تاريخ الطلب:</span>
                  <span className="font-medium" dir="ltr">{order.date}</span>
                </div>
                <div className="flex justify-between text-xs text-app-textSec">
                  <span>عدد المنتجات:</span>
                  <span className="font-medium">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-app-text">
                  <span>الإجمالي:</span>
                  <span className="text-app-gold">{order.total}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/account/order/${order.id}`)}
                className="w-full py-3 text-app-gold font-bold text-sm bg-app-bg rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const OrderDetails = () => {
    const { orderId } = useParams();
    const selectedOrder = orders.find(o => o.id === orderId);

    if (!selectedOrder) return null;
    const subtotal = selectedOrder.items.reduce((sum, item) => {
      const price = parseFloat(item.product.price.replace(/[^\d.]/g, ''));
      return sum + (price * item.quantity);
    }, 0).toFixed(3);
    const deliveryFee = "2.000";
    const grandTotal = (parseFloat(subtotal) + parseFloat(deliveryFee)).toFixed(3);

    return (
      <div className="animate-fadeIn h-full flex flex-col">
        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/account/history')}
            className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-xl font-bold text-app-text">تفاصيل الطلب</h1>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-10">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-app-bg rounded-xl text-app-gold">
                <Package size={20} />
              </div>
              <span className="text-sm font-bold text-app-text">ملخص الطلب</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-app-textSec">
                <span>رقم الطلب</span>
                <span className="font-bold text-app-text">#{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between text-xs text-app-textSec">
                <span>التاريخ</span>
                <span className="font-medium text-app-text" dir="ltr">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between text-xs text-app-textSec">
                <span>الحالة</span>
                <span className="text-green-600 font-bold">{selectedOrder.status}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-app-text px-2">المنتجات</h3>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 flex gap-4 border border-app-card/10 shadow-sm">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-app-bg border border-app-card/10 flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-bold text-app-text line-clamp-1">{item.product.name}</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-app-textSec">الكمية: {item.quantity}</span>
                    <span className="text-xs font-bold text-app-gold">{item.product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-app-textSec">
                <span>الإجمالي الفرعي</span>
                <span className="font-medium">{subtotal} د.ك</span>
              </div>
              <div className="flex justify-between text-xs text-app-textSec">
                <span>رسوم التوصيل</span>
                <span className="font-medium">{deliveryFee} د.ك</span>
              </div>
              <div className="pt-3 border-t border-app-bg flex justify-between">
                <span className="text-sm font-bold text-app-text">الإجمالي الكلي</span>
                <span className="text-lg font-bold text-app-gold">{grandTotal} د.ك</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductDetails = () => {
    return null;
  };

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar font-alexandria">
      <Routes>
        <Route index element={<Menu />} />
        <Route path="edit" element={<EditAccount />} />
        <Route path="history" element={<OrdersHistory />} />
        <Route path="order/:orderId" element={<OrderDetails />} />

        {/* Wallet Routes */}
        <Route
          path="wallet/rewards"
          element={
            <WalletDetailsPage
              title="محفظة الجوائز"
              balance={gameBalance}
              currencyLabel="د.ك"
              explanation="رصيد الجوائز يأتي من الجوائز التي تربحينها من اللعب. صلاحية كل مبلغ 30 يوماً."
              transactions={DEMO_REWARDS_TRANSACTIONS}
            />
          }
        />
        <Route
          path="wallet/cashback"
          element={
            <WalletDetailsPage
              title="محفظة الكاش باك"
              balance={loyaltyPoints}
              currencyLabel="نقطة"
              explanation="رصيد الكاش باك يأتي من عمليات الشراء. صلاحية كل مبلغ 30 يوماً."
              transactions={DEMO_CASHBACK_TRANSACTIONS}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default AccountTab;
