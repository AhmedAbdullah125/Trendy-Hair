import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);

    // Tapping a banner used to do nothing visible until the destination
    // mounted and started its own fetch — long enough on a phone connection to
    // read as a dead tap, so people tapped again. This marks the banner busy
    // the moment it is pressed and hands over to the destination's loader.
    const [pendingId, setPendingId] = useState<Banner["id"] | null>(null);
    const externalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (externalTimer.current) clearTimeout(externalTimer.current);
    }, []);

    const hasBanners = banners && banners.length > 0;

    if (!hasBanners) return null;

    const handleBannerClick = (b: Banner) => {
        if (!b.url || !b.url.trim()) return;
        // A second tap while the first is still resolving would open the target
        // twice — two tabs for an external link.
        if (pendingId !== null) return;
        const target = b.url.trim();

        setPendingId(b.id);

        if (/^https?:\/\//i.test(target)) {
            window.open(target, '_blank', 'noopener,noreferrer');
        } else if (target.startsWith('/')) {
            navigate(target);
        } else {
            navigate(`/${target}`);
        }

        // Normally the route change unmounts this slider and the destination's
        // own loader takes over. Two cases never unmount it: an external link
        // opens in a new tab, and a banner pointing at the route we are already
        // on is a no-op navigation. Without this the spinner would sit there
        // forever, so it always gets cleared.
        externalTimer.current = setTimeout(() => setPendingId(null), 1200);
    };

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
                    {banners.map((b) => {
                        const hasLink = Boolean(b.url && b.url.trim());
                        return (
                            <SwiperSlide key={b.id} className="w-full h-full">
                                <div
                                    onClick={() => handleBannerClick(b)}
                                    className={`relative w-full h-full ${hasLink ? "cursor-pointer active:opacity-90 transition-opacity" : ""}`}
                                    role={hasLink ? "button" : undefined}
                                    tabIndex={hasLink ? 0 : undefined}
                                    aria-busy={pendingId === b.id || undefined}
                                >
                                    <img
                                        src={resolveImageUrl(b.image)}
                                        onError={onImageError}
                                        alt={b.title || ""}
                                        className="w-full h-full object-cover object-center block"
                                        draggable={false}
                                    />

                                    {pendingId === b.id && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                                            <div className="w-9 h-9 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
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
