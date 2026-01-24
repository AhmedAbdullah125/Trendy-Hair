import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Product } from "../../types";
import { useData } from "../../context/DataContext";
import { API_BASE_URL } from "../../lib/apiConfig";
import { mapApiProductsToComponent } from "../../lib/productMapper";
import { useGetCategories } from "../requests/useGetCategories";
import { useGetHomeData } from "../requests/useGetHomeData";
import { useGetProductsByCategory } from "../requests/useGetProductsByCategory";
import { useGetProduct } from "../requests/useGetProduct";

import HomeHeader from "./HomeHeader";
import SideMenuDrawer from "./SideMenuDrawer";
import HomeContent from "./HomeContent";
import CategoryProductsGrid from "./CategoryProductsGrid";
import ProductDetailsView from "./ProductDetailsView";

interface HomeTabProps {
    cartCount: number;
    onAddToCart: (product: Product, quantity: number) => void;
    onOpenCart: () => void;
    favourites: number[];
    onToggleFavourite: (productId: number) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ cartCount, onAddToCart, onOpenCart, favourites, onToggleFavourite }) => {
    const navigate = useNavigate();
    const { productId, categoryName } = useParams();
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get("id");
    const { contentSettings } = useData();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [categoryPage, setCategoryPage] = useState(1);

    const activeCategory = useMemo(() => categoryName || null, [categoryName]);

    // API
    const { data: apiCategories } = useGetCategories("ar");
    const { data: homeData } = useGetHomeData("ar");
    const { data: categoryProductsData, isLoading: categoryLoading, error: categoryError } = useGetProductsByCategory("ar", categoryPage, categoryId || "");
    const { data: apiProduct } = useGetProduct("ar", productId || "");

    // Mappings
    const categories = useMemo(() => {
        if (!apiCategories) return [];
        return apiCategories.map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
            image: `${API_BASE_URL}/${cat.image}`,
            isActive: cat.is_active === 1,
            sortOrder: cat.position,
        }));
    }, [apiCategories]);

    const activeCategories = useMemo(() => categories.filter((c) => c.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)), [categories]);

    const banners = useMemo(() => {
        if (!homeData?.banners) return [];
        return homeData.banners
            .filter((b: any) => b.is_active === 1)
            .sort((a: any, b: any) => a.position - b.position)
            .map((b: any) => ({ id: b.id, image: `${API_BASE_URL}/${b.image}`, title: b.title, url: b.url }));
    }, [homeData]);

    const brands = useMemo(() => {
        if (!homeData?.brands) return [];
        return homeData.brands
            .filter((b: any) => b.is_active === 1)
            .sort((a: any, b: any) => a.position - b.position)
            .map((b: any) => ({ id: b.id, name: b.name, image: `${API_BASE_URL}/${b.image}` }));
    }, [homeData]);

    const recentProducts = useMemo(() => (homeData?.products_recently ? mapApiProductsToComponent(homeData.products_recently) : []), [homeData]);

    const packages = useMemo(() => {
        if (!homeData?.packages) return [];
        return homeData.packages
            .filter((p: any) => p.is_active === 1)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                products: mapApiProductsToComponent(p.products),
            }));
    }, [homeData]);

    const categoryProducts = useMemo(() => {
        if (!categoryProductsData?.products || !categoryId) return [];
        return mapApiProductsToComponent(categoryProductsData.products);
    }, [categoryProductsData, categoryId]);

    const selectedProduct = useMemo(() => {
        if (!apiProduct) return null;
        return {
            id: apiProduct.id,
            name: apiProduct.name,
            description: apiProduct.description,
            image: apiProduct.main_image,
            price: apiProduct.current_price,
            oldPrice: apiProduct.has_discount ? apiProduct.price : null,
            inStock: apiProduct.in_stock,
            quantity: apiProduct.quantity,
            brand: apiProduct.brand,
            category: apiProduct.category,
            isFavorite: apiProduct.is_favorite,
        } as any as Product;
    }, [apiProduct]);

    // Handlers
    const toggleMenu = () => setIsMenuOpen((p) => !p);

    const handleCategoryClick = (name: string, id: string) => {
        navigate(`/category/${encodeURIComponent(name)}?id=${id}`);
        setIsMenuOpen(false);
    };

    const handleProductClick = (p: Product) => {
        setQuantity(1);
        navigate(`/product/${p.id}`);
    };

    const updateQuantity = (delta: number) => setQuantity((p) => Math.max(1, p + delta));

    const handleAddAction = () => {
        if (!selectedProduct) return;
        onAddToCart(selectedProduct, quantity);
        navigate(-1);
    };

    const handleBuyNow = () => {
        if (!selectedProduct) return;
        onAddToCart(selectedProduct, quantity);
        onOpenCart();
    };

    const totalCategoryPages = categoryProductsData?.pagination?.total_pages || 1;

    return (
        <div className="flex flex-col h-[100vh] bg-app-bg relative font-alexandria overflow-hidden">
            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                categories={activeCategories}
                onCategoryClick={handleCategoryClick}
                onAccountClick={() => {
                    navigate("/account");
                    toggleMenu();
                }}
                techBookingUrl={contentSettings?.techBookingUrl}
            />

            <HomeHeader cartCount={cartCount} onOpenCart={onOpenCart} onToggleMenu={toggleMenu} onTitleClick={() => navigate("/")} />

            <main className="flex-1 overflow-y-auto w-full pb-28">
                {selectedProduct ? (
                    <ProductDetailsView
                        product={selectedProduct}
                        quantity={quantity}
                        onBack={() => navigate(-1)}
                        onInc={() => updateQuantity(1)}
                        onDec={() => updateQuantity(-1)}
                        onAdd={handleAddAction}
                        onBuyNow={handleBuyNow}
                    />
                ) : !activeCategory ? (
                    <HomeContent
                        banners={banners}
                        brands={brands}
                        recentProducts={recentProducts}
                        packages={packages}
                        favourites={favourites}
                        onToggleFavourite={onToggleFavourite}
                        onAddToCart={onAddToCart}
                        onProductClick={handleProductClick}
                        onClickBrand={(id) => navigate(`/brand/${id}`)}
                        onViewAllRecent={() => navigate("/products")}
                    />
                ) : (
                    <CategoryProductsGrid
                        title={activeCategory}
                        products={categoryProducts}
                        loading={categoryLoading}
                        error={!!categoryError}
                        page={categoryPage}
                        totalPages={totalCategoryPages}
                        onBack={() => navigate("/")}
                        onPrev={() => setCategoryPage((p) => Math.max(1, p - 1))}
                        onNext={() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1))}
                        favourites={favourites}
                        onToggleFavourite={onToggleFavourite}
                        onAddToCart={onAddToCart}
                        onProductClick={handleProductClick}
                    />
                )}
            </main>
        </div>
    );
};

export default HomeTab;
