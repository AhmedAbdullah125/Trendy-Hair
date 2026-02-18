import React from "react";
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, ChevronDown, CreditCard, Package, Wallet } from "lucide-react";
import { useGetProfile } from "../requests/useGetProfile";
import { useGetGovernorates } from "../requests/useGetGovernorates";
import { useGetCities } from "../requests/useGetCities";

import type { AddressForm } from "./types";

type Props = {
    addressForm: AddressForm;
    onChangeAddress: (patch: Partial<AddressForm>) => void;
    onBack: () => void;

    // Wallet + totals
    gameBalance: number;
    loyaltyPoints: number;

    useGameBalance: boolean;
    setUseGameBalance: (v: boolean) => void;

    useLoyaltyPoints: boolean;
    setUseLoyaltyPoints: (v: boolean) => void;

    maxGameRedemption: number;
    gameAmountToUse: number;
    setGameAmountToUse: (v: number) => void;

    maxLoyaltyRedemptionValue: number;
    finalGameDeduction: number;
    finalLoyaltyDeduction: number;
    finalTotal: number;

    subtotal: number;
    deliveryFee: number;

    paymentMethod: "online" | "cash";
    setPaymentMethod: (v: "online" | "cash") => void;

    isProcessing: boolean;
    onPay: () => void;
};

const DetailsStep: React.FC<Props> = ({
    addressForm,
    onChangeAddress,
    onBack,
    gameBalance,
    loyaltyPoints,
    useGameBalance,
    setUseGameBalance,
    useLoyaltyPoints,
    setUseLoyaltyPoints,
    maxGameRedemption,
    gameAmountToUse,
    setGameAmountToUse,
    maxLoyaltyRedemptionValue,
    finalGameDeduction,
    finalLoyaltyDeduction,
    finalTotal,
    subtotal,
    deliveryFee,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    onPay,
}) => {
    const { data: profileData, isLoading: profileLoading } = useGetProfile('ar');
    const { data: governoratesData, isLoading: governoratesLoading } = useGetGovernorates('ar');
    const { data: citiesData, isLoading: citiesLoading } = useGetCities('ar', addressForm.governorate);

    // Pre-fill name from profile
    React.useEffect(() => {
        if (profileData?.name && !addressForm.name) {
            onChangeAddress({ name: profileData.name });
        }
    }, [profileData, addressForm.name, onChangeAddress]);

    const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeAddress({ governorate: e.target.value, area: "" });
    };
    console.log(addressForm);


    return (
        <div className="flex flex-col h-full animate-fadeIn bg-app-bg">
            <header className="px-6 pt-6 pb-4 bg-white border-b border-app-card/30 flex items-center justify-between">
                <h1 className="text-xl font-bold text-app-text">بيانات الشحن والدفع</h1>
                <button onClick={onBack} className="p-2 hover:bg-app-bg rounded-full text-app-text">
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                {/* Address */}
                <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
                    <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
                        <Package size={18} className="text-app-gold" />
                        تفاصيل العنوان
                    </h2>

                    <div className="space-y-4">
                        <div className="w-full p-4 rounded-2xl border border-app-card bg-app-card/20 text-sm flex flex-col gap-1">
                            <span className="text-[10px] text-app-textSec font-bold">الاسم الكامل</span>
                            <span className="text-app-text font-bold">
                                {profileLoading ? "..." : (profileData?.name || addressForm.name || "ضيف")}
                            </span>
                        </div>

                        <div className="relative">
                            <select
                                className="w-full p-4 pr-10 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm appearance-none"
                                value={addressForm.governorate}
                                onChange={handleGovernorateChange}
                                disabled={governoratesLoading}
                            >
                                <option value="" disabled>
                                    {governoratesLoading ? "جاري التحميل..." : "المحافظة"}
                                </option>
                                {governoratesData?.governorates?.filter(gov => gov.is_active === 1).map((gov) => (
                                    <option key={gov.id} value={gov.id}>
                                        {gov.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec pointer-events-none"
                                size={18}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className={`w-full p-4 pr-10 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm appearance-none ${!addressForm.governorate || citiesLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                value={addressForm.area}
                                onChange={(e) => onChangeAddress({ area: e.target.value })}
                                disabled={!addressForm.governorate || citiesLoading}
                            >
                                <option value="" disabled>
                                    {citiesLoading ? "جاري التحميل..." : "المنطقة"}
                                </option>
                                {citiesData?.cities?.filter(city => city.is_active === 1).map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec pointer-events-none"
                                size={18}
                            />
                        </div>

                        <textarea
                            placeholder="العنوان التفصيلي"
                            className="w-full p-4 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm h-24 resize-none"
                            value={addressForm.details}
                            onChange={(e) => onChangeAddress({ details: e.target.value })}
                        />
                    </div>
                </section>

                {/* Wallets */}
                <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
                    <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-app-gold" />
                        المحفظة والخصومات
                    </h2>

                    {/* Game wallet */}
                    <div className="mb-4 pb-4 border-b border-app-card/20">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className={useGameBalance ? "text-green-500" : "text-gray-300"} />
                                <span className="text-sm font-bold text-app-text">رصيد الجوائز</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-app-text block">{gameBalance.toFixed(3)} د.ك</span>
                                <span className="text-[10px] text-app-textSec">متاح</span>
                            </div>
                        </div>

                        {gameBalance > 0 ? (
                            <div className="bg-app-bg rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-app-textSec flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={useGameBalance}
                                            onChange={(e) => setUseGameBalance(e.target.checked)}
                                            className="rounded text-app-gold focus:ring-app-gold"
                                        />
                                        استخدام الرصيد
                                    </label>
                                    <span className="text-xs font-bold text-app-gold">
                                        الحد الأقصى: {maxGameRedemption.toFixed(3)} د.ك
                                    </span>
                                </div>

                                {useGameBalance && (
                                    <div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxGameRedemption}
                                            step="0.100"
                                            value={gameAmountToUse}
                                            onChange={(e) => setGameAmountToUse(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-app-gold"
                                        />
                                        <div className="text-center mt-1 text-xs font-bold text-app-text">
                                            خصم: {gameAmountToUse.toFixed(3)} د.ك
                                        </div>
                                    </div>
                                )}

                                <p className="text-[10px] text-app-textSec mt-1">
                                    يمكن استخدام رصيد الجوائز لخصم حتى 5 د.ك على كل طلب، مهما كانت قيمة الطلب.
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-app-textSec italic">لا يوجد رصيد متاح</p>
                        )}
                    </div>

                    {/* Loyalty points */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className={useLoyaltyPoints ? "text-green-500" : "text-gray-300"} />
                                <span className="text-sm font-bold text-app-text">نقاط الولاء</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-app-text block">{loyaltyPoints} نقطة</span>
                                <span className="text-[10px] text-app-textSec">
                                    ≈ {maxLoyaltyRedemptionValue.toFixed(3)} د.ك
                                </span>
                            </div>
                        </div>

                        {loyaltyPoints > 0 ? (
                            <div className="bg-app-bg rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <label className="text-xs text-app-textSec flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useLoyaltyPoints}
                                            onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                                            className="rounded text-app-gold focus:ring-app-gold"
                                        />
                                        استبدال الكل
                                    </label>
                                    <p className="text-[10px] text-app-textSec mt-1">يمكن استخدام النقاط بالكامل.</p>
                                </div>

                                {useLoyaltyPoints && (
                                    <span className="text-xs font-bold text-green-600">-{finalLoyaltyDeduction.toFixed(3)} د.ك</span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-app-textSec italic">لا توجد نقاط متاحة</p>
                        )}
                    </div>
                </section>

                {/* Payment */}
                <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
                    <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-app-gold" />
                        طريقة الدفع
                    </h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => setPaymentMethod("online")}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === "online" ? "border-app-gold bg-app-gold/5" : "border-white bg-app-bg"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className={paymentMethod === "online" ? "text-app-gold" : "text-app-textSec"} />
                                <span className={`text-sm font-bold ${paymentMethod === "online" ? "text-app-text" : "text-app-textSec"}`}>
                                    دفع إلكتروني
                                </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "online" ? "border-app-gold bg-app-gold" : "border-app-card"}`} />
                        </button>

                        <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === "cash" ? "border-app-gold bg-app-gold/5" : "border-white bg-app-bg"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Banknote className={paymentMethod === "cash" ? "text-app-gold" : "text-app-textSec"} />
                                <span className={`text-sm font-bold ${paymentMethod === "cash" ? "text-app-text" : "text-app-textSec"}`}>
                                    دفع عند الاستلام
                                </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "cash" ? "border-app-gold bg-app-gold" : "border-app-card"}`} />
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer totals + pay */}
            <div className="p-6 bg-white border-t border-app-card/30">
                <div className="space-y-2 mb-4 text-xs font-medium text-app-textSec">
                    <div className="flex justify-between">
                        <span>قيمة الطلب:</span>
                        <span>{subtotal.toFixed(3)} د.ك</span>
                    </div>
                    <div className="flex justify-between">
                        <span>التوصيل:</span>
                        <span>{deliveryFee.toFixed(3)} د.ك</span>
                    </div>

                    {finalGameDeduction > 0 && (
                        <div className="flex justify-between text-app-gold">
                            <span>خصم رصيد الألعاب:</span>
                            <span>-{finalGameDeduction.toFixed(3)} د.ك</span>
                        </div>
                    )}

                    {finalLoyaltyDeduction > 0 && (
                        <div className="flex justify-between text-app-gold">
                            <span>خصم النقاط:</span>
                            <span>-{finalLoyaltyDeduction.toFixed(3)} د.ك</span>
                        </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-dashed border-app-card/50 text-base font-bold text-app-text">
                        <span>الإجمالي النهائي:</span>
                        <span>{finalTotal.toFixed(3)} د.ك</span>
                    </div>
                </div>

                <button
                    onClick={onPay}
                    disabled={isProcessing}
                    className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "ادفع الآن"
                    )}
                </button>
            </div>
        </div>
    );
};

export default DetailsStep;
