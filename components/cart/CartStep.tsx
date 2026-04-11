import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { CartItem } from "../../App";
import { addToCart } from "../requests/addToCart";
import { useDeleteCartItem } from "../requests/useDeleteCartItem";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
    cartItems: CartItem[];
    subtotal: number;
    lang?: string;

    onClose: () => void;
    onGoDetails: () => void;

    onDeleteItem: (item: CartItem) => void;
    onClearAll: () => void;
};

// ── Per-item counter ──────────────────────────────────────────────────────────
type CounterProps = {
    item: CartItem;
    lang: string;
};

const CartItemCounter: React.FC<CounterProps> = ({ item, lang }) => {
    const qc = useQueryClient();
    const deleteMut = useDeleteCartItem();

    const [localQty, setLocalQty] = useState(item.quantity);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Keep in sync when server data changes (e.g. after invalidation)
    useEffect(() => {
        setLocalQty(item.quantity);
    }, [item.quantity]);

    const isDirty = localQty !== item.quantity;
    const isBusy = updateLoading || deleteMut.isPending;

    const handleDecrement = () => setLocalQty((q) => Math.max(0, q - 1));
    const handleIncrement = () => setLocalQty((q) => q + 1);

    useEffect(() => {
        if (localQty === item.quantity) return;

        const timer = setTimeout(async () => {
            if (localQty === 0) {
                deleteMut.mutate({ cartItemId: item.id, lang });
            } else {
                await addToCart(item.product.id, localQty, setUpdateLoading, lang);
                await qc.invalidateQueries({ queryKey: ["cart"] });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localQty, item.quantity, item.id, item.product.id, lang, qc]);

    return (
        <div className="flex items-center gap-1">
            {/* Minus */}
            <button
                onClick={handleDecrement}
                disabled={isBusy}
                className="w-6 h-6 rounded-lg bg-app-card/60 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
                <Minus size={11} className="text-app-text" />
            </button>

            {/* Quantity */}
            <span className="min-w-[18px] text-center text-xs font-bold text-app-text font-alexandria">
                {localQty}
            </span>

            {/* Plus */}
            <button
                onClick={handleIncrement}
                disabled={isBusy}
                className="w-6 h-6 rounded-lg bg-app-card/60 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
                <Plus size={11} className="text-app-text" />
            </button>

            {/* Loading indicator */}
            {isBusy && (
                <div className="w-6 h-6 flex items-center justify-center ml-0.5">
                    <div className="w-3 h-3 border-2 border-app-gold border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

// ── CartStep ──────────────────────────────────────────────────────────────────
const CartStep: React.FC<Props> = ({
    cartItems,
    subtotal,
    lang = "ar",
    onClose,
    onGoDetails,
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
                            className="p-2 hover:bg-red-50 rounded-full text-red-500"
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
                                        {/* Counter with confirm logic */}
                                        <CartItemCounter item={item} lang={lang} />

                                        {/* Delete button */}
                                        <button
                                            onClick={() => onDeleteItem(item)}
                                            className="text-red-400 p-2"
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
