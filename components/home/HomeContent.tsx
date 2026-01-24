import React from "react";
import { Product } from "../../types";
import SearchBar from "./SearchBar";
import BannerSlider from "./BannerSlider";
import BrandsRow from "./BrandsRow";
import ProductRowSection from "./ProductRowSection";

interface Props {
    banners: any[];
    brands: any[];
    recentProducts: Product[];
    packages: { id: number; name: string; products: Product[] }[];
    favourites: number[];
    onToggleFavourite: (id: number) => void;
    onAddToCart: (p: Product, q: number) => void;
    onProductClick: (p: Product) => void;
    onClickBrand: (id: number) => void;
    onViewAllRecent: () => void;
    disableSlider?: boolean;
}

const HomeContent: React.FC<Props> = ({
    banners,
    brands,
    recentProducts,
    packages,
    favourites,
    onToggleFavourite,
    onAddToCart,
    onProductClick,
    onClickBrand,
    onViewAllRecent,
    disableSlider,
}) => {
    const rowProps = { favourites, onToggleFavourite, onAddToCart, onProductClick };

    return (
        <div className="pt-4">
            <SearchBar onProductClick={onProductClick} />
            <BannerSlider banners={banners} disabled={disableSlider} />
            <BrandsRow brands={brands} onClickBrand={onClickBrand} />

            <ProductRowSection title="وصلنا حديثاً" products={recentProducts} onViewAll={onViewAllRecent} showViewAll {...rowProps} />

            {packages.map((pkg) =>
                pkg.products?.length ? (
                    <ProductRowSection key={pkg.id} title={pkg.name} products={pkg.products} showViewAll={false} titleSize="text-base" {...rowProps} />
                ) : null
            )}
        </div>
    );
};

export default HomeContent;
