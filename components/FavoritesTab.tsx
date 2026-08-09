import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
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

  const handleProductClick = (product: Product) => {
    // Use the canonical product page instead of the reduced favourites-only
    // overlay. It contains the real stock state, cart-aware quantity controls,
    // and the "اشتري الآن" action; Back naturally returns to favourites.
    navigate(`/product/${product.id}`);
  };

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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 pb-10">
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
