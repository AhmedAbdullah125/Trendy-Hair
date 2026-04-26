import React from 'react';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useGetOrders } from '../requests/useGetOrders';

interface OrdersHistoryProps {
    onNavigateToHome: () => void;
    navigate: (path: string) => void;
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ onNavigateToHome, navigate }) => {
    // Fetch orders from API
    const { data, isLoading, error } = useGetOrders({}, 'ar');

    const orders = data?.data || [];

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
            case 'قيد الانتظار':
                return 'bg-yellow-50 text-yellow-600';
            case 'confirmed':
            case 'مؤكد':
                return 'bg-blue-50 text-blue-600';
            case 'processing':
            case 'قيد التجهيز':
            case 'قيد المعالجة':
                return 'bg-amber-50 text-amber-600';
            case 'shipped':
            case 'تم الشحن':
                return 'bg-purple-50 text-purple-600';
            case 'delivered':
            case 'تم التسليم':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'completed':
            case 'مكتمل':
                return 'bg-green-50 text-green-600';
            case 'cancelled':
            case 'ملغي':
                return 'bg-red-50 text-red-600';
            case 'refunded':
            case 'مسترد':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    // Get status label in Arabic
    const getStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
                return 'قيد الانتظار';
            case 'confirmed':
                return 'مؤكد';
            case 'processing':
                return 'قيد التجهيز';
            case 'shipped':
                return 'تم الشحن';
            case 'delivered':
                return 'تم التسليم';
            case 'cancelled':
                return 'ملغي';
            case 'refunded':
                return 'مسترد';
            case 'completed':
                return 'مكتمل';
            default:
                return status;
        }
    };

    // Get payment status badge color
    const getPaymentStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'paid':
            case 'مدفوع':
                return 'bg-green-50 text-green-600 border border-green-200';
            case 'pending':
            case 'قيد الانتظار':
            case 'في الانتظار':
                return 'bg-orange-50 text-orange-500 border border-orange-200';
            case 'failed':
            case 'فشل الدفع':
                return 'bg-red-50 text-red-500 border border-red-200';
            case 'refunded':
            case 'مسترد':
                return 'bg-gray-100 text-gray-600 border border-gray-300';
            default:
                return 'bg-gray-50 text-gray-500 border border-gray-200';
        }
    };

    // Get payment status label in Arabic
    const getPaymentStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'pending':
            case 'قيد الانتظار':
            case 'في الانتظار':
                return 'قيد الانتظار';
            case 'paid':
            case 'مدفوع':
                return 'مدفوع';
            case 'failed':
            case 'فشل الدفع':
                return 'فشل الدفع';
            case 'refunded':
                return 'مسترد';
            default:
                return status;
        }
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/account')}
                    className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
                >
                    <ArrowRight size={24} />
                </button>
                <h1 className="text-xl font-bold text-app-text">سجل طلباتي</h1>
            </header>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 size={48} className="text-app-gold animate-spin mb-4" />
                    <p className="text-app-textSec text-sm">جاري تحميل الطلبات...</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400 border border-red-100">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold text-app-text mb-2">حدث خطأ</h2>
                    <p className="text-sm text-app-textSec mb-6">تعذر تحميل الطلبات. يرجى المحاولة مرة أخرى.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-app-gold/40 border border-app-card/30">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold text-app-text mb-6">لا يوجد أي طلبات حتى الآن</h2>
                    <button
                        onClick={onNavigateToHome}
                        className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
                    >
                        تسوّق الآن
                    </button>
                </div>
            ) : (
                <div className="space-y-4 pb-10">
                    {orders?.map((order: any) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-app-text">
                                    رقم الطلب: {order.order_number}
                                </span>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            {/* Payment status tag */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] text-app-textSec">حالة الدفع:</span>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                                    {getPaymentStatusLabel(order.payment_status)}
                                </span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-xs text-app-textSec">
                                    <span>تاريخ الطلب:</span>
                                    <span className="font-medium" dir="ltr">
                                        {formatDate(order.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-app-textSec">
                                    <span>عدد المنتجات:</span>
                                    <span className="font-medium">{order.items_count}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-app-text">
                                    <span>الإجمالي:</span>
                                    <span className="text-app-gold">{order.total} د.ك</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/account/order/${order.id}`)}
                                className="w-full py-3 text-app-gold font-bold text-sm bg-app-bg rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                عرض التفاصيل
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersHistory;
