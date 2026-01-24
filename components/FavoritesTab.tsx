import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, } from "lucide-react";
import Cookies from "js-cookie";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { useGetFavourites } from "./requests/useGetFavourites";
import { mapApiProductsToComponent } from "../lib/productMapper";

interface FavoritesTabProps {
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favourites,
  onToggleFavourite,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  const lang = Cookies.get("lang") || "ar";
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Backend favourites
  const {
    data: favData,
    isLoading: favLoading,
    error: favError,
  } = useGetFavourites(lang, currentPage);

  // ✅ Convert API products -> Product shape (mapper)
  const favoriteProducts: Product[] = useMemo(() => {
    if (!favData?.products) return [];
    return mapApiProductsToComponent(favData.products);
  }, [favData]);

  // ✅ Hide immediately (optimistic remove)
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);

  // reset hidden list on page change (so new page doesn't inherit hidden ids)
  useEffect(() => {
    setHiddenIds([]);
  }, [currentPage]);

  const visibleFavorites = useMemo(() => {
    return favoriteProducts.filter((p) => !hiddenIds.includes(p.id));
  }, [favoriteProducts, hiddenIds]);

  const handleToggleFavouriteInFavTab = (id: number) => {
    // ✅ hide immediately
    setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    // keep any parent/global state in sync if you use it elsewhere
    onToggleFavourite(id);
  };

  // Local details overlay
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleProductClick = (product: Product) => {
    setQuantity(1);
    setSelectedProduct(product);
  };

  const updateQuantity = (val: number) => {
    setQuantity((prev) => Math.max(1, prev + val));
  };

  /* ===================== Product Details Overlay ===================== */
  if (selectedProduct) {
    return (
      <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar font-alexandria animate-fadeIn">
        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex items-center gap-2"
          >
            <ArrowRight size={20} />
            <span className="text-sm font-medium">العودة</span>
          </button>
          <h1 className="text-xl font-bold text-app-text">تفاصيل المنتج</h1>
        </header>

        <div className="flex-1 pb-10">
          <div className="mb-6">
            <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-md bg-white border border-app-card/30">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-app-text font-alexandria leading-tight">
              {selectedProduct.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-bold text-app-gold">
                {selectedProduct.price}
              </span>
              {selectedProduct.oldPrice && (
                <span className="text-sm text-app-textSec line-through opacity-60">
                  {selectedProduct.oldPrice}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-app-text mb-2">الوصف</h3>
            <p className="text-sm text-app-textSec leading-relaxed">
              {selectedProduct.description ||
                "لا يوجد وصف متوفر لهذا المنتج حالياً."}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-app-text mb-3">الكمية</h3>
            <div className="flex items-center gap-6 bg-white w-fit px-4 py-2 rounded-2xl shadow-sm border border-app-card/30">
              <button
                onClick={() => updateQuantity(1)}
                className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors"
              >
                <Plus size={18} />
              </button>
              <span className="text-lg font-bold text-app-text w-8 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(-1)}
                className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          <div className="mb-10">
            <button
              onClick={() => {
                onAddToCart(selectedProduct, quantity);
                setSelectedProduct(null);
              }}
              className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <ShoppingBag size={20} />
              <span>إضافة إلى السلة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== Main Favorites Grid ===================== */
  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar font-alexandria animate-fadeIn">
      <header className="flex items-center justify-center mb-8">
        <h1 className="text-xl font-bold text-app-text">المفضلة</h1>
      </header>

      {favLoading ? (
        <div className="flex-1 flex items-center justify-center text-app-textSec">
          جاري التحميل...
        </div>
      ) : favError ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          حدث خطأ أثناء تحميل المفضلة
        </div>
      ) : visibleFavorites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-app-gold/40 border border-app-card/30">
            <Heart size={48} strokeWidth={1.5} className="text-app-gold" />
          </div>
          <h2 className="text-lg font-bold text-app-text mb-6">
            لا يوجد أي منتجات في المفضلة
          </h2>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
          >
            تسوّق الآن
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 pb-10">
            {visibleFavorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavourite={true} // ✅ favourites list => true
                onToggleFavourite={handleToggleFavouriteInFavTab} // ✅ hide immediately
                onAddToCart={onAddToCart}
                onClick={handleProductClick}
                lang={lang}
              />
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          {favData?.pagination?.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-2 mb-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <span className="text-sm font-medium text-app-text">
                  صفحة {currentPage} من {favData.pagination.total_pages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(favData.pagination.total_pages, prev + 1)
                  )
                }
                disabled={currentPage === favData.pagination.total_pages}
                className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesTab;
