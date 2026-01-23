import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Search, Home } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';

interface BrandPageProps {
  onAddToCart: (product: Product, quantity: number) => void;
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
}

const BrandPage: React.FC<BrandPageProps> = ({
  onAddToCart,
  favourites,
  onToggleFavourite
}) => {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const { brands, products } = useData();

  const brand = useMemo(() => {
    return brands.find(b => b.id.toString() === brandId);
  }, [brandId, brands]);

  const brandProducts = useMemo(() => {
    if (!brand) return [];
    return products.filter(p => p.brandId === brand.id && p.isActive);
  }, [brand, products]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  if (!brand) {
    return (
      <div className="flex flex-col h-full bg-app-bg items-center justify-center p-6 text-center font-alexandria">
        <div className="w-20 h-20 bg-app-card rounded-full flex items-center justify-center mb-6">
          <Search size={40} className="text-app-textSec" />
        </div>
        <h2 className="text-xl font-bold text-app-text mb-4">العلامة التجارية غير موجودة</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-app-gold text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <Home size={18} />
          <span>العودة للرئيسية</span>
        </button>
      </div>
    );
  }

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
          {brand.name}
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full pb-28 px-6 pt-6">
        
        {/* Brand Info Hero */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-[2rem] bg-white shadow-md border border-app-card/30 overflow-hidden mb-4 p-2">
                <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="w-full h-full object-cover rounded-[1.5rem]"
                />
            </div>
            <h2 className="text-2xl font-bold text-app-text mb-1">{brand.name}</h2>
            <p className="text-xs text-app-textSec">مجموعة العناية المميزة</p>
        </div>

        {/* Products Section */}
        <div className="mb-6">
            <h3 className="text-lg font-bold text-app-text mb-4 text-right">
                منتجات {brand.name}
            </h3>
            
            {brandProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {brandProducts.map(product => (
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
            ) : (
                <div className="text-center py-10 text-app-textSec bg-white rounded-2xl border border-app-card/30">
                    <p>لا توجد منتجات متوفرة حالياً لهذه العلامة التجارية.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default BrandPage;