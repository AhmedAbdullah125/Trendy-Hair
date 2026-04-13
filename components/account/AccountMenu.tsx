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
    const [selectedLink, setSelectedLink] = useState<string | null>(null);

    const handleCopyLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            alert('تم نسخ الرابط بنجاح');
            setSelectedLink(null);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleOpenChrome = (url: string) => {
        const noProtocolUrl = url.replace(/^https?:\/\//, '');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        
        if (isIOS) {
            window.location.href = `googlechromes://${noProtocolUrl}`;
        } else {
            // Android intent
            window.location.href = `intent://${noProtocolUrl}#Intent;scheme=https;package=com.android.chrome;end`;
        }
        setSelectedLink(null);
    };

    const openInBrowser = (url: string) => {
        try {
            // Some mobile wrappers inject a native interface 
            if ((window as any).ReactNativeWebView) {
                (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'openUrl', url }));
                setSelectedLink(null);
                return;
            }
            
            // Try explicit external targets
            const win = window.open(url, '_system') || window.open(url, '_blank');
            if (win) { win.opener = null; }
            else { window.location.href = url; }
        } catch (e) {
            window.location.href = url;
        }
        setSelectedLink(null);
    };

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
                        <button onClick={() => navigate('/account/edit')} className="flex items-center gap-1 text-[10px] font-bold text-app-gold mt-1 hover:text-app-goldDark transition-colors w-fit">
                            <Edit2 size={12} />
                            <span>تعديل الحساب</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-2xl transition-all active:scale-95">
                        <span className="mt-0.5">تسجيل الخروج</span>
                        <XCircle size={22} className="text-red-500" />
                    </button>
                </div>
            </div>

            {/* Cards Grid (3 Columns) - All Square Aspect Ratio */}
            <div className="grid grid-cols-3 gap-3 mb-6 lg:grid-cols-5">

                {/* Game Wallet Card - Clickable */}
                <div
                    // onClick={() => navigate('/account/wallet/rewards')}
                    className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-app-card/30 flex flex-col justify-between relative overflow-hidden aspect-square"
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
                {/* <div
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
                </div> */}

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
                <div
                    onClick={() => window.location.href = "mailto:Trendhair@info.com"}
                    className="flex items-center justify-between p-5 border-b border-app-bg active:bg-app-bg transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <Mail size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text">Trendhair@info.com</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </div>

                {/* Phone */}
                <div
                    onClick={() => window.location.href = "tel:+96554647655"}
                    className="flex items-center justify-between p-5 active:bg-app-bg transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-app-bg rounded-2xl text-app-gold">
                            <Phone size={22} />
                        </div>
                        <span className="text-sm font-bold text-app-text" dir="ltr">+96554647655</span>
                    </div>
                    <ChevronLeft className="text-app-textSec opacity-40" size={20} />
                </div>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center items-center gap-8 mb-4">
                <button
                    onClick={() => setSelectedLink('https://www.tiktok.com/@trandyhair?_t=ZS-8yhnXac3kFV&_r=1')}
                    className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg"
                >
                    <Music2 size={26} />
                </button>
                <button
                    onClick={() => setSelectedLink('https://www.instagram.com/trandyhair')}
                    className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg"
                >
                    <Instagram size={26} />
                </button>
                <button
                    onClick={() => setSelectedLink('https://www.snapchat.com/@trandyhairnoor?src=QR_CODE')}
                    className="w-14 h-14 rounded-full bg-white shadow-md border border-app-card/30 flex items-center justify-center text-app-text active:scale-90 transition-all hover:bg-app-bg"
                >
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

            {/* Link Browser Modal */}
            {selectedLink && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    onClick={() => setSelectedLink(null)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl font-alexandria animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-app-text">فتح الرابط عبر...</h3>
                            <button
                                onClick={() => setSelectedLink(null)}
                                className="p-1.5 rounded-full bg-app-bg text-app-textSec hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleOpenChrome(selectedLink)}
                                className="w-full bg-white border border-app-card/50 shadow-sm rounded-2xl py-4 font-bold text-gray-700 active:bg-gray-50 transition-colors"
                            >
                                Google Chrome
                            </button>
                            
                            <button
                                onClick={() => openInBrowser(selectedLink)}
                                className="w-full bg-white border border-app-card/50 shadow-sm rounded-2xl py-4 font-bold text-app-textSec active:bg-gray-50 transition-colors"
                            >
                                المتصفح الافتراضي / التطبيق
                            </button>
                            
                            <button
                                onClick={() => handleCopyLink(selectedLink)}
                                className="w-full bg-app-gold/10 text-app-gold rounded-2xl py-4 font-bold active:bg-app-gold/20 transition-colors"
                            >
                                نسخ الرابط
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMenu;
