import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

type Banner = { id: number | string; image: string; title?: string; url?: string };

interface Props {
    banners: Banner[];
    disabled?: boolean;
    intervalMs?: number; // optional
}

const BannerSlider: React.FC<Props> = ({ banners, disabled, intervalMs = 2000 }) => {
    const [current, setCurrent] = useState(0);

    const hasBanners = banners && banners.length > 0;

    // Helper function to clean escaped slashes and duplicated base URLs from image URLs
    const cleanImageUrl = (url: string) => {
        if (!url) return '';
        // First, replace escaped slashes
        let cleanedUrl = url.replace(/\\\//g, '/');
        // Remove duplicated base URL pattern (e.g., https://trandyhairapp.com/api/v1/https://trandyhairapp.com/...)
        // Extract the last occurrence of https://trandyhairapp.com
        const matches = cleanedUrl.match(/https:\/\/trandyhairapp\.com/g);
        if (matches && matches.length > 1) {
            // Find the last occurrence and keep everything from there
            const lastIndex = cleanedUrl.lastIndexOf('https://trandyhairapp.com');
            cleanedUrl = cleanedUrl.substring(lastIndex);
        }
        return cleanedUrl;
    };

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
                                src={cleanImageUrl(b.image)}
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
