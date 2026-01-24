import React from "react";

type Brand = { id: number; name: string; image: string };

interface Props {
    brands: Brand[];
    onClickBrand: (brandId: number) => void;
}

const BrandsRow: React.FC<Props> = ({ brands, onClickBrand }) => {
    if (!brands.length) return null;

    return (
        <div className="px-6 mt-10">
            <h2 className="text-lg font-bold text-app-text mb-4">أفضل العلامات التجارية</h2>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                {brands.map((brand) => (
                    <div
                        key={brand.id}
                        onClick={() => onClickBrand(brand.id)}
                        className="relative shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-sm border border-app-card/30 group cursor-pointer"
                    >
                        <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-3">
                            <span className="text-white text-[10px] font-bold font-alexandria uppercase tracking-wider text-right">
                                {brand.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandsRow;
