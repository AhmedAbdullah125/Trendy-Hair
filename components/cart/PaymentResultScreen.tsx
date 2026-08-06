import React from "react";
import { AlertCircle, Clock, Home, Receipt } from "lucide-react";
import type { PaymentOutcome } from "../../lib/paymentReturn";

type Props = {
    orderId: string;
    /** Only the non-success outcomes reach here; `paid` renders `SuccessStep`. */
    outcome: Exclude<PaymentOutcome, 'paid'>;
    /** Reference to show the customer, when the callback supplied one. */
    orderNumber?: string;
    /** Localised sentence from the server, shown in place of our own wording. */
    message?: string;
    onClose: () => void;
    onViewOrderDetails: (orderId: string) => void;
};

/**
 * What the customer sees on returning from the payment gateway without a
 * confirmed payment.
 *
 * Previously nothing was shown: only `status=success&paymentStatus=paid` was
 * acted on, so a failed or unconfirmed payment simply landed on the home
 * screen. The order existed and was unpaid, but nothing said so.
 *
 * The wording deliberately separates the two cases. A failure can be stated
 * plainly because the gateway said so and nothing was charged. "Pending" cannot:
 * a cancelled payment and one still being confirmed arrive identically, so it
 * says the payment is unconfirmed and points at the order — telling someone
 * their payment failed when the money may already have left is worse than
 * asking them to check.
 */
const PaymentResultScreen: React.FC<Props> = ({
    orderId,
    outcome,
    orderNumber,
    message,
    onClose,
    onViewOrderDetails,
}) => {
    const failed = outcome === 'failed';

    return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-fadeIn bg-white">
            <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                    failed ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                }`}
            >
                {failed ? <AlertCircle size={56} /> : <Clock size={56} />}
            </div>

            <h1 className="text-2xl font-bold text-app-text mb-2">
                {failed ? "لم تتم عملية الدفع" : "لم يتم تأكيد الدفع بعد"}
            </h1>

            {/*
              * The server's sentence is used for a genuine failure only.
              *
              * It is chosen from a single `paid` boolean, so an unconfirmed
              * payment gets the failure text — which states outright that
              * nothing was charged. That is a promise nobody can make while the
              * charge is still being confirmed, and it is the whole reason the
              * pending case is distinguished at all, so that case keeps its own
              * wording.
              */}
            <p className="text-app-textSec mb-2 leading-relaxed">
                {failed
                    ? (message ?? "لم يتم خصم أي مبلغ. تم حفظ طلبك ويمكنكِ إتمام الدفع من صفحة الطلبات.")
                    : "طلبك محفوظ، ولكن لم يصلنا تأكيد الدفع حتى الآن. يرجى مراجعة صفحة الطلب قبل إعادة المحاولة."}
            </p>

            <p className="text-xs text-app-textSec mb-8">
                رقم الطلب: <span className="font-bold text-app-text">{orderNumber ?? orderId}</span>
            </p>

            <div className="w-full max-w-[320px] space-y-3">
                <button
                    onClick={() => onViewOrderDetails(orderId)}
                    className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Receipt size={18} />
                    عرض تفاصيل الطلب
                </button>

                <button
                    onClick={onClose}
                    className="w-full bg-transparent border border-app-card text-app-textSec font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Home size={18} />
                    العودة للرئيسية
                </button>
            </div>
        </div>
    );
};

export default PaymentResultScreen;
