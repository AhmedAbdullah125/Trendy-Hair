import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
    const [page, setPage] = useState(1);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(searchQuery), 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        if (debounced.length >= 2) {
            setShow(true);
            setPage(1);
        } else setShow(false);
    }, [debounced]);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
        };
        if (show) document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [show]);

    const { data, isLoading } = useGetProducts("ar", page, debounced, false);

    const results = useMemo(() => {
        if (!data?.products || !debounced) return [];
        return mapApiProductsToComponent(data.products);
    }, [data, debounced]);

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

                                {data && data.pagination.total_pages > 1 && (
                                    <div className="flex items-center justify-center gap-3 py-3 px-4 border-t border-app-card/30">
                                        <button
                                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                            disabled={page === 1}
                                            className="p-1.5 bg-app-bg rounded-full text-app-text hover:bg-app-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        <span className="text-xs font-medium text-app-textSec">
                                            صفحة {page} من {data.pagination.total_pages}
                                        </span>

                                        <button
                                            onClick={() => setPage((prev) => Math.min(data.pagination.total_pages, prev + 1))}
                                            disabled={page === data.pagination.total_pages}
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
    );
};

export default SearchBar;
