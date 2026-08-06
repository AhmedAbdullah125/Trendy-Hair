import React from "react";
import { X, ChevronLeft, Wallet } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok, faSnapchat, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

type CategoryItem = {
    id: string;
    name: string;
    isActive: boolean;
    sortOrder?: number;
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    onCategoryClick: (name: string, id: string) => void;
    onAccountClick: () => void;
    techBookingUrl?: string;
}

const SideMenuDrawer: React.FC<Props> = ({
    isOpen,
    onClose,
    categories,
    onCategoryClick,
    onAccountClick,
    techBookingUrl,
}) => {
    if (!isOpen) return null;

    /**
     * Closes the drawer and lets the browser follow the link.
     *
     * This used to cancel the click and call `window.open(url, '_blank',
     * 'noopener,noreferrer')`, falling back to `window.location.href = url`
     * when the returned handle was falsy — treating that as "the popup was
     * blocked". But `window.open` returns `null` **by specification** whenever
     * `noopener` is passed: the whole point of the flag is that the opener gets
     * no reference to the new window. So the fallback fired on every single
     * click, and every link opened a new tab *and* navigated the tab behind it
     * to the same URL — leaving the site entirely.
     *
     * The anchors already carry `target="_blank"` and `rel="noopener noreferrer"`,
     * which does exactly the intended thing natively. A genuine user click on an
     * anchor is not subject to popup blocking either, so the fallback this
     * replaced was guarding against something that could not happen.
     */
    const handleExternalLinkClick = () => {
        // Deferred by a tick on purpose. `onClose()` unmounts this drawer, and
        // React flushes a click handler's state update synchronously — so
        // closing inline can tear the anchor out of the DOM before the browser
        // has acted on it, which can swallow the navigation it was supposed to
        // trigger. Letting the current task finish first keeps the element
        // alive long enough for the default action to be taken.
        setTimeout(onClose, 0);
    };

    const handleClose = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={handleClose}>
            <div
                className="absolute right-0 top-0 bottom-0 w-3/4 max-w-[320px] bg-white shadow-2xl animate-slideLeftRtl flex flex-col h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex items-center justify-between border-b border-app-card/30">
                    <span className="text-lg font-bold text-app-text font-alexandria">الأقسام</span>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 hover:bg-app-bg rounded-full transition-colors text-app-text cursor-pointer active:scale-95 z-50"
                        aria-label="إغلاق"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-app-bg active:bg-app-card/50 transition-colors border-b border-app-card/10 group"
                            onClick={() => onCategoryClick(category.name, category.id)}
                        >
                            <span className="text-sm font-medium text-app-text font-alexandria">{category.name}</span>
                            <ChevronLeft size={18} className="text-app-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}

                    <div className="px-6 mt-8 mb-8 space-y-4">
                        <button
                            onClick={onAccountClick}
                            className="w-full h-10 rounded-2xl bg-transparent border border-app-gold text-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5 flex items-center justify-center gap-2"
                        >
                            <Wallet size={16} />
                            <span>حسابي</span>
                        </button>

                        <a
                            href={techBookingUrl || "https://api.whatsapp.com/send?phone=96599007898"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleExternalLinkClick}
                            className="flex items-center justify-center w-full h-10 rounded-2xl bg-app-gold text-white text-center text-sm font-medium shadow-md shadow-app-gold/20 transition-all active:scale-[0.98] hover:bg-app-goldDark cursor-pointer"
                        >
                            حجز التكنك أونلاين ( المرة الأولى مجانا )
                        </a>

                        <a
                            href="https://onelink.to/maison.de.noor.salon"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleExternalLinkClick}
                            className="flex items-center justify-center w-full h-10 rounded-2xl bg-transparent text-app-gold border border-app-gold text-center text-sm font-medium transition-all active:scale-[0.98] hover:bg-app-gold/5 cursor-pointer"
                        >
                            حجز مواعيد التكنت بالصالون
                        </a>
                    </div>

                    <div className="mt-8 px-12">
                        <div className="flex items-center justify-between gap-3">
                            <a
                                href="https://www.instagram.com/trandyhair"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleExternalLinkClick}
                                className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card active:scale-95 transition-all cursor-pointer"
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@trandyhair?_t=ZS-8yhnXac3kFV&_r=1"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleExternalLinkClick}
                                className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card active:scale-95 transition-all cursor-pointer"
                                aria-label="TikTok"
                            >
                                <FontAwesomeIcon icon={faTiktok} />
                            </a>
                            <a
                                href="https://www.snapchat.com/@trandyhairnoor?src=QR_CODE"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleExternalLinkClick}
                                className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card active:scale-95 transition-all cursor-pointer"
                                aria-label="Snapchat"
                            >
                                <FontAwesomeIcon icon={faSnapchat} />
                            </a>
                            <a
                                href="https://api.whatsapp.com/send?phone=96599007898"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleExternalLinkClick}
                                className="h-10 w-10 rounded-full bg-app-bg flex items-center justify-center text-app-gold text-lg hover:bg-app-card active:scale-95 transition-all cursor-pointer"
                                aria-label="WhatsApp"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-app-card/30 bg-app-bg/30">
                    <a
                        href="https://raiyansoft.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleExternalLinkClick}
                        className="text-[10px] text-app-textSec text-center font-alexandria block hover:text-app-gold cursor-pointer"
                    >
                        Powered by raiyansoft
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SideMenuDrawer;
