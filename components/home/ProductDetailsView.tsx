import React, { useMemo, useState, useRef, useCallback } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
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

const formatDescription = (desc: string) => {
    if (!desc) return "";

    // 1. Remove leaked CSS rules (e.g. .prod-card{...} and .prod-table th{...})
    let formatted = desc.replace(/(?:\.[a-zA-Z0-9_-]+[^{]*\{[^}]+\}\s*)+/g, "");

    // 2. Add newlines before bullets if they are stuck together
    formatted = formatted.replace(/•/g, "\n• ");

    // 3. Check if it already contains meaningful HTML tags
    const hasHTML = /<(p|div|br|ul|li|strong|b|span|table)[^>]*>/i.test(formatted);

    if (!hasHTML) {
        // Format known section headers to be bold
        const headers = ["النوع", "المحتويات", "المناسب", "الوصف", "الفوائد", "المكونات الفعالة", "طريقة الاستخدام", "ملاحظة", "ملاحظه"];
        headers.forEach((header) => {
            const regex = new RegExp(`(?:^|\\n)\\s*${header}\\s*(?:\\n|$)`, "g");
            formatted = formatted.replace(regex, `\n\n<strong class="text-app-text text-base mt-4 mb-1 block">${header}</strong>\n`);
        });

        // Convert newlines to <br/>
        formatted = formatted.replace(/\n/g, "<br/>");

        // Clean up excessive <br/> tags
        formatted = formatted.replace(/(<br\/>\s*){3,}/g, "<br/><br/>");
    }

    return formatted;
};

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
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    // Build ordered image list: main_image first, then extra images (deduped)
    const allImages = useMemo(() => {
        const main = (product as any).main_image ?? (product as any).image ?? '';
        const extras: string[] = ((product as any).images ?? []).map((img: any) => img.image as string);
        const seen = new Set<string>();
        return [main, ...extras].filter(url => { if (!url || seen.has(url)) return false; seen.add(url); return true; });
    }, [product]);

    const openViewer = (index: number) => { setViewerIndex(index); setIsViewerOpen(true); };

    // --- Swiper drag logic (works for touch + mouse) ---
    const dragStartX = useRef<number | null>(null);
    const isDragging = useRef(false);

    const onDragStart = useCallback((clientX: number) => {
        dragStartX.current = clientX;
        isDragging.current = false;
    }, []);

    const onDragEnd = useCallback((clientX: number, total: number, setIdx: React.Dispatch<React.SetStateAction<number>>) => {
        if (dragStartX.current === null) return;
        const delta = dragStartX.current - clientX;
        if (Math.abs(delta) > 40) {
            isDragging.current = true;
            if (delta > 0) setIdx(i => Math.min(i + 1, total - 1));
            else setIdx(i => Math.max(i - 1, 0));
        }
        dragStartX.current = null;
    }, []);

    const prevImage = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setViewerIndex(i => (i - 1 + allImages.length) % allImages.length); }, [allImages.length]);
    const nextImage = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setViewerIndex(i => (i + 1) % allImages.length); }, [allImages.length]);

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
        if (!inStock) return notifyOutOfStock();
        if (stockQty > 0 && quantity > stockQty) return notifyMax();
        if (addMut.isPending) return;

        onAdd?.();
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

    const formattedDescription = useMemo(() => {
        return formatDescription((product as any).description);
    }, [(product as any).description]);

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

            {/* ── Swipeable image carousel ── */}
            <div className="px-6 mb-5">
                {/* Swiper track */}
                <div
                    className="group relative w-full md:aspect-[3/1] aspect-[2/1] rounded-[2.5rem] overflow-hidden shadow-md bg-white border border-app-card/30 cursor-pointer select-none"
                    /* touch */
                    onTouchStart={e => onDragStart(e.touches[0].clientX)}
                    onTouchEnd={e => { onDragEnd(e.changedTouches[0].clientX, allImages.length, setActiveIndex); }}
                    /* mouse */
                    onMouseDown={e => onDragStart(e.clientX)}
                    onMouseUp={e => { onDragEnd(e.clientX, allImages.length, setActiveIndex); }}
                    onClick={() => { if (!isDragging.current) openViewer(activeIndex); }}
                >
                    {/* Slide strip */}
                    <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{ width: `${allImages.length * 100}%`, transform: `translateX(${activeIndex * (100 / allImages.length)}%)` }}
                    >
                        {allImages.map((url, idx) => (
                            <div key={idx} className="h-full flex-shrink-0" style={{ width: `${100 / allImages.length}%` }}>
                                <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Zoom overlay (visible on hover when not dragging) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                            <ZoomIn size={22} className="text-app-goldDark" />
                        </div>
                    </div>

                    {/* Slide counter badge */}
                    {allImages.length > 1 && (
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {activeIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* Dot indicators */}
                {allImages.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {allImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                style={{ pointerEvents: 'auto' }}
                                className={`rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'w-6 h-2 bg-app-gold' : 'w-2 h-2 bg-app-card'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Fancy full-screen gallery viewer ── */}
            {isViewerOpen && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn"
                    onClick={() => setIsViewerOpen(false)}
                    /* touch swipe in viewer */
                    onTouchStart={e => onDragStart(e.touches[0].clientX)}
                    onTouchEnd={e => { e.stopPropagation(); onDragEnd(e.changedTouches[0].clientX, allImages.length, setViewerIndex); }}
                >
                    {/* Header bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-5 pb-3 z-10" onClick={e => e.stopPropagation()}>
                        <span className="text-white/60 text-sm font-medium">{viewerIndex + 1} / {allImages.length}</span>
                        <p className="text-white text-sm font-semibold truncate max-w-[55%] text-center">{product.name}</p>
                        <button
                            className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
                            onClick={() => setIsViewerOpen(false)}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Prev / Next arrows */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/25 text-white rounded-full p-2.5 transition-colors"
                                onClick={prevImage}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/25 text-white rounded-full p-2.5 transition-colors"
                                onClick={nextImage}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}

                    {/* Active image */}
                    <img
                        key={viewerIndex}
                        src={allImages[viewerIndex]}
                        alt={`${product.name} ${viewerIndex + 1}`}
                        className="max-w-[92vw] max-h-[75vh] object-contain rounded-2xl shadow-2xl animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                        style={{ pointerEvents: 'auto' }}
                    />

                    {/* Dot indicators + thumbnail strip */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
                            {/* Dots */}
                            <div className="flex gap-1.5">
                                {allImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setViewerIndex(idx)}
                                        style={{ pointerEvents: 'auto' }}
                                        className={`rounded-full transition-all duration-300 ${
                                            idx === viewerIndex ? 'w-6 h-2 bg-app-gold' : 'w-2 h-2 bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>
                            {/* Thumbnail strip */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 max-w-full pb-1">
                                {allImages.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setViewerIndex(idx)}
                                        style={{ pointerEvents: 'auto' }}
                                        className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                            idx === viewerIndex ? 'border-app-gold scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
                                        }`}
                                    >
                                        <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="px-8 mb-4">
                {((product as any).category?.name || product.categoryName) && (
                    <span className="inline-block px-3 py-1 bg-app-card/30 text-app-gold text-xs font-bold rounded-full mb-3">
                        {(product as any).category?.name || product.categoryName}
                    </span>
                )}
                <h2 className="text-xl font-semibold text-app-text font-alexandria leading-tight">
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
                {formattedDescription ? (
                    <div
                        className="text-sm text-app-textSec leading-relaxed [&>style]:hidden"
                        dangerouslySetInnerHTML={{ __html: formattedDescription }}
                    />
                ) : (
                    <p className="text-sm text-app-textSec leading-relaxed">
                        {lang === "ar" ? "لا يوجد وصف متوفر لهذا المنتج حالياً." : "No description available."}
                    </p>
                )}
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
