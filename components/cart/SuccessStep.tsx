import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
    lastOrderId: string;
    onClose: () => void;
};

const SuccessStep: React.FC<Props> = ({ lastOrderId, onClose }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-fadeIn bg-white">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                <CheckCircle2 size={56} />
            </div>

            <h1 className="text-2xl font-bold text-app-text mb-2">شكراً لطلبك!</h1>
            <p className="text-app-textSec mb-6 leading-relaxed">
                تم استلام طلبك بنجاح، وسيتم التواصل معك لتأكيد التفاصيل.
            </p>
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
