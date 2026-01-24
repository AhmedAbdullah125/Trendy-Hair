import React from "react";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Product } from "../../types";

interface Props {
    product: Product;
    quantity: number;
    onBack: () => void;
    onInc: () => void;
    onDec: () => void;
    onAdd: () => void;
    onBuyNow: () => void;
}

const ProductDetailsView: React.FC<Props> = ({ product, quantity, onBack, onInc, onDec, onAdd, onBuyNow }) => {
    return (
        <div className="animate-fadeIn pt-4">
            <div className="px-6 mb-4">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex items-center gap-2">
                    <ArrowRight size={20} />
                    <span className="text-sm font-medium">العودة</span>
                </button>
            </div>

            <div className="px-6 mb-6">
                <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-md bg-white border border-app-card/30">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="px-8 mb-4">
                <h2 className="text-2xl font-bold text-app-text font-alexandria leading-tight">{product.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-bold text-app-gold">{product.price}</span>
                    {(product as any).oldPrice && (
                        <span className="text-sm text-app-textSec line-through opacity-60">{(product as any).oldPrice}</span>
                    )}
                </div>
            </div>

            <div className="px-8 mb-8">
                <h3 className="text-sm font-bold text-app-text mb-2">الوصف</h3>
                <p className="text-sm text-app-textSec leading-relaxed">{product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}</p>
            </div>

            <div className="px-8 mb-8">
                <h3 className="text-sm font-bold text-app-text mb-3">الكمية</h3>
                <div className="flex items-center gap-6 bg-white w-fit px-4 py-2 rounded-2xl shadow-sm border border-app-card/30">
                    <button onClick={onInc} className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors">
                        <Plus size={18} />
                    </button>
                    <span className="text-lg font-bold text-app-text w-8 text-center tabular-nums">{quantity}</span>
                    <button onClick={onDec} className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors">
                        <Minus size={18} />
                    </button>
                </div>
            </div>

            <div className="px-8 mt-6 space-y-3 mb-10">
                <button onClick={onAdd} className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    <ShoppingBag size={20} />
                    <span>إضافة إلى السلة</span>
                </button>

                <button onClick={onBuyNow} className="w-full bg-white text-app-gold border border-app-gold font-bold py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center">
                    <span>اشتري الآن</span>
                </button>
            </div>
        </div>
    );
};

export default ProductDetailsView;
