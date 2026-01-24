import React from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../../types";
import ProductCard from "../ProductCard";

interface Props {
    title: string;
    products: Product[];
    loading: boolean;
    error: boolean;
    page: number;
    totalPages: number;
    onBack: () => void;
    onPrev: () => void;
    onNext: () => void;
    favourites: number[];
    onToggleFavourite: (id: number) => void;
    onAddToCart: (p: Product, q: number) => void;
    onProductClick: (p: Product) => void;
}

const CategoryProductsGrid: React.FC<Props> = ({
    title,
    products,
    loading,
    error,
    page,
    totalPages,
    onBack,
    onPrev,
    onNext,
    favourites,
    onToggleFavourite,
    onAddToCart,
    onProductClick,
}) => {
    return (
        <div className="animate-fadeIn pt-4">
            <div className="px-6 mb-6 flex items-center gap-2">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors">
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-lg font-bold text-app-text font-alexandria truncate">{title}</h2>
            </div>

            <div className="px-6 grid grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center text-app-textSec py-10">جاري التحميل...</div>
                ) : error ? (
                    <div className="col-span-2 text-center text-red-500 py-10">حدث خطأ أثناء تحميل المنتجات</div>
                ) : products.length ? (
                    products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            isFavourite={favourites.includes(p.id)}
                            onToggleFavourite={onToggleFavourite}
                            onAddToCart={onAddToCart}
                            onClick={onProductClick}
                        />
                    ))
                ) : (
                    <p className="col-span-2 text-center text-app-textSec py-10">لا توجد منتجات في هذا القسم حالياً.</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8 mb-4 px-6">
                    <button
                        onClick={onPrev}
                        disabled={page === 1}
                        className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                        <span className="text-sm font-medium text-app-text">
                            صفحة {page} من {totalPages}
                        </span>
                    </div>

                    <button
                        onClick={onNext}
                        disabled={page === totalPages}
                        className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryProductsGrid;
