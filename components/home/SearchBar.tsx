import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types";
import { useGetProducts } from "../requests/useGetProductsWithSearch";
import { mapApiProductsToComponent } from "../../lib/productMapper";

interface Props {
    onProductClick: (p: Product) => void;
}

const SearchBar: React.FC<Props> = ({ onProductClick }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debounced, setDebounced] = useState("");
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setDebounced(searchQuery), 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        if (debounced.length >= 2) setShow(true);
        else setShow(false);
    }, [debounced]);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
        };
        if (show) document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [show]);

    const { data, isLoading } = useGetProducts("ar", 1, debounced, false, { enabled: !!debounced });

    const products = data?.items?.products;
    const pagination = data?.items?.pagination;

    const results = useMemo(() => {
        if (!Array.isArray(products) || !debounced) return [];
        return mapApiProductsToComponent(products);
    }, [products, debounced]);

    const clear = () => {
        setSearchQuery("");
        setDebounced("");
        setShow(false);
    };

    const handleClick = (p: Product) => {
        onProductClick(p);
        clear();
    };

    return (
        <div className="px-6 mb-6">
            <div className="relative w-full" ref={ref}>
                <input
                    type="text"
                    placeholder="بحث عن منتج"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-app-card rounded-full py-3.5 pr-6 pl-12 text-right focus:outline-none focus:border-app-gold shadow-sm font-alexandria text-sm"
                />

                {searchQuery ? (
                    <button onClick={clear} className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-text transition-colors">
                        <X size={20} />
                    </button>
                ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
                )}

                {show && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-app-card/30 max-h-96 overflow-y-auto z-50">
                        {isLoading ? (
                            <div className="p-6 text-center text-app-textSec">جاري البحث...</div>
                        ) : results.length === 0 ? (
                            <div className="p-6 text-center text-app-textSec">لا توجد نتائج</div>
                        ) : (
                            <div className="py-2">
                                {results.map((p) => (
                                    <button key={p.id} onClick={() => handleClick(p)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-app-bg transition-colors text-right">
                                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-app-text truncate">{p.name}</p>
                                            <p className="text-xs text-app-gold font-bold mt-0.5">{p.price}</p>
                                        </div>
                                        <ChevronLeft size={16} className="text-app-textSec flex-shrink-0" />
                                    </button>
                                ))}

                                {pagination && pagination.total_pages > 1 && (
                                    <div className="px-4 py-3 border-t border-app-card/30">
                                        <button
                                            onClick={() => {
                                                setShow(false);
                                                navigate(`/products?search=${encodeURIComponent(debounced)}`);
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-app-gold/10 text-app-gold text-sm font-semibold font-alexandria hover:bg-app-gold/20 transition-colors"
                                        >
                                            عرض جميع النتائج ({pagination.total_items})
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
