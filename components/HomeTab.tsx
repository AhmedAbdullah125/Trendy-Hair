

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Menu, ShoppingBag, Search, X, ChevronLeft, ChevronRight, ArrowRight, Minus, Plus, Wallet } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faSnapchat, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';
import { useGetCategories } from './requests/useGetCategories';
import { useGetProducts } from './requests/useGetProductsWithSearch';
import { useGetHomeData } from './requests/useGetHomeData';
import { useGetProductsByCategory } from './requests/useGetProductsByCategory';
import { mapApiProductsToComponent } from '../lib/productMapper';
import { API_BASE_URL } from '../lib/apiConfig';

interface HomeTabProps {
  cartCount: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenCart: () => void;
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
}

// Reusable component for product rows
interface ProductRowSectionProps {
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

const ProductRowSection: React.FC<ProductRowSectionProps> = ({
  title,
  products,
  onViewAll,
  showViewAll = true,
  titleSize = "text-lg",
  favourites,
  onToggleFavourite,
  onAddToCart,
  onProductClick
}) => (
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
      {products.map(product => (
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

const HomeTab: React.FC<HomeTabProps> = ({ cartCount, onAddToCart, onOpenCart, favourites, onToggleFavourite }) => {
  const navigate = useNavigate();
  const { productId, categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('id');
  const { products, contentSettings } = useData();

  // Fetch categories from API
  const { data: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useGetCategories('ar');

  // Fetch home data (banners, brands, recently arrived products, packages) from API
  const { data: homeData, isLoading: homeDataLoading } = useGetHomeData('ar');

  // Transform API categories to match the expected format
  const categories = useMemo(() => {
    if (!apiCategories) return [];
    return apiCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      image: `${API_BASE_URL}/${cat.image}`,
      isActive: cat.is_active === 1,
      sortOrder: cat.position
    }));
  }, [apiCategories]);

  // Transform banners from API
  const banners = useMemo(() => {
    if (!homeData?.banners) return [];
    return homeData.banners
      .filter((banner: any) => banner.is_active === 1)
      .sort((a: any, b: any) => a.position - b.position)
      .map((banner: any) => ({
        id: banner.id,
        image: `${API_BASE_URL}/${banner.image}`,
        title: banner.title,
        url: banner.url
      }));
  }, [homeData]);

  // Transform brands from API
  const brands = useMemo(() => {
    if (!homeData?.brands) return [];
    return homeData.brands
      .filter((brand: any) => brand.is_active === 1)
      .sort((a: any, b: any) => a.position - b.position)
      .map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        image: `${API_BASE_URL}/${brand.image}`,
        isActive: brand.is_active === 1,
        sortOrder: brand.position
      }));
  }, [homeData]);

  // Transform recently arrived products from API
  const recentProducts = useMemo(() => {
    if (!homeData?.products_recently) return [];
    return mapApiProductsToComponent(homeData.products_recently);
  }, [homeData]);

  // Transform packages from API
  const packages = useMemo(() => {
    if (!homeData?.packages) return [];
    return homeData.packages
      .filter((pkg: any) => pkg.is_active === 1)
      .map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        isActive: pkg.is_active === 1,
        productIds: pkg.products.map((p: any) => p.id),
        displayOrder: pkg.id,
        products: mapApiProductsToComponent(pkg.products)
      }));
  }, [homeData]);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  // Category page state
  const [categoryPage, setCategoryPage] = useState(1);

  // Fetch search results from API
  const { data: searchProductsData, isLoading: searchLoading } = useGetProducts(
    'ar',
    searchPage,
    debouncedSearchQuery,
    false
  );

  // Fetch category products from API
  const { data: categoryProductsData, isLoading: categoryLoading, error: categoryError } = useGetProductsByCategory(
    'ar',
    categoryPage,
    categoryId || ''
  );

  // Transform search results
  const searchResults = useMemo(() => {
    if (!searchProductsData?.products || !debouncedSearchQuery) return [];
    return mapApiProductsToComponent(searchProductsData.products);
  }, [searchProductsData, debouncedSearchQuery]);

  // Ref for search container (click outside to close)
  const searchRef = useRef<HTMLDivElement>(null);

  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return products.find(p => p.id === parseInt(productId)) || null;
  }, [productId, products]);

  const activeCategory = useMemo(() => {
    return categoryName || null;
  }, [categoryName]);

  // Transform category products from API
  const categoryProducts = useMemo(() => {
    if (!categoryProductsData?.products || !categoryId) return [];
    return mapApiProductsToComponent(categoryProductsData.products);
  }, [categoryProductsData, categoryId]);

  // Filter and Sort Categories for Side Menu
  const activeCategories = useMemo(() => {
    return categories
      .filter(c => c.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);



  useEffect(() => {
    if (activeCategory || selectedProduct) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [banners.length, activeCategory, selectedProduct]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show search results when there's a debounced query
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      setShowSearchResults(true);
      setSearchPage(1); // Reset to page 1 when search query changes
    } else {
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleCategoryClick = (categoryName: string, categoryId: string) => {
    navigate(`/category/${encodeURIComponent(categoryName)}?id=${categoryId}`);
    setIsMenuOpen(false);
  };

  const handleProductClick = (product: Product) => {
    setQuantity(1);
    navigate(`/product/${product.id}`);
  };

  const updateQuantity = (val: number) => {
    setQuantity(prev => Math.max(1, prev + val));
  };

  const handleAddAction = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, quantity);
      navigate(-1);
    }
  };

  const handleBuyNow = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, quantity);
      onOpenCart();
    }
  };

  const handleSearchResultClick = (product: Product) => {
    handleProductClick(product);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setShowSearchResults(false);
  };

  const renderProductRows = () => {
    const rowProps = {
      favourites,
      onToggleFavourite,
      onAddToCart,
      onProductClick: handleProductClick
    };

    return (
      <>
        <ProductRowSection
          title="وصلنا حديثاً"
          products={recentProducts}
          onViewAll={() => navigate('/products')}
          showViewAll={true}
          {...rowProps}
        />

        {/* Dynamic Packages */}
        {packages.map(pkg => {
          if (!pkg.products || pkg.products.length === 0) return null;

          return (
            <ProductRowSection
              key={pkg.id}
              title={pkg.name}
              products={pkg.products}
              showViewAll={false}
              titleSize="text-base"
              {...rowProps}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col h-[100vh] bg-app-bg relative font-alexandria overflow-hidden">

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={toggleMenu}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-3/4 max-w-[320px] bg-white shadow-2xl animate-slideLeftRtl flex flex-col fixed h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-app-card/30">
              <span className="text-lg font-bold text-app-text font-alexandria">الأقسام</span>
              <button onClick={toggleMenu} className="p-2 hover:bg-app-bg rounded-full transition-colors text-app-text">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4">
              {activeCategories.map((category) => (
                <button
                  key={category.id}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-app-bg active:bg-app-card/50 transition-colors border-b border-app-card/10 group"
                  onClick={() => handleCategoryClick(category.name, category.id)}
                >
                  <span className="text-sm font-medium text-app-text font-alexandria">{category.name}</span>
                  <ChevronLeft size={18} className="text-app-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

              {/* Account & Booking Buttons */}
              <div className="px-6 mt-8 mb-8 space-y-4">
                <button
                  onClick={() => {
                    navigate('/account');
                    toggleMenu();
                  }}
                  className="w-full h-10 rounded-2xl bg-transparent border border-app-gold text-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5 flex items-center justify-center gap-2"
                >
                  <Wallet size={16} />
                  <span>حسابي</span>
                </button>

                <a
                  href={contentSettings?.techBookingUrl || 'https://wa.me/96599007898'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-10 rounded-2xl bg-app-gold text-white text-center text-sm font-medium shadow-md shadow-app-gold/20 transition-all active:scale-[0.98] hover:bg-app-goldDark"
                >
                  حجز التكنك أونلاين ( المرة الأولى مجانا )
                </a>

                <a
                  href="https://maison-de-noor.raiyansoft.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-10 rounded-2xl bg-transparent text-app-gold border border-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5"
                >
                  حجز مواعيد التكنت بالصالون
                </a>
              </div>

              {/* Social Media Section */}
              <div className="mt-8 px-12">
                <div className="flex items-center justify-between gap-3">
                  <a href="https://instagram.com/trandyhair" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card"><FontAwesomeIcon icon={faInstagram} /></a>
                  <a href="https://tiktok.com/@trandyhair" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card"><FontAwesomeIcon icon={faTiktok} /></a>
                  <a href="https://snapchat.com/@trandyhairnoor" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card"><FontAwesomeIcon icon={faSnapchat} /></a>
                  <a href="https://wa.me/96599007898" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card"><FontAwesomeIcon icon={faWhatsapp} /></a>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-app-card/30 bg-app-bg/30">
              <a href="https://raiyansoft.net" target="_blank" rel="noreferrer" className="text-[10px] text-app-textSec text-center font-alexandria block hover:text-app-gold">Powered by raiyansoft</a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 pt-6 pb-4 bg-app-bg shadow-sm border-b border-app-card/30 flex-shrink-0">
        <button onClick={toggleMenu} className="p-2 text-app-text hover:bg-app-card rounded-full transition-colors flex-shrink-0">
          <Menu size={24} />
        </button>

        <h1 className="text-xl font-bold text-app-text font-alexandria text-center flex-1 truncate px-2 cursor-pointer" onClick={() => { navigate('/'); }}>Trandy Hair</h1>

        <button onClick={onOpenCart} className="p-2 text-app-text hover:bg-app-card rounded-full transition-colors flex-shrink-0 relative">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <div className="absolute top-1 right-1 bg-app-gold text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-app-bg px-1 animate-scaleIn">
              {cartCount}
            </div>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pb-28">
        {selectedProduct ? (
          <div className="animate-fadeIn pt-4">
            <div className="px-6 mb-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors flex items-center gap-2">
                <ArrowRight size={20} />
                <span className="text-sm font-medium">العودة</span>
              </button>
            </div>
            <div className="px-6 mb-6">
              <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-md bg-white border border-app-card/30">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="px-8 mb-4">
              <h2 className="text-2xl font-bold text-app-text font-alexandria leading-tight">{selectedProduct.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-bold text-app-gold">{selectedProduct.price}</span>
                {selectedProduct.oldPrice && (
                  <span className="text-sm text-app-textSec line-through opacity-60">{selectedProduct.oldPrice}</span>
                )}
              </div>
            </div>
            <div className="px-8 mb-8">
              <h3 className="text-sm font-bold text-app-text mb-2">الوصف</h3>
              <p className="text-sm text-app-textSec leading-relaxed">
                {selectedProduct.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
              </p>
            </div>
            <div className="px-8 mb-8">
              <h3 className="text-sm font-bold text-app-text mb-3">الكمية</h3>
              <div className="flex items-center gap-6 bg-white w-fit px-4 py-2 rounded-2xl shadow-sm border border-app-card/30">
                <button onClick={() => updateQuantity(1)} className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors"><Plus size={18} /></button>
                <span className="text-lg font-bold text-app-text w-8 text-center tabular-nums">{quantity}</span>
                <button onClick={() => updateQuantity(-1)} className="p-1.5 bg-app-bg rounded-lg text-app-gold hover:bg-app-card transition-colors"><Minus size={18} /></button>
              </div>
            </div>
            <div className="px-8 mt-6 space-y-3 mb-10">
              <button onClick={handleAddAction} className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <ShoppingBag size={20} />
                <span>إضافة إلى السلة</span>
              </button>
              <button onClick={handleBuyNow} className="w-full bg-white text-app-gold border border-app-gold font-bold py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center">
                <span>اشتري الآن</span>
              </button>
            </div>
          </div>
        ) : !activeCategory ? (
          <div className="pt-4">
            <div className="px-6 mb-6">
              <div className="relative w-full" ref={searchRef}>
                <input
                  type="text"
                  placeholder="بحث عن منتج"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-app-card rounded-full py-3.5 pr-6 pl-12 text-right focus:outline-none focus:border-app-gold shadow-sm font-alexandria text-sm"
                />
                {searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-text transition-colors"
                  >
                    <X size={20} />
                  </button>
                ) : (
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-app-card/30 max-h-96 overflow-y-auto z-50">
                    {searchLoading ? (
                      <div className="p-6 text-center text-app-textSec">
                        جاري البحث...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-6 text-center text-app-textSec">
                        لا توجد نتائج
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSearchResultClick(product)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-app-bg transition-colors text-right"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-app-text truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-app-gold font-bold mt-0.5">
                                {product.price}
                              </p>
                            </div>
                            <ChevronLeft size={16} className="text-app-textSec flex-shrink-0" />
                          </button>
                        ))}

                        {/* Pagination Controls */}
                        {searchProductsData && searchProductsData.pagination.total_pages > 1 && (
                          <div className="flex items-center justify-center gap-3 py-3 px-4 border-t border-app-card/30">
                            <button
                              onClick={() => setSearchPage(prev => Math.max(1, prev - 1))}
                              disabled={searchPage === 1}
                              className="p-1.5 bg-app-bg rounded-full text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight size={18} />
                            </button>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-app-textSec">
                                صفحة {searchPage} من {searchProductsData.pagination.total_pages}
                              </span>
                            </div>

                            <button
                              onClick={() => setSearchPage(prev => Math.min(searchProductsData.pagination.total_pages, prev + 1))}
                              disabled={searchPage === searchProductsData.pagination.total_pages}
                              className="p-1.5 bg-app-bg rounded-full text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6">
              <div
                className="relative w-full h-auto rounded-[2rem] overflow-hidden shadow-md bg-white border border-app-card/20"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              >
                <div className="flex w-full h-auto transition-transform duration-700 ease-in-out" style={{ transform: `translateX(${currentBanner * 100}%)` }}>
                  {banners.map((banner) => (
                    <div key={banner.id} className="min-w-full h-auto flex items-center justify-center">
                      <img src={banner.image} alt="" className="w-full h-auto object-contain object-center block" />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {banners.map((_, index) => (
                    <div key={index} className={`h-1.5 rounded-full transition-all duration-300 ${currentBanner === index ? 'w-6 bg-app-gold' : 'w-1.5 bg-app-gold/30'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Brands Section */}
            <div className="px-6 mt-10">
              <h2 className="text-lg font-bold text-app-text mb-4">أفضل العلامات التجارية</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                {brands.map((brand) => (
                  <div key={brand.id} onClick={() => navigate(`/brand/${brand.id}`)} className="relative shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-sm border border-app-card/30 group cursor-pointer">
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-3">
                      <span className="text-white text-[10px] font-bold font-alexandria uppercase tracking-wider text-right">{brand.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderProductRows()}

          </div>
        ) : (
          <div className="animate-fadeIn pt-4">
            <div className="px-6 mb-6 flex items-center gap-2">
              <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors">
                <ArrowRight size={20} />
              </button>
              <h2 className="text-lg font-bold text-app-text font-alexandria truncate">{activeCategory}</h2>
            </div>
            <div className="px-6 grid grid-cols-2 gap-4">
              {categoryLoading ? (
                <div className="col-span-2 text-center text-app-textSec py-10">
                  جاري التحميل...
                </div>
              ) : categoryError ? (
                <div className="col-span-2 text-center text-red-500 py-10">
                  حدث خطأ أثناء تحميل المنتجات
                </div>
              ) : categoryProducts.length > 0 ? (
                categoryProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavourite={favourites.includes(product.id)}
                    onToggleFavourite={onToggleFavourite}
                    onAddToCart={onAddToCart}
                    onClick={handleProductClick}
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-app-textSec py-10">لا توجد منتجات في هذا القسم حالياً.</p>
              )}
            </div>

            {/* Pagination Controls */}
            {categoryProductsData && categoryProductsData.pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 mb-4 px-6">
                <button
                  onClick={() => setCategoryPage(prev => Math.max(1, prev - 1))}
                  disabled={categoryPage === 1}
                  className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                  <span className="text-sm font-medium text-app-text">
                    صفحة {categoryPage} من {categoryProductsData.pagination.total_pages}
                  </span>
                </div>

                <button
                  onClick={() => setCategoryPage(prev => Math.min(categoryProductsData.pagination.total_pages, prev + 1))}
                  disabled={categoryPage === categoryProductsData.pagination.total_pages}
                  className="p-2 bg-white rounded-full shadow-sm text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeTab;