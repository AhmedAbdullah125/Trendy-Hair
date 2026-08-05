import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { onImageError, resolveImageUrl } from "../../lib/imageUrl";

type Banner = { id: number | string; image: string; title?: string; url?: string };

interface Props {
    banners: Banner[];
    disabled?: boolean;
    intervalMs?: number; // optional
}

const BannerSlider: React.FC<Props> = ({ banners, disabled, intervalMs = 2000 }) => {
    const [current, setCurrent] = useState(0);

    const hasBanners = banners && banners.length > 0;

    if (!hasBanners) return null;

    return (
        <div className="px-6">
            <div className="relative w-full md:aspect-[3/1] aspect-[2/1] rounded-[2rem] overflow-hidden shadow-md bg-white border border-app-card/20">
                <Swiper
                    modules={[Autoplay]}
                    autoplay={disabled ? false : { delay: intervalMs, disableOnInteraction: false }}
                    loop={banners.length > 1}
                    onSlideChange={(swiper: SwiperType) => setCurrent(swiper.realIndex)}
                    className="w-full h-full"
                >
                    {banners.map((b) => (
                        <SwiperSlide key={b.id} className="w-full h-full">
                            <img
                                src={resolveImageUrl(b.image)}
                                onError={onImageError}
                                alt={b.title || ""}
                                className="w-full h-full object-cover object-center block"
                                draggable={false}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
                    {banners.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${current === idx ? "w-6 bg-app-gold" : "w-1.5 bg-app-gold/30"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BannerSlider;
