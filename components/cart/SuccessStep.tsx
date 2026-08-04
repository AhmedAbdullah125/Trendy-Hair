import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
    lastOrderId: string;
    onClose: () => void;
    /**
     * Accepted for call-site compatibility but intentionally unused: this screen
     * navigates to the order via `useNavigate`.
     */
    onViewOrderDetails?: (orderId: string) => void;
    /** Prize credit the server actually applied to this order, in KD. */
    walletAmount?: number;
    /** Credit the checkout screen offered, for spotting a shortfall. */
    requestedWalletAmount?: number;
};

const SuccessStep: React.FC<Props> = ({
    lastOrderId,
    onClose,
    walletAmount = 0,
    requestedWalletAmount = 0,
}) => {
    const navigate = useNavigate();
    // Balance promised to an unpaid order is not spendable twice, so the server
    // can grant less than the slider offered. Say so rather than letting the
    // total quietly differ from the one shown at checkout.
    const shortfall = requestedWalletAmount - walletAmount > 0.0005;
    return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-fadeIn bg-white">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                <CheckCircle2 size={56} />
            </div>

            <h1 className="text-2xl font-bold text-app-text mb-2">شكراً لطلبك!</h1>
            <p className="text-app-textSec mb-6 leading-relaxed">
                تم استلام طلبك بنجاح، وسيتم التواصل معك لتأكيد التفاصيل.
            </p>

            {/*
              The prize credit is not taken at checkout — a cash order is charged
              on delivery. Calling it "deducted" here made the unchanged balance
              on the account screen look like the discount had failed.
            */}
            {walletAmount > 0 && (
                <div className="w-full bg-app-bg border border-app-card rounded-2xl p-4 mb-6 text-center">
                    <p className="text-sm text-app-text font-bold mb-1">
                        تم حجز {walletAmount.toFixed(3)} د.ك من رصيد الجوائز لهذا الطلب
                    </p>
                    <p className="text-[11px] text-app-textSec leading-relaxed">
                        سيتم خصم المبلغ من رصيدك عند استلام الطلب، ولا يمكن استخدامه في طلب آخر حتى ذلك الحين.
                    </p>
                </div>
            )}

            {shortfall && (
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-xs text-yellow-800 font-bold leading-relaxed">
                        تم تطبيق {walletAmount.toFixed(3)} د.ك فقط من أصل {requestedWalletAmount.toFixed(3)} د.ك،
                        لأن جزءاً من رصيدك محجوز لطلب آخر قيد الانتظار.
                    </p>
                </div>
            )}
            <div className="w-full space-y-3">
                <button
                    onClick={onClose}
                    className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
                >
                    الرجوع للرئيسية
                </button>
                <button
                    onClick={() => {
                        navigate("/account/history");
                        onClose();
                    }}
                    className="w-full text-app-gold font-bold py-4 rounded-2xl active:bg-app-bg transition-colors"
                >
                    عرض الطلبات
                </button>
            </div>
        </div>
    );
};

export default SuccessStep;
