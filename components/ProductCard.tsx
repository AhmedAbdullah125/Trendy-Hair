import React, { useEffect, useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";
import { Product } from "../types";
import { toggleFavourite } from "./requests/toggleFavourites";
import { useAddToCart } from "./requests/useAddToCart";

interface ProductCardProps {
  product: Product;
  isFavourite: boolean;
  onToggleFavourite: (id: number) => void;
  onClick: (product: Product) => void;
  lang?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavourite,
  onToggleFavourite,
  onClick,
  lang = "ar",
}) => {
  const [favLoading, setFavLoading] = useState(false);

  // ✅ Add to cart mutation
  const addMut = useAddToCart();

  // ✅ Local override (optimistic) — null يعني اعتمد على props / product.isFavorite
  const [localFavOverride, setLocalFavOverride] = useState<boolean | null>(null);

  // ✅ مصدر الحقيقة للعرض داخل الكارد
  const isFav = useMemo(() => {
    const base = (product as any).isFavorite ?? isFavourite;
    return localFavOverride === null ? base : localFavOverride;
  }, [(product as any).isFavorite, isFavourite, localFavOverride]);

  useEffect(() => {
    setLocalFavOverride(null);
  }, [(product as any).isFavorite, isFavourite]);

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;

    const next = !isFav;
    setLocalFavOverride(next);
    onToggleFavourite(product.id);

    await toggleFavourite(product.id, setFavLoading, lang);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addMut.isPending) return;
    addMut.mutate({ product_id: product.id, quantity: 1, lang });
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="flex flex-col rounded-[20px] bg-white shadow-sm border border-app-card/30 overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer h-full"
    >
      <div className="relative w-full aspect-square bg-app-bg/50 overflow-hidden">
        <img
          src={(product as any).image}
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
            {(product as any).price}
          </span>

          {(product as any).oldPrice && (
            <span className="text-[9px] text-app-textSec line-through opacity-60 mt-0.5">
              {(product as any).oldPrice}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={addMut.isPending}
          className="bg-app-gold text-white text-[10px] font-bold py-1.5 px-3 rounded-xl active:scale-90 transition-transform flex items-center gap-1 disabled:opacity-60"
        >
          <span>أضف</span>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
