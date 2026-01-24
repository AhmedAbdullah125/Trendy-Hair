import React from "react";
import { X, ChevronLeft, Wallet } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok, faSnapchat, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

type CategoryItem = {
    id: string;
    name: string;
    isActive: boolean;
    sortOrder?: number;
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    onCategoryClick: (name: string, id: string) => void;
    onAccountClick: () => void;
    techBookingUrl?: string;
}

const SideMenuDrawer: React.FC<Props> = ({
    isOpen,
    onClose,
    categories,
    onCategoryClick,
    onAccountClick,
    techBookingUrl,
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div
                className="absolute right-0 top-0 bottom-0 w-3/4 max-w-[320px] bg-white shadow-2xl animate-slideLeftRtl flex flex-col fixed h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex items-center justify-between border-b border-app-card/30">
                    <span className="text-lg font-bold text-app-text font-alexandria">الأقسام</span>
                    <button onClick={onClose} className="p-2 hover:bg-app-bg rounded-full transition-colors text-app-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-app-bg active:bg-app-card/50 transition-colors border-b border-app-card/10 group"
                            onClick={() => onCategoryClick(category.name, category.id)}
                        >
                            <span className="text-sm font-medium text-app-text font-alexandria">{category.name}</span>
                            <ChevronLeft size={18} className="text-app-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}

                    <div className="px-6 mt-8 mb-8 space-y-4">
                        <button
                            onClick={onAccountClick}
                            className="w-full h-10 rounded-2xl bg-transparent border border-app-gold text-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5 flex items-center justify-center gap-2"
                        >
                            <Wallet size={16} />
                            <span>حسابي</span>
                        </button>

                        <a
                            href={techBookingUrl || "https://wa.me/96599007898"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full h-10 rounded-2xl bg-app-gold text-white text-center text-sm font-medium shadow-md shadow-app-gold/20 transition-all active:scale-[0.98] hover:bg-app-goldDark"
                        >
                            حجز التكنك أونلاين ( المرة الأولى مجانا )
                        </a>

                        <a
                            href="https://maison-de-noor.raiyansoft.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full h-10 rounded-2xl bg-transparent text-app-gold border border-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5"
                        >
                            حجز مواعيد التكنت بالصالون
                        </a>
                    </div>

                    <div className="mt-8 px-12">
                        <div className="flex items-center justify-between gap-3">
                            <a href="https://instagram.com/trandyhair" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a href="https://tiktok.com/@trandyhair" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card">
                                <FontAwesomeIcon icon={faTiktok} />
                            </a>
                            <a href="https://snapchat.com/@trandyhairnoor" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card">
                                <FontAwesomeIcon icon={faSnapchat} />
                            </a>
                            <a href="https://wa.me/96599007898" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card">
                                <FontAwesomeIcon icon={faWhatsapp} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-app-card/30 bg-app-bg/30">
                    <a href="https://raiyansoft.net" target="_blank" rel="noreferrer" className="text-[10px] text-app-textSec text-center font-alexandria block hover:text-app-gold">
                        Powered by raiyansoft
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SideMenuDrawer;
