import React, { useEffect, useMemo, useState } from "react";
import type { CartItem, Order } from "../../App";
import { LOYALTY_POINT_VALUE_KD, GAME_REDEMPTION_CAP_KD } from "../../constants";
import { useDeleteCartItem } from "../requests/useDeleteCartItem";
import { useGetCities } from "../requests/useGetCities";
import CartStep from "./CartStep";
import DetailsStep from "./DetailsStep";
import SuccessStep from "./SuccessStep";
import type { AddressForm, CheckoutStep } from "./types";
import { createOrder } from "../requests/useCreateOrder";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CartFlowProps {
    cartItems: CartItem[];
    onClose: () => void;

    onUpdateQuantity: (productId: number, delta: number) => void;

    onRemoveItem: (productId: number) => void;
    onClearCart: () => void;

    onAddOrder: (order: Order, paidAmountKD: number) => void;
    onViewOrderDetails: (orderId: string) => void;

    gameBalance: number;
    loyaltyPoints: number;
    onDeductWallets: (gameAmount: number, pointsAmount: number) => void;

    lang?: string;
}

const CartFlow: React.FC<CartFlowProps> = ({
    cartItems,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onAddOrder,
    onViewOrderDetails,
    gameBalance,
    loyaltyPoints,
    onDeductWallets,
    lang = "ar",
}) => {
    const [step, setStep] = useState<CheckoutStep>("cart");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");

    // Wallet Usage State
    const [useGameBalance, setUseGameBalance] = useState(false);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [gameAmountToUse, setGameAmountToUse] = useState<number>(0);

    const [addressForm, setAddressForm] = useState<AddressForm>({
        name: "nader",
        governorate: "",
        area: "",
        details: "",
    });

    const [lastOrderId, setLastOrderId] = useState("");

    const delMut = useDeleteCartItem();

    // Fetch cities data to get delivery costs
    const { data: citiesData } = useGetCities(lang, addressForm.governorate);

    // ✅ subtotal
    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const raw = (item.product as any)?.price;
            const price =
                typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(/[^\d.]/g, "")) || 0;
            return sum + price * item.quantity;
        }, 0);
    }, [cartItems]);

    // ✅ Dynamic delivery fee based on selected city
    const deliveryFee = useMemo(() => {
        if (!addressForm.area || !citiesData?.cities) {
            return 2.0; // Default fallback
        }

        const selectedCity = citiesData.cities.find(
            (city) => String(city.id) === String(addressForm.area)
        );

        if (selectedCity?.delivery_cost) {
            return parseFloat(selectedCity.delivery_cost);
        }

        return 2.0; // Fallback if city not found
    }, [addressForm.area, citiesData]);

    const maxGameRedemption = useMemo(() => Math.min(gameBalance, GAME_REDEMPTION_CAP_KD), [gameBalance]);

    const maxLoyaltyRedemptionValue = useMemo(() => {
        const pointsValue = loyaltyPoints * LOYALTY_POINT_VALUE_KD;
        return Math.min(pointsValue, subtotal + deliveryFee);
    }, [loyaltyPoints, subtotal, deliveryFee]);

    const { finalGameDeduction, finalLoyaltyDeduction, finalTotal } = useMemo(() => {
        let toPay = subtotal + deliveryFee;
        let gameDeduction = 0;
        let loyaltyDeduction = 0;

        if (useGameBalance) {
            gameDeduction = Math.min(gameAmountToUse, maxGameRedemption, toPay);
            toPay -= gameDeduction;
        }

        if (useLoyaltyPoints) {
            const available = loyaltyPoints * LOYALTY_POINT_VALUE_KD;
            loyaltyDeduction = Math.min(toPay, available);
            toPay -= loyaltyDeduction;
        }

        return {
            finalGameDeduction: parseFloat(gameDeduction.toFixed(3)),
            finalLoyaltyDeduction: parseFloat(loyaltyDeduction.toFixed(3)),
            finalTotal: parseFloat(toPay.toFixed(3)),
        };
    }, [subtotal, deliveryFee, useGameBalance, gameAmountToUse, maxGameRedemption, useLoyaltyPoints, loyaltyPoints]);

    useEffect(() => {
        if (step === "details") {
            setUseGameBalance(false);
            setUseLoyaltyPoints(false);
            setGameAmountToUse(maxGameRedemption);
        }
    }, [step, maxGameRedemption]);

    const onChangeAddress = (patch: Partial<AddressForm>) => {
        setAddressForm((prev) => ({ ...prev, ...patch }));
    };

    const handleDeleteItem = (item: CartItem) => {
        if (delMut.isPending) return;

        const cartItemId = item.id;
        if (!cartItemId) {
            onRemoveItem(item.product.id);
            return;
        }

        delMut.mutate(
            { cartItemId, lang },
            {
                onSuccess: () => {
                    onRemoveItem?.(item.product.id);
                },
            }
        );
    };

    const handleClearAll = () => {
        if (delMut.isPending) return;

        const firstId = cartItems?.[0]?.id;
        if (!firstId) {
            onClearCart?.();
            return;
        }

        delMut.mutate(
            { cartItemId: firstId, clear_all: true, lang },
            {
                onSuccess: () => {
                    onClearCart?.();
                },
            }
        );
    };
    const navigate = useNavigate();
    const handlePay = () => {
        if (!addressForm.governorate || !addressForm.area || !addressForm.details) {
            toast.error("يرجى إكمال جميع بيانات العنوان");
            return;
        }

        // setIsProcessing(true);

        // setTimeout(() => {
        //     const orderId = `TH-${Math.floor(100000 + Math.random() * 900000)}`;
        //     const newOrder: Order = {
        //         id: orderId,
        //         date: new Date().toLocaleDateString("en-GB"),
        //         status: "قيد المعالجة",
        //         total: `${finalTotal.toFixed(3)} د.ك`,
        //         items: [...cartItems],
        //     };

        //     const pointsToDeduct = useLoyaltyPoints
        //         ? Math.ceil(finalLoyaltyDeduction / LOYALTY_POINT_VALUE_KD)
        //         : 0;

        //     onDeductWallets(finalGameDeduction, pointsToDeduct);

        //     setLastOrderId(orderId);
        //     onAddOrder(newOrder, finalTotal);

        //     setIsProcessing(false);
        //     onClearCart?.();
        //     setStep("success");
        // }, 2000);

        const formData = new FormData();
        formData.append("use_wallet", "0");
        formData.append("governorate_id", addressForm.governorate);
        formData.append("city_id", addressForm.area);
        formData.append("address", addressForm.details);
        formData.append("phone", addressForm.phone);
        formData.append("payment_type", paymentMethod);
        formData.append("notes", "");
        createOrder(formData, lang, setStep, setIsProcessing);
    };

    if (step === "details") {
        return (
            <DetailsStep
                addressForm={addressForm}
                onChangeAddress={onChangeAddress}
                onBack={() => setStep("cart")}
                gameBalance={gameBalance}
                loyaltyPoints={loyaltyPoints}
                useGameBalance={useGameBalance}
                setUseGameBalance={setUseGameBalance}
                useLoyaltyPoints={useLoyaltyPoints}
                setUseLoyaltyPoints={setUseLoyaltyPoints}
                maxGameRedemption={maxGameRedemption}
                gameAmountToUse={gameAmountToUse}
                setGameAmountToUse={setGameAmountToUse}
                maxLoyaltyRedemptionValue={maxLoyaltyRedemptionValue}
                finalGameDeduction={finalGameDeduction}
                finalLoyaltyDeduction={finalLoyaltyDeduction}
                finalTotal={finalTotal}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isProcessing={isProcessing}
                onPay={handlePay}
            />
        );
    }

    if (step === "success") {
        return (
            <SuccessStep
                lastOrderId={lastOrderId}
                onClose={onClose}
                onViewOrderDetails={onViewOrderDetails}
            />
        );
    }

    return (
        <CartStep
            cartItems={cartItems}
            isDeleting={delMut.isPending}
            subtotal={subtotal}
            onClose={onClose}
            onGoDetails={() => setStep("details")}
            onUpdateQuantity={onUpdateQuantity}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
        />
    );
};

export default CartFlow;
