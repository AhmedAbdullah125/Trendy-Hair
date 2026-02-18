import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useGetProducts } from './requests/useGetProductsWithSearch';
import { mapApiProductsToComponent } from '../lib/productMapper';
import ProductCard from './ProductCard';

interface AllProductsPageProps {
  onAddToCart: (product: Product, quantity: number) => void;
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
}

const AllProductsPage: React.FC<AllProductsPageProps> = ({
  onAddToCart,
  favourites,
  onToggleFavourite
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products from API
  const { data: productsData, isLoading, error } = useGetProducts('ar', currentPage, '', false);

  // Transform API products to component format
  const products = useMemo(() => {
    if (!productsData?.products) return [];
    return mapApiProductsToComponent(productsData.products);
  }, [productsData]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };
  console.log(productsData);

  return (
    <div className="flex flex-col h-full bg-app-bg relative font-alexandria overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 pt-6 pb-4 bg-app-bg shadow-sm border-b border-app-card/30 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex-shrink-0"
        >
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold text-app-text flex-1 truncate text-right">
          جميع المنتجات
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full pb-28 px-6 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-app-textSec">جاري التحميل...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">حدث خطأ أثناء تحميل المنتجات</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-app-textSec">لا توجد منتجات متاحة حالياً</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavourite={favourites.includes(product.id)}
                  onToggleFavourite={onToggleFavourite}
                  onAddToCart={onAddToCart}
                  onClick={handleProductClick}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {productsData && productsData.pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 mb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                  <span className="text-sm font-medium text-app-text">
                    صفحة {currentPage} من {productsData.pagination.total_pages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(productsData.pagination.total_pages, prev + 1))}
                  disabled={currentPage === productsData.pagination.total_pages}
                  className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AllProductsPage;