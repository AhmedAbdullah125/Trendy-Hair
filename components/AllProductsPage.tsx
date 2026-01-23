import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
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
  const { products } = useData();

  // Show only active products
  const activeProducts = products.filter(p => p.isActive);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

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
        <div className="grid grid-cols-2 gap-4">
          {activeProducts.map(product => (
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
      </main>
    </div>
  );
};

export default AllProductsPage;