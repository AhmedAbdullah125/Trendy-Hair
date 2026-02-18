import React, { useState } from 'react';
import {
    Heart, Info, Mail, Phone, ChevronLeft, XCircle, Instagram, Ghost, Music2, ShoppingBag, Wallet, Award, Gamepad2, User, Edit2,
    PackageCheck, X
} from 'lucide-react';

interface AccountMenuProps {
    currentUser: {
        name: string;
        phone: string;
        email: string;
        photo: string;
        wallet: string;
    };
    gameBalance: number;
    loyaltyPoints: number;
    onLogout: () => void;
    navigate: (path: string) => void;
    onOpenCart?: () => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
    currentUser,
    gameBalance,
    loyaltyPoints,
    onLogout,
    navigate,
    onOpenCart
}) => {
    const [showAbout, setShowAbout] = useState(false);

    return (
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
            <div className="grid grid-cols-3 gap-3 mb-6 lg:grid-cols-5">

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
                            <PackageCheck size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text">طلباتي السابقة</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </div>

                {/* Cart */}
                <div
                    onClick={onOpenCart}
                    className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <ShoppingBag size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text">سلة التسوق</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </div>

                {/* About */}
                <div onClick={() => setShowAbout(true)} className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <Info size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text">عن Trandy Hair</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </div>

                {/* Email */}
                <a href="mailto:Trendhair@info.com" className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <Mail size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text">Trendhair@info.com</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </a>

                {/* Phone */}
                <a href="tel:96554647655" className="flex items-center justify-between p-5 active:bg-app-bg transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <Phone size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text" dir="ltr">96554647655</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </a>
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

            {/* About Modal */}
            {showAbout && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowAbout(false)}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 pb-12 shadow-2xl font-alexandria max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                                    <Info size={22} />
                                </div>
                                <h2 className="text-lg font-bold text-app-text">عن Trandy Hair</h2>
                            </div>
                            <button
                                onClick={() => setShowAbout(false)}
                                className="p-2 rounded-full bg-app-bg text-app-textSec hover:bg-app-card transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-right">
                            <p className="text-sm text-app-textSec leading-relaxed">
                                Trandy Hair هي وجهتك الأولى لمنتجات العناية بالشعر عالية الجودة في الكويت. نقدم لكِ أفضل الماركات العالمية والمحلية بأسعار تنافسية.
                            </p>
                            <p className="text-sm text-app-textSec leading-relaxed">
                                نؤمن بأن كل امرأة تستحق شعراً صحياً ولامعاً، لذلك نحرص على توفير منتجات مختارة بعناية تناسب جميع أنواع الشعر.
                            </p>
                            <p className="text-sm text-app-textSec leading-relaxed">
                                تسوقي بثقة مع ضمان الجودة وخدمة توصيل سريعة لجميع مناطق الكويت.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMenu;
