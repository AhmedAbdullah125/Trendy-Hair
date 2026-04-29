import React from "react";

type Category = {
    id: number;
    name: string;
    image: string | null;
};

interface Props {
    categories: Category[];
    onClickCategory: (id: number, name: string) => void;
}

const API_PREFIX_RE = /^https?:\/\/[^/]+\/api\/v1\/(https?:\/\/)/;
const cleanImageUrl = (url: string): string => url.replace(API_PREFIX_RE, '$1');

const CategoriesRow: React.FC<Props> = ({ categories, onClickCategory }) => {
    if (!categories.length) return null;

    return (
        <div className="px-6 mt-10">
            <h2 className="text-lg font-bold text-app-text mb-4">تسوق حسب الفئة</h2>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => onClickCategory(cat.id, cat.name)}
                        className="relative shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-sm border border-app-card/30 group cursor-pointer"
                    >
                        {cat.image ? (
                            <img
                                src={cleanImageUrl(cat.image)}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full bg-app-gold/10 flex items-center justify-center">
                                <span className="text-app-gold text-3xl font-bold font-alexandria">
                                    {cat.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-3">
                            <span className="text-white text-[10px] font-bold font-alexandria uppercase tracking-wider text-right">
                                {cat.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesRow;
