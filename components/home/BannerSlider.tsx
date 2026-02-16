import React, { useEffect, useMemo, useState } from "react";

type Banner = { id: number | string; image: string; title?: string; url?: string };

interface Props {
    banners: Banner[];
    disabled?: boolean;
    intervalMs?: number; // optional
}

const BannerSlider: React.FC<Props> = ({ banners, disabled, intervalMs = 2000 }) => {
    const [current, setCurrent] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const hasBanners = banners && banners.length > 0;

    // keep current in range if banners length changes
    useEffect(() => {
        if (!hasBanners) return;
        setCurrent((c) => Math.min(c, banners.length - 1));
    }, [hasBanners, banners.length]);

    useEffect(() => {
        if (disabled) return;
        if (!hasBanners) return;

        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, intervalMs);

        return () => clearInterval(timer);
    }, [disabled, hasBanners, banners.length, intervalMs]);

    const minSwipeDistance = 50;

    const onTouchStartHandler = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMoveHandler = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEndHandler = () => {
        if (touchStart == null || touchEnd == null) return;
        const distance = touchStart - touchEnd;

        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrent((prev) => (prev + 1) % banners.length);
        } else if (isRightSwipe) {
            setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
        }
    };
    // Helper function to clean escaped slashes from image URLs
    const cleanImageUrl = (url: string) => {
        return url?.replace(/\\\//g, '/') || '';
    };


    if (!hasBanners) return null;

    return (
        <div className="px-6">
            <div
                className="relative w-full md:aspect-[3/1] aspect-[2/1] rounded-[2rem] overflow-hidden shadow-md bg-white border border-app-card/20"
                onTouchStart={onTouchStartHandler}
                onTouchMove={onTouchMoveHandler}
                onTouchEnd={onTouchEndHandler}
            >
                {/* ✅ IMPORTANT: same as old HomeTab (positive translateX for RTL look) */}
                <div
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(${current * 100}%)` }}
                >
                    {banners.map((b) => (
                        <div key={b.id} className="min-w-full h-full flex items-center justify-center">
                            <img
                                src={cleanImageUrl(b.image)}
                                alt={b.title || ""}
                                className="w-full h-full object-cover object-center block"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {banners.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${current === idx ? "w-6 bg-app-gold" : "w-1.5 bg-app-gold/30"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BannerSlider;
