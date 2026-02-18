import React, { useMemo } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Product } from "../../types";
import { useAddToCart } from "../requests/useAddToCart";
import { toast } from "sonner";

interface Props {
    product: Product;
    quantity: number;
    onBack: () => void;

    // مهم: خلّي الـ parent يستخدم الـ setters دي (بنقفلها هنا فقط عبر disable + toast)
    onInc: () => void;
    onDec: () => void;

    onAdd?: () => void;
    onBuyNow?: () => void;

    addLoading?: boolean;
    lang?: string;
    onOpenCart?: () => void;
}

const ProductDetailsView: React.FC<Props> = ({
    product,
    quantity,
    onBack,
    onInc,
    onDec,
    onAdd,
    onBuyNow,
    addLoading,
    lang = "ar",
    onOpenCart,
}) => {
    const addMut = useAddToCart();
    const loading = addLoading ?? addMut.isPending;

    // ✅ Stock info from API product response
    const stockQty = useMemo(() => {
        const q = Number((product as any)?.quantity ?? 0);
        return Number.isFinite(q) ? q : 0;
    }, [product]);

    const inStock = useMemo(() => {
        const s = (product as any)?.in_stock;
        // لو API بيرجع boolean
        if (typeof s === "boolean") return s;
        // fallback
        return stockQty > 0;
    }, [product, stockQty]);

    const reachedMax = quantity >= stockQty && stockQty > 0;
    const canIncrease = !loading && inStock && (stockQty === 0 ? true : quantity < stockQty);
    const canDecrease = !loading && quantity > 1;

    const canAddToCart = !loading && inStock && quantity >= 1 && (stockQty === 0 ? true : quantity <= stockQty);

    const notifyMax = () => {
        toast(lang === "ar" ? `الحد الأقصى المتاح: ${stockQty}` : `Max available: ${stockQty}`, {
            style: {
                background: "#dc3545",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
            },
        });
    };

    const notifyOutOfStock = () => {
        toast(lang === "ar" ? "المنتج غير متوفر حالياً" : "Out of stock", {
            style: {
                background: "#dc3545",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
            },
        });
    };

    const handleInc = () => {
        if (!inStock) return notifyOutOfStock();
        if (stockQty > 0 && quantity >= stockQty) return notifyMax();
        onInc();
    };

    const handleDec = () => {
        if (quantity <= 1) return;
        onDec();
    };

    const handleAddToCart = () => {
        onAdd?.();

        if (!inStock) return notifyOutOfStock();
        if (stockQty > 0 && quantity > stockQty) return notifyMax();
        if (addMut.isPending) return;

        addMut.mutate(
            { product_id: product.id, quantity, lang },
            {
                onSuccess: () => {
                    onOpenCart?.();
                },
            }
        );
    };

    const handleBuyNow = () => {
        onBuyNow?.();

        if (!inStock) return notifyOutOfStock();
        if (stockQty > 0 && quantity > stockQty) return notifyMax();
        if (addMut.isPending) return;

        addMut.mutate(
            { product_id: product.id, quantity, lang },
            {
                onSuccess: () => {
                    onOpenCart?.();
                },
            }
        );
    };

    return (
        <div className="animate-fadeIn pt-4">
            <div className="px-6 mb-4">
                <button
                    onClick={onBack}
                    className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex items-center gap-2"
                >
                    <ArrowRight size={20} />
                    <span className="text-sm font-medium">{lang === "ar" ? "العودة" : "Back"}</span>
                </button>
            </div>

            <div className="px-6 mb-6">
                <div className="w-full md:aspect-[3/1] aspect-[2/1] rounded-[2.5rem] overflow-hidden shadow-md bg-white border border-app-card/30">
                    <img
                        src={(product as any).main_image ?? (product as any).image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <div className="px-8 mb-4">
                <h2 className="text-2xl font-bold text-app-text font-alexandria leading-tight">
                    {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-bold text-app-gold">
                        {(product as any).current_price ?? (product as any).price}
                    </span>
                    {(product as any).price && (product as any).current_price && (product as any).current_price !== (product as any).price && (
                        <span className="text-sm text-app-textSec line-through opacity-60">
                            {(product as any).price}
                        </span>
                    )}
                </div>

                {/* ✅ stock info */}
                <div className="mt-2">
                    {!inStock ? (
                        <span className="text-xs font-bold text-red-500">
                            {lang === "ar" ? "غير متوفر" : "Out of stock"}
                        </span>
                    ) : (
                        stockQty > 0 && (
                            <span className="text-xs text-app-textSec">
                                {lang === "ar" ? `المتاح: ${stockQty}` : `Available: ${stockQty}`}
                            </span>
                        )
                    )}
                </div>
            </div>

            <div className="px-8 mb-8">
                <h3 className="text-sm font-bold text-app-text mb-2">{lang === "ar" ? "الوصف" : "Description"}</h3>
                <p className="text-sm text-app-textSec leading-relaxed">
                    {(product as any).description || (lang === "ar" ? "لا يوجد وصف متوفر لهذا المنتج حالياً." : "No description available.")}
                </p>
            </div>

            <div className="px-8 mb-8">
                <h3 className="text-sm font-bold text-app-text mb-3">{lang === "ar" ? "الكمية" : "Quantity"}</h3>

                <div className="flex items-center gap-6 bg-white w-fit px-4 py-2 rounded-2xl shadow-sm border border-app-card/30">
                    <button
                        onClick={handleInc}
                        disabled={!canIncrease}
                        className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        title={reachedMax ? (lang === "ar" ? "وصلت للحد الأقصى" : "Reached max") : ""}
                    >
                        <Plus size={18} />
                    </button>

                    <span className="text-lg font-bold text-app-text w-8 text-center tabular-nums">
                        {quantity}
                    </span>

                    <button
                        onClick={handleDec}
                        disabled={!canDecrease}
                        className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Minus size={18} />
                    </button>
                </div>
            </div>

            <div className="px-8 mt-6 mb-10 flex flex-col lg:flex-row gap-4 items-center">
                <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ShoppingBag size={20} />
                    )}
                    <span>{lang === "ar" ? "إضافة إلى السلة" : "Add to Cart"}</span>
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={!canAddToCart}
                    className="w-full bg-white text-app-gold border border-app-gold font-bold py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span>{lang === "ar" ? "اشتري الآن" : "Buy Now"}</span>
                </button>
            </div>
        </div>
    );
};

export default ProductDetailsView;
