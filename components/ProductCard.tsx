import React, { useEffect, useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";
import { Product } from "../types";
import { toggleFavourite } from "./requests/toggleFavourites";

interface ProductCardProps {
  product: Product;
  isFavourite: boolean;
  onToggleFavourite: (id: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onClick: (product: Product) => void;
  lang?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavourite,
  onToggleFavourite,
  onAddToCart,
  onClick,
  lang = "ar",
}) => {
  const [favLoading, setFavLoading] = useState(false);

  // ✅ Local override (optimistic) — null يعني اعتمد على props / product.isFavorite
  const [localFavOverride, setLocalFavOverride] = useState<boolean | null>(null);

  // ✅ مصدر الحقيقة للعرض داخل الكارد
  const isFav = useMemo(() => {
    const base = product.isFavorite ?? isFavourite; // حسب بياناتك
    return localFavOverride === null ? base : localFavOverride;
  }, [product.isFavorite, isFavourite, localFavOverride]);

  // لو الـ props اتغيرت من برا (refetch/parent state) صَفّر override
  useEffect(() => {
    setLocalFavOverride(null);
  }, [product.isFavorite, isFavourite]);

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;

    const next = !isFav;

    // ✅ optimistic UI
    setLocalFavOverride(next);

    // ✅ notify parent (في FavoritesTab هيعمل hide فورًا)
    onToggleFavourite(product.id);

    // 🔥 backend
    await toggleFavourite(product.id, setFavLoading, lang);
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="flex flex-col rounded-[20px] bg-white shadow-sm border border-app-card/30 overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer h-full"
    >
      <div className="relative w-full aspect-square bg-app-bg/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent z-10" />

        <div className="absolute inset-x-0 bottom-0 px-3 pb-2 pt-4 z-20">
          <h3 className="text-xs font-bold text-app-text text-right w-full line-clamp-2 font-alexandria leading-relaxed">
            {product.name}
          </h3>
        </div>

        <button
          onClick={handleToggleFavourite}
          disabled={favLoading}
          className={`absolute top-2 right-2 p-1.5 backdrop-blur-md rounded-full shadow-sm transition-all z-30
            ${isFav ? "bg-white text-red-500" : "bg-white/60 text-app-gold hover:bg-white"}
            ${favLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-3 pt-2 mt-auto flex items-center justify-between bg-white">
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-app-gold font-alexandria">
            {product.price}
          </span>
          {product.oldPrice && (
            <span className="text-[9px] text-app-textSec line-through opacity-60 mt-0.5">
              {product.oldPrice}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, 1);
          }}
          className="bg-app-gold text-white text-[10px] font-bold py-1.5 px-3 rounded-xl active:scale-90 transition-transform flex items-center gap-1"
        >
          <span>أضف</span>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
