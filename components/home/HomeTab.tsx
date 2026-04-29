import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Product } from "../../types";
import { useData } from "../../context/DataContext";
import { API_BASE_URL } from "../../lib/apiConfig";
import { mapApiProductsToComponent } from "../../lib/productMapper";
import { useGetCategories } from "../requests/useGetCategories";
import { useGetHomeData } from "../requests/useGetHomeData";
import { useGetProductsByCategory } from "../requests/useGetProductsByCategory";
import { useGetProduct } from "../requests/useGetProduct";
import { useGetCart } from "../requests/useGetCart";
import { useGetProducts } from "../requests/useGetProductsWithSearch";

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

    const activeCategory = categoryName ?? null;

    // API
    const { data: apiCategories, isLoading: categoriesLoading } = useGetCategories("ar");
    const { data: homeData, isLoading: homeLoading } = useGetHomeData("ar");
    const { data: categoryProductsData, isLoading: categoryLoading, error: categoryError } = useGetProductsByCategory("ar", categoryPage, categoryId || "");
    const { data: apiProduct, isLoading: productLoading } = useGetProduct("ar", productId || "");
    const { data: cartData } = useGetCart("ar", { enabled: !!productId });

    const isInitialLoading = useMemo(() => {
        if (productId) return productLoading;
        if (activeCategory) return categoryLoading;
        return homeLoading || categoriesLoading;
    }, [productId, activeCategory, productLoading, categoryLoading, homeLoading, categoriesLoading]);

    // Mappings
    const categories = useMemo(() => {
        if (!apiCategories) return [];
        return apiCategories.map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
            image: `${API_BASE_URL}/v1/${cat.image}`,
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
            .map((b: any) => ({ id: b.id, image: `${API_BASE_URL}/v1/${b.image}`, title: b.title, url: b.url }));
    }, [homeData]);

    const brands = useMemo(() => {
        if (!homeData?.brands) return [];
        return homeData.brands
            .filter((b: any) => b.is_active === 1)
            .sort((a: any, b: any) => a.position - b.position)
            .map((b: any) => ({ id: b.id, name: b.name, image: `${API_BASE_URL}/v1/${b.image}` }));
    }, [homeData]);

    const recentProducts = useMemo(() => (homeData?.products_recently ? mapApiProductsToComponent(homeData.products_recently) : []), [homeData]);

    // Fallback: if the home API returned no recent products, fetch page 1 of all products
    const needsFallback = !homeLoading && !!homeData && recentProducts.length === 0;
    const { data: fallbackProductsData } = useGetProducts("ar", 1, "", false, { enabled: needsFallback });
    const fallbackProducts = useMemo(() => {
        if (!fallbackProductsData?.items?.products) return [];
        return mapApiProductsToComponent(fallbackProductsData.items.products);
    }, [fallbackProductsData]);

    const finalRecentProducts = recentProducts.length > 0 ? recentProducts : fallbackProducts;

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

    const lastSyncIdRef = useRef<number | null>(null);

    // Sync quantity with cart quantity when a product is opened
    useEffect(() => {
        if (selectedProduct && cartData) {
            if (lastSyncIdRef.current !== selectedProduct.id) {
                const cartItem = cartData.items?.items?.find((item: any) => item.product_id === selectedProduct.id);
                setQuantity(cartItem ? cartItem.quantity : 1);
                lastSyncIdRef.current = selectedProduct.id;
            }
        }
    }, [selectedProduct, cartData]);

    // Handlers
    const toggleMenu = useCallback(() => setIsMenuOpen((p) => !p), []);

    const handleCategoryClick = useCallback((name: string, id: string) => {
        navigate(`/category/${encodeURIComponent(name)}?id=${id}`);
        setIsMenuOpen(false);
    }, [navigate]);

    // Adapter for CategoriesRow which passes (id, name) instead of (name, id)
    const handleCategoryRowClick = useCallback((id: number, name: string) => {
        handleCategoryClick(name, String(id));
    }, [handleCategoryClick]);

    const handleProductClick = useCallback((p: Product) => {
        setQuantity(1);
        lastSyncIdRef.current = null;
        navigate(`/product/${p.id}`);
    }, [navigate]);

    const updateQuantity = useCallback((delta: number) => setQuantity((p) => Math.max(1, p + delta)), []);

    const handleAddAction = useCallback(() => {
        if (!selectedProduct) return;
        onAddToCart(selectedProduct, quantity);
        navigate(-1);
    }, [selectedProduct, quantity, onAddToCart, navigate]);

    const handleBuyNow = useCallback(() => {
        if (!selectedProduct) return;
        onAddToCart(selectedProduct, quantity);
        onOpenCart();
    }, [selectedProduct, quantity, onAddToCart, onOpenCart]);

    const totalCategoryPages = categoryProductsData?.pagination?.total_pages || 1;

    const handleAccountClick = useCallback(() => {
        navigate("/account");
        toggleMenu();
    }, [navigate, toggleMenu]);

    const handleTitleClick = useCallback(() => navigate("/"), [navigate]);
    const handleClickBrand = useCallback((id: number) => navigate(`/brand/${id}`), [navigate]);
    const handleViewAllRecent = useCallback(() => navigate("/products"), [navigate]);
    const handleBack = useCallback(() => navigate(-1), [navigate]);
    const handleBackToHome = useCallback(() => navigate("/"), [navigate]);
    const handleInc = useCallback(() => updateQuantity(1), [updateQuantity]);
    const handleDec = useCallback(() => updateQuantity(-1), [updateQuantity]);
    const handlePrev = useCallback(() => setCategoryPage((p) => Math.max(1, p - 1)), []);
    const handleNext = useCallback(() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1)), [totalCategoryPages]);

    return (
        <div className="flex flex-col h-[100vh] bg-app-bg relative font-alexandria overflow-hidden">
            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={toggleMenu}
                categories={activeCategories}
                onCategoryClick={handleCategoryClick}
                onAccountClick={handleAccountClick}
                techBookingUrl={contentSettings?.techBookingUrl}
            />

            <HomeHeader cartCount={cartCount} onOpenCart={onOpenCart} onToggleMenu={toggleMenu} onTitleClick={handleTitleClick} />

            <main className="flex-1 overflow-y-auto w-full pb-28">
                {isInitialLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-app-gold/20 border-t-app-gold rounded-full animate-spin" />
                    </div>
                ) : selectedProduct ? (
                    <ProductDetailsView
                        product={selectedProduct}
                        quantity={quantity}
                        onBack={handleBack}
                        onInc={handleInc}
                        onDec={handleDec}
                        onAdd={handleAddAction}
                        onBuyNow={handleBuyNow}
                    />
                ) : !activeCategory ? (
                    <HomeContent
                        banners={banners}
                        brands={brands}
                        categories={activeCategories}
                        onClickCategory={handleCategoryRowClick}
                        recentProducts={finalRecentProducts}
                        packages={packages}
                        favourites={favourites}
                        onToggleFavourite={onToggleFavourite}
                        onAddToCart={onAddToCart}
                        onProductClick={handleProductClick}
                        onClickBrand={handleClickBrand}
                        onViewAllRecent={handleViewAllRecent}
                    />
                ) : (
                    <CategoryProductsGrid
                        title={activeCategory}
                        products={categoryProducts}
                        loading={categoryLoading}
                        error={!!categoryError}
                        page={categoryPage}
                        totalPages={totalCategoryPages}
                        onBack={handleBackToHome}
                        onPrev={handlePrev}
                        onNext={handleNext}
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
