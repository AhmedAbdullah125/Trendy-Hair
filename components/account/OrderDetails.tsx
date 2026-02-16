import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Package, Loader2 } from 'lucide-react';
import { useGetOrder } from '../requests/useGetOrder';

interface OrderDetailsProps {
    navigate: (path: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ navigate }) => {
    const { orderId } = useParams();

    // Fetch order from API - parse orderId to number
    const { data: orderData, isLoading, error } = useGetOrder(orderId ? parseInt(orderId) : undefined, 'ar');

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
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-600';
            case 'confirmed':
                return 'bg-blue-50 text-blue-600';
            case 'completed':
                return 'bg-green-50 text-green-600';
            case 'cancelled':
                return 'bg-red-50 text-red-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    // Get status label in Arabic
    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'قيد الانتظار';
            case 'confirmed':
                return 'مؤكد';
            case 'completed':
                return 'مكتمل';
            case 'cancelled':
                return 'ملغي';
            default:
                return status;
        }
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            <header className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/account/history')}
                    className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
                >
                    <ArrowRight size={24} />
                </button>
                <h1 className="text-xl font-bold text-app-text">تفاصيل الطلب</h1>
            </header>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 size={48} className="text-app-gold animate-spin mb-4" />
                    <p className="text-app-textSec text-sm">جاري تحميل تفاصيل الطلب...</p>
                </div>
            ) : error || !orderData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400 border border-red-100">
                        <Package size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-bold text-app-text mb-2">حدث خطأ</h2>
                    <p className="text-sm text-app-textSec mb-6">تعذر تحميل تفاصيل الطلب. يرجى المحاولة مرة أخرى.</p>
                    <button
                        onClick={() => navigate('/account/history')}
                        className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
                    >
                        العودة للطلبات
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-10">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-app-bg rounded-xl text-app-gold">
                                <Package size={20} />
                            </div>
                            <span className="text-sm font-bold text-app-text">ملخص الطلب</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-app-textSec">
                                <span>رقم الطلب</span>
                                <span className="font-bold text-app-text">#{orderData.order_number}</span>
                            </div>
                            <div className="flex justify-between text-xs text-app-textSec">
                                <span>التاريخ</span>
                                <span className="font-medium text-app-text" dir="ltr">
                                    {formatDate(orderData.created_at)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-app-textSec">
                                <span>الحالة</span>
                                <span className={`font-bold px-3 py-1 rounded-full text-[10px] ${getStatusColor(orderData.status)}`}>
                                    {getStatusLabel(orderData.status)}
                                </span>
                            </div>
                            {orderData.notes && (
                                <div className="flex flex-col gap-1 text-xs">
                                    <span className="text-app-textSec">ملاحظات:</span>
                                    <span className="font-medium text-app-text bg-app-bg p-2 rounded-xl">
                                        {orderData.notes}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-app-text px-2">المنتجات ({orderData.items_count})</h3>
                        {orderData.items?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-2xl p-4 flex gap-4 border border-app-card/10 shadow-sm">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-app-bg border border-app-card/10 flex-shrink-0">
                                    <img
                                        src={item.product?.main_image || item.product?.image}
                                        alt={item.product?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <h4 className="text-xs font-bold text-app-text line-clamp-2">
                                        {item.product?.name}
                                    </h4>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-app-textSec">
                                            الكمية: {item.quantity}
                                        </span>
                                        <span className="text-xs font-bold text-app-gold">
                                            {item.price} د.ك
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-app-textSec">
                                <span>الإجمالي الفرعي</span>
                                <span className="font-medium">{orderData.subtotal} د.ك</span>
                            </div>
                            {parseFloat(orderData.discount) > 0 && (
                                <div className="flex justify-between text-xs text-green-600">
                                    <span>الخصم</span>
                                    <span className="font-medium">- {orderData.discount} د.ك</span>
                                </div>
                            )}
                            {parseFloat(orderData.wallet_amount) > 0 && (
                                <div className="flex justify-between text-xs text-purple-600">
                                    <span>من المحفظة</span>
                                    <span className="font-medium">- {orderData.wallet_amount} د.ك</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs text-app-textSec">
                                <span>رسوم التوصيل</span>
                                <span className="font-medium">{orderData.delivery_cost} د.ك</span>
                            </div>
                            <div className="pt-3 border-t border-app-bg flex justify-between">
                                <span className="text-sm font-bold text-app-text">الإجمالي الكلي</span>
                                <span className="text-lg font-bold text-app-gold">{orderData.total} د.ك</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
                        <h3 className="text-sm font-bold text-app-text mb-4">معلومات التوصيل</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-app-textSec">المحافظة:</span>
                                <span className="font-medium text-app-text">{orderData.governorate?.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-app-textSec">المنطقة:</span>
                                <span className="font-medium text-app-text">{orderData.city?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-app-card/30">
                        <h3 className="text-sm font-bold text-app-text mb-4">معلومات الدفع</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-app-textSec">طريقة الدفع:</span>
                                <span className="font-medium text-app-text">
                                    {orderData.payment_type === 'online' ? 'دفع إلكتروني' :
                                        orderData.payment_type === 'cash' ? 'الدفع عند الاستلام' :
                                            orderData.payment_type}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-app-textSec">حالة الدفع:</span>
                                <span className={`font-bold ${orderData.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {orderData.payment_status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
