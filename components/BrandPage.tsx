import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Search, Home, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Cookies from "js-cookie";
import { useGetProductsByBrand } from "./requests/useGetProductsByBrand";

const BrandPage = ({ onAddToCart, favourites, onToggleFavourite }) => {
  const navigate = useNavigate();
  const { brandId } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const lang = Cookies.get("lang") || "ar";

  const {
    data: productsData,
    isLoading,
    isError,
  } = useGetProductsByBrand(lang, currentPage, brandId);

  const products = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.main_image,
      price: p.current_price,
      oldPrice: p.has_discount ? p.price : null,
      inStock: p.in_stock,
      brandName: p.brand?.name,
    }));
  }, [productsData]);

  /* ========================= STATES ========================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-app-textSec">جاري تحميل المنتجات...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-lg font-bold text-app-text mb-4">
          حدث خطأ أثناء تحميل المنتجات
        </h2>
        <button
          onClick={() => setCurrentPage(1)}
          className="bg-app-gold text-white px-6 py-3 rounded-xl"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  /* ========================= UI ========================= */

  return (
    <div className="flex flex-col h-full bg-app-bg relative font-alexandria overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 pt-6 pb-4 bg-app-bg shadow-sm border-b border-app-card/30">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm"
        >
          <ArrowRight size={20} />
        </button>

        <h1 className="text-xl font-bold text-app-text flex-1 truncate text-right">
          منتجات العلامة التجارية
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full pb-28 px-6 pt-6">

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavourite={favourites.includes(product.id)}
                onToggleFavourite={onToggleFavourite}
                onAddToCart={onAddToCart}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border">
            <p className="text-app-textSec">
              لا توجد منتجات متوفرة حالياً لهذه العلامة التجارية.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {productsData?.pagination?.total_pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white rounded-full shadow-sm disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm font-medium">
                صفحة {currentPage} من {productsData.pagination.total_pages}
              </span>
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(productsData.pagination.total_pages, p + 1)
                )
              }
              disabled={currentPage === productsData.pagination.total_pages}
              className="p-2 bg-white rounded-full shadow-sm disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandPage;
