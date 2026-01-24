import React from "react";
import { Product } from "../../types";
import ProductCard from "../ProductCard";

interface Props {
    title: string;
    products: Product[];
    onViewAll?: () => void;
    showViewAll?: boolean;
    titleSize?: string;
    favourites: number[];
    onToggleFavourite: (id: number) => void;
    onAddToCart: (p: Product, q: number) => void;
    onProductClick: (p: Product) => void;
}

const ProductRowSection: React.FC<Props> = ({
    title,
    products,
    onViewAll,
    showViewAll = true,
    titleSize = "text-lg",
    favourites,
    onToggleFavourite,
    onAddToCart,
    onProductClick,
}) => {
    return (
        <div className="px-6 mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`${titleSize} font-bold text-app-text leading-tight`}>{title}</h2>
                {showViewAll && onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-xs font-bold text-app-gold hover:text-app-goldDark transition-colors shrink-0"
                    >
                        عرض الكل
                    </button>
                )}
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                {products.map((product) => (
                    <div key={product.id} className="w-[180px] shrink-0">
                        <ProductCard
                            product={product}
                            isFavourite={favourites.includes(product.id)}
                            onToggleFavourite={onToggleFavourite}
                            onAddToCart={onAddToCart}
                            onClick={onProductClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductRowSection;
