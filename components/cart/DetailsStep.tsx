import React from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Banknote, CheckCircle2, ChevronDown, CreditCard, Package, RotateCcw, Wallet } from "lucide-react";
import { useGetProfile } from "../requests/useGetProfile";
import { useGetGovernorates } from "../requests/useGetGovernorates";
import { useGetCities } from "../requests/useGetCities";

import { dinarsToPoints, formatDinars, formatPoints, readWallet } from "../../lib/points";
import {
    MAX_ADDRESS_DETAILS_LENGTH,
    MIN_ADDRESS_DETAILS_LENGTH,
    type AddressForm,
} from "./types";

type Props = {
    addressForm: AddressForm;
    onChangeAddress: (patch: Partial<AddressForm>) => void;
    onBack: () => void;

    // Wallet + totals
    useGameBalance: boolean;
    setUseGameBalance: (v: boolean) => void;

    maxGameRedemption: number;
    gameAmountToUse: number;
    setGameAmountToUse: (v: number) => void;

    finalGameDeduction: number;
    finalTotal: number;

    subtotal: number;
    deliveryFee: number;

    paymentMethod: "cash" | "visa" | "knet";
    setPaymentMethod: (v: "cash" | "visa" | "knet") => void;

    isProcessing: boolean;
    onPay: () => void;

    /** Why the last attempt failed, or null. `canRetry` is false when the order was created. */
    orderError?: { message: string; canRetry: boolean } | null;
    onRetry?: () => void;
};

const DetailsStep: React.FC<Props> = ({
    addressForm,
    onChangeAddress,
    onBack,
    useGameBalance,
    setUseGameBalance,
    maxGameRedemption,
    gameAmountToUse,
    setGameAmountToUse,
    finalGameDeduction,
    finalTotal,
    subtotal,
    deliveryFee,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    onPay,
    orderError = null,
    onRetry,
}) => {
    const { data: profileData, isLoading: profileLoading } = useGetProfile('ar');
    const { data: governoratesData, isLoading: governoratesLoading } = useGetGovernorates('ar');
    const { data: citiesData, isLoading: citiesLoading } = useGetCities('ar', addressForm.governorate);

    // The wallet holds points, and only part of it may be spendable — money
    // promised to unpaid orders is reserved. `canRedeem` also folds in the
    // dashboard's minimum, which the client cannot work out on its own.
    const wallet = readWallet(profileData);

    // Pre-fill name from profile
    React.useEffect(() => {
        if (profileData?.name && !addressForm.name) {
            onChangeAddress({ name: profileData.name });
        }
    }, [profileData, addressForm.name, onChangeAddress]);

    const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeAddress({ governorate: e.target.value, area: "" });
    };
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

                        <div>
                            <textarea
                                placeholder="العنوان التفصيلي"
                                className="w-full p-4 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm h-24 resize-none"
                                value={addressForm.details}
                                minLength={MIN_ADDRESS_DETAILS_LENGTH}
                                maxLength={MAX_ADDRESS_DETAILS_LENGTH}
                                onChange={(e) => onChangeAddress({ details: e.target.value })}
                                aria-describedby="address-details-hint"
                            />
                            <div id="address-details-hint" className="mt-1 flex items-center justify-between gap-2 px-1 text-[10px] text-app-textSec">
                                <span>اكتبي الشارع ورقم المبنى، {MIN_ADDRESS_DETAILS_LENGTH} أحرف على الأقل.</span>
                                <span className="shrink-0 tabular-nums" dir="ltr">
                                    {addressForm.details.trim().length}/{MAX_ADDRESS_DETAILS_LENGTH}
                                </span>
                            </div>
                        </div>
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
                                <span className="text-xs font-bold text-app-text block">{formatPoints(wallet.points)}</span>
                                <span className="text-[10px] text-app-textSec">
                                    ({formatDinars(wallet.dinars)})
                                </span>
                            </div>
                        </div>

                        {wallet.canRedeem ? (
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
                                            // One point, not a fixed 0.100 — at 100 points/د.ك a
                                            // 0.15 balance would otherwise only offer 0 or 0.10.
                                            step={1 / wallet.rate}
                                            value={gameAmountToUse}
                                            onChange={(e) => setGameAmountToUse(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-app-gold"
                                        />
                                        <div className="text-center mt-1 text-xs font-bold text-app-text">
                                            خصم: {gameAmountToUse.toFixed(3)} د.ك
                                            <span className="text-app-textSec font-normal">
                                                {' '}({dinarsToPoints(gameAmountToUse, wallet.rate)} نقطة)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[10px] text-app-textSec mt-1">
                                    كل {wallet.rate} نقطة تساوي 1 د.ك، ويمكن خصم حتى {maxGameRedemption.toFixed(3)} د.ك على هذا الطلب.
                                </p>
                            </div>
                        ) : wallet.fullyReserved ? (
                            // A positive balance with nothing spendable is not "no
                            // balance" — the points are held by an unpaid order.
                            <p className="text-xs text-app-textSec italic">
                                رصيدك محجوز حالياً لطلب قيد الانتظار، ويمكن استخدامه بعد استلامه أو إلغائه.
                            </p>
                        ) : (
                            <p className="text-xs text-app-textSec italic">لا يوجد رصيد كافٍ للاستخدام</p>
                        )}
                    </div>

                    {/*
                      A "loyalty points" block sat here, commented out. It has
                      been removed rather than left dormant: there is no loyalty
                      balance on the server and the deduction was never sent
                      with the order, so re-enabling it would have shown the
                      customer a discount they would then be charged for.
                    */}
                </section>

                {/* Payment */}
                <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
                    <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-app-gold" />
                        طريقة الدفع
                    </h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => setPaymentMethod("visa")}
                            disabled={isProcessing}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                paymentMethod === "visa" ? "border-app-gold bg-app-gold/5" : "border-white bg-app-bg"
                                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className={paymentMethod === "visa" ? "text-app-gold" : "text-app-textSec"} />
                                <span className={`text-sm font-bold ${paymentMethod === "visa" ? "text-app-text" : "text-app-textSec"}`}>
                                    فيزا / بطاقة ائتمانية
                                </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "visa" ? "border-app-gold bg-app-gold" : "border-app-card"}`} />
                        </button>

                        <button
                            onClick={() => setPaymentMethod("knet")}
                            disabled={isProcessing}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                paymentMethod === "knet" ? "border-app-gold bg-app-gold/5" : "border-white bg-app-bg"
                                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet className={paymentMethod === "knet" ? "text-app-gold" : "text-app-textSec"} />
                                <span className={`text-sm font-bold ${paymentMethod === "knet" ? "text-app-text" : "text-app-textSec"}`}>
                                    كي-نت
                                </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "knet" ? "border-app-gold bg-app-gold" : "border-app-card"}`} />
                        </button>

                        <button
                            onClick={() => setPaymentMethod("cash")}
                            disabled={isProcessing}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                paymentMethod === "cash" ? "border-app-gold bg-app-gold/5" : "border-white bg-app-bg"
                                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
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

                    <div className="flex justify-between pt-2 border-t border-dashed border-app-card/50 text-base font-bold text-app-text">
                        <span>الإجمالي النهائي:</span>
                        <span>{finalTotal.toFixed(3)} د.ك</span>
                    </div>
                </div>

                {/*
                  * A failed checkout used to be a toast and nothing more, so by
                  * the time anyone looked the screen was indistinguishable from
                  * one where they had simply not pressed pay yet. This keeps the
                  * reason on screen with the retry next to it.
                  */}
                {orderError && !isProcessing && (
                    <div
                        role="alert"
                        className="mb-3 p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-3"
                    >
                        <div className="flex items-start gap-2">
                            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-red-600 leading-relaxed">
                                {orderError.message}
                            </p>
                        </div>

                        {orderError.canRetry && onRetry && (
                            <button
                                onClick={onRetry}
                                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                إعادة محاولة الطلب
                            </button>
                        )}
                    </div>
                )}

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
