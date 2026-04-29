import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Heart, Minus, Plus } from "lucide-react";
import { Product } from "../types";
import { toggleFavourite } from "./requests/toggleFavourites";
import { useAddToCart } from "./requests/useAddToCart";
import { useDeleteCartItem } from "./requests/useDeleteCartItem";
import { useGetCart } from "./requests/useGetCart";
import { addToCart } from "./requests/addToCart";
import { useQueryClient } from "@tanstack/react-query";

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
  const [localFavOverride, setLocalFavOverride] = useState<boolean | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const addMut = useAddToCart();
  const deleteMut = useDeleteCartItem();
  const qc = useQueryClient();

  const { data: cartData } = useGetCart(lang);

  // Find the cart item that matches this product (if any)
  const cartItem = useMemo(() => {
    return cartData?.items?.items?.find(
      (item) => item.product_id === product.id
    ) ?? null;
  }, [cartData, product.id]);

  // Local quantity — synced with server whenever cartItem changes
  const [localQty, setLocalQty] = useState<number>(cartItem?.quantity ?? 0);

  useEffect(() => {
    setLocalQty(cartItem?.quantity ?? 0);
  }, [cartItem?.quantity]);

  // True when local qty differs from confirmed server qty
  const isDirty = cartItem && localQty !== cartItem.quantity;

  const isFav = useMemo(() => {
    const base = isFavourite;
    return localFavOverride === null ? base : localFavOverride;
  }, [isFavourite, localFavOverride, (product as any).isFavorite]);

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

  // ── Add to cart (first time) ──────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addMut.isPending) return;
    addMut.mutate({ product_id: product.id, quantity: 1, lang });
  };

  // ── Counter: minus ────────────────────────────────────────────────────────
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalQty((q) => Math.max(0, q - 1));
  };

  // ── Counter: plus ─────────────────────────────────────────────────────────
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalQty((q) => q + 1);
  };

  // ── Debounced quantity update ───────────────────────────────────────────────
  useEffect(() => {
    if (!cartItem) return;
    if (localQty === cartItem.quantity) return;

    const timer = setTimeout(async () => {
      if (localQty === 0) {
        deleteMut.mutate({ cartItemId: cartItem.id, lang });
      } else {
        await addToCart(product.id, localQty, setUpdateLoading, lang);
        await qc.invalidateQueries({ queryKey: ["cart"] });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localQty, cartItem, lang, product.id, qc]);

  const isBusy =
    addMut.isPending || updateLoading || deleteMut.isPending;

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

      <div className="p-2 mt-auto flex items-center justify-between flex-wrap bg-white gap-2">
        <div className="flex flex-col items-start shrink-0">
          <span className="text-sm font-bold text-app-gold font-alexandria">
            {(product as any).price}
          </span>

          {(product as any).oldPrice && (
            <span className="text-[9px] text-app-textSec line-through opacity-60 mt-0.5">
              {(product as any).oldPrice}
            </span>
          )}
        </div>

        {/* ── Not in cart → Add button ─────────────────────────────── */}
        {!cartItem ? (
          <button
            onClick={handleAddToCart}
            disabled={isBusy || !(product as any).inStock}
            className={`${(product as any).inStock ? "bg-app-gold" : "bg-gray-400"
              } text-white text-[10px] font-bold py-1.5 px-3 rounded-xl active:scale-90 transition-transform flex items-center gap-1 disabled:opacity-60`}
          >
            <span>{(product as any).inStock ? "أضف" : "نفذت الكمية"}</span>
            {(product as any).inStock && <Plus size={12} />}
          </button>
        ) : (
          /* ── In cart → Counter + confirm ─────────────────────────── */
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1"
          >
            {/* Minus */}
            <button
              onClick={handleDecrement}
              disabled={isBusy}
              className="w-6 h-6 rounded-lg bg-app-card/60 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
              <Minus size={11} className="text-app-text" />
            </button>

            {/* Quantity */}
            <span className="min-w-[18px] text-center text-xs font-bold text-app-text font-alexandria">
              {localQty}
            </span>

            {/* Plus */}
            <button
              onClick={handleIncrement}
              disabled={isBusy || !(product as any).inStock}
              className="w-6 h-6 rounded-lg bg-app-card/60 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
              <Plus size={11} className="text-app-text" />
            </button>

            {/* Loading indicator */}
            {isBusy && (
              <div className="w-6 h-6 flex items-center justify-center ml-0.5">
                <div className="w-3 h-3 border-2 border-app-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;