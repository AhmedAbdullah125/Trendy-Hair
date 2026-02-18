import React from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { CartItem } from "../../App";

type Props = {
    cartItems: CartItem[];
    isDeleting?: boolean;
    subtotal: number;

    onClose: () => void;
    onGoDetails: () => void;

    onUpdateQuantity: (productId: number, delta: number) => void;
    onDeleteItem: (item: CartItem) => void;
    onClearAll: () => void;
};

const CartStep: React.FC<Props> = ({
    cartItems,
    isDeleting,
    subtotal,
    onClose,
    onGoDetails,
    onUpdateQuantity,
    onDeleteItem,
    onClearAll,
}) => {
    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <header className="px-6 pt-6 pb-4 bg-white border-b border-app-card/30 flex items-center justify-between">
                <h1 className="text-xl font-bold text-app-text">سلة التسوق</h1>

                <div className="flex items-center gap-2">
                    {cartItems.length > 0 && (
                        <button
                            onClick={onClearAll}
                            disabled={!!isDeleting}
                            className="p-2 hover:bg-red-50 rounded-full text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تفريغ السلة"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}

                    <button onClick={onClose} className="p-2 hover:bg-app-bg rounded-full text-app-text">
                        <ArrowLeft size={24} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 text-app-gold/40">
                            <ShoppingBag size={40} />
                        </div>
                        <p className="text-app-textSec font-medium">السلة فارغة حالياً</p>
                    </div>
                ) : (
                    cartItems.map((item) => {
                        const img =
                            (item.product as any)?.image ||
                            (item.product as any)?.main_image ||
                            (item.product as any)?.products?.main_image;

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-3xl p-4 shadow-sm border border-app-card/30 flex gap-4"
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-app-bg border border-app-card/10 flex-shrink-0">
                                    <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-app-text leading-tight mb-1">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-xs font-bold text-app-gold">{(item.product as any)?.price}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-app-bg px-2 py-1 rounded-xl">
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                                className="p-1 text-app-gold"
                                                disabled={!!isDeleting}
                                            >
                                                <Plus size={14} />
                                            </button>

                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>

                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                                className="p-1 text-app-gold"
                                                disabled={!!isDeleting}
                                            >
                                                <Minus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => onDeleteItem(item)}
                                            disabled={!!isDeleting}
                                            className="text-red-400 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="حذف المنتج"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t border-app-card/30">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-app-textSec font-bold">إجمالي السلة:</span>
                        <span className="text-xl font-bold text-app-gold">{subtotal.toFixed(3)} د.ك</span>
                    </div>

                    <button
                        onClick={onGoDetails}
                        className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
                    >
                        إتمام الشراء
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartStep;
