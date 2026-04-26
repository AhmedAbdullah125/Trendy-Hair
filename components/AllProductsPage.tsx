import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Search, X, PackageSearch } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
      
      if (searchInput) {
        setSearchParams({ search: searchInput });
      } else {
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // Fetch products from API
  const { data: productsData, isLoading, error } = useGetProducts('ar', currentPage, debouncedSearch, false);

  const productsRaw = productsData?.items?.products;
  const pagination = productsData?.items?.pagination;

  // Transform API products to component format
  const products = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];
    return mapApiProductsToComponent(productsRaw);
  }, [productsRaw]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };
  console.log(productsData);

  return (
    <div className="flex flex-col h-full bg-app-bg relative font-alexandria overflow-hidden">
      <header className="sticky top-0 z-30 flex flex-col gap-4 px-6 pt-6 pb-4 bg-app-bg shadow-sm border-b border-app-card/30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex-shrink-0"
          >
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-bold text-app-text flex-1 truncate text-right">
            جميع المنتجات
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="البحث في جميع المنتجات..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-app-card rounded-full py-3 pr-6 pl-12 text-right focus:outline-none focus:border-app-gold shadow-sm font-alexandria text-sm"
          />
          {searchInput ? (
            <button 
              onClick={() => setSearchInput('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec" size={18} />
          )}
        </div>
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
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="w-24 h-24 bg-app-card/30 rounded-full flex items-center justify-center mb-6">
              <PackageSearch size={48} className="text-app-textSec/50" />
            </div>
            <h3 className="text-xl font-bold text-app-text mb-2">لا توجد منتجات</h3>
            <p className="text-app-textSec max-w-[250px]">
              {debouncedSearch 
                ? `لم نتمكن من العثور على نتائج تطابق "${debouncedSearch}"` 
                : "عذراً، لا توجد منتجات متاحة في الوقت الحالي"}
            </p>
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
            {pagination && pagination.total_pages > 1 && (
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
                    صفحة {currentPage} من {pagination.total_pages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                  disabled={currentPage === pagination.total_pages}
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