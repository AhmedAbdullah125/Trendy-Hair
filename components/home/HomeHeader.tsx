import React from "react";
import { Menu, ShoppingBag } from "lucide-react";

interface Props {
    cartCount: number;
    onOpenCart: () => void;
    onToggleMenu: () => void;
    onTitleClick: () => void;
}

const HomeHeader: React.FC<Props> = ({ cartCount, onOpenCart, onToggleMenu, onTitleClick }) => {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 pt-6 pb-4 bg-app-bg shadow-sm border-b border-app-card/30 flex-shrink-0">
            <button onClick={onToggleMenu} className="p-2 text-app-text hover:bg-app-card rounded-full transition-colors flex-shrink-0">
                <Menu size={24} />
            </button>

            <h1
                className="text-xl font-bold text-app-text font-alexandria text-center flex-1 truncate px-2 cursor-pointer"
                onClick={onTitleClick}
            >
                Trandy Hair
            </h1>

            <button onClick={onOpenCart} className="p-2 text-app-text hover:bg-app-card rounded-full transition-colors flex-shrink-0 relative">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                    <div className="absolute top-1 right-1 bg-app-gold text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-app-bg px-1 animate-scaleIn">
                        {cartCount}
                    </div>
                )}
            </button>
        </header>
    );
};

export default HomeHeader;
