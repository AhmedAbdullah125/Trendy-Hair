import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CartItem, Order } from "../../App";
import { useDeleteCartItem } from "../requests/useDeleteCartItem";
import { useGetCities } from "../requests/useGetCities";
import CartStep from "./CartStep";
import DetailsStep from "./DetailsStep";
import SuccessStep from "./SuccessStep";
import type { AddressForm, CheckoutStep } from "./types";
import { createOrder } from "../requests/useCreateOrder";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGetProfile } from "../requests/useGetProfile";
import { readWallet } from "../../lib/points";

interface CartFlowProps {
    cartItems: CartItem[];
    onClose: () => void;

    /**
     * Accepted for call-site compatibility but intentionally unused: quantities are
     * updated through the cart API (`useAddToCart`/`useDeleteCartItem`).
     */
    onUpdateQuantity?: (productId: number, delta: number) => void;

    onRemoveItem: (productId: number) => void;
    onClearCart: () => void;

    onAddOrder: (order: Order, paidAmountKD: number) => void;
    onViewOrderDetails: (orderId: string) => void;

    lang?: string;
}

const CartFlow: React.FC<CartFlowProps> = ({
    cartItems,
    onClose,
    onRemoveItem,
    onClearCart,
    onAddOrder,
    onViewOrderDetails,
    lang = "ar",
}) => {
    // Derive game balance from profile API (stays in sync after reward claims)
    const { data: profileData } = useGetProfile('ar');
    // Points, not dinars — and only the spendable slice is offerable, since
    // unpaid orders reserve the rest server-side.
    const wallet = readWallet(profileData);
    const [step, setStep] = useState<CheckoutStep>("cart");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "visa" | "knet">("visa");
    // Wallet Usage State
    const [useGameBalance, setUseGameBalance] = useState(false);
    const [gameAmountToUse, setGameAmountToUse] = useState<number>(0);

    const [addressForm, setAddressForm] = useState<AddressForm>({
        // Was hardcoded to a developer's name, which also blocked the
        // profile-name prefill in DetailsStep (`!addressForm.name` was never true).
        name: "",
        governorate: "",
        area: "",
        details: "",
    });

    const [lastOrderId, setLastOrderId] = useState("");

    // What the server actually applied, which can be less than the slider
    // offered: pending orders reserve part of the balance, and only the server
    // knows about that. Null until an order comes back.
    const [appliedWallet, setAppliedWallet] = useState<number | null>(null);

    const qc = useQueryClient();
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

    // `wallet_spendable` is the server's own figure: dinars, already net of the
    // points reserved by unpaid orders. It is the whole limit — the old
    // `GAME_REDEMPTION_CAP_KD` compared a dinar cap against a points balance,
    // and any real per-order cap lives in `rewards.max_wallet_redemption_per_order`
    // server-side, which is not exposed to clients.
    const maxGameRedemption = wallet.spendableDinars;

    // Loyalty points were removed: there is no loyalty balance on the server
    // and the deduction was never sent with the order, so the screen showed a
    // discount the customer was then charged for. The wallet below is real.
    const { finalGameDeduction, finalTotal } = useMemo(() => {
        let toPay = subtotal + deliveryFee;
        let gameDeduction = 0;

        if (useGameBalance) {
            gameDeduction = Math.min(gameAmountToUse, maxGameRedemption, toPay);
            toPay -= gameDeduction;
        }

        return {
            finalGameDeduction: parseFloat(gameDeduction.toFixed(3)),
            finalTotal: parseFloat(toPay.toFixed(3)),
        };
    }, [subtotal, deliveryFee, useGameBalance, gameAmountToUse, maxGameRedemption]);

    useEffect(() => {
        if (step === "details") {
            setUseGameBalance(false);
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
    const handlePay = async () => {
        if (!addressForm.governorate || !addressForm.area || !addressForm.details) {
            toast.error("يرجى إكمال جميع بيانات العنوان");
            return;
        }

        const formData = new FormData();
        formData.append("use_wallet", useGameBalance ? "1" : "0");
        formData.append("wallet_amount", useGameBalance ? finalGameDeduction.toFixed(3) : "0");
        formData.append("governorate_id", addressForm.governorate);
        formData.append("city_id", addressForm.area);
        formData.append("payment_type", paymentMethod);

        // The `address` field was being dropped on the floor: `orders` has no
        // address column, `StoreOrderRequest` does not validate one, and
        // `OrderEloquent::store()` never reads it — so the street details the
        // customer is *required* to enter never reached anyone who could
        // deliver the order. `notes` is the only free-text field that is
        // actually persisted, so the address rides there until the backend
        // grows a structured address (see BACKEND_INTEGRATION_REQUESTS.md).
        //
        // Deliberately a stop-gap, not the destination: `notes` is capped at
        // 500 chars and is not queryable or exportable as an address.
        const addressLine = addressForm.details?.trim();
        const notes = addressLine ? `العنوان: ${addressLine}` : "";
        formData.append("notes", notes.slice(0, 500));

        try {
            const result = await createOrder(formData, lang, setStep, setIsProcessing, qc, paymentMethod);
            const items = result?.items;

            if (items?.order_number) setLastOrderId(items.order_number);

            // The response now reports the credit actually applied, so there is
            // no need to infer it by subtracting the total from a local subtotal.
            const applied = Number(items?.wallet_amount);
            if (Number.isFinite(applied)) {
                setAppliedWallet(applied);
            } else {
                setAppliedWallet(null);
            }
        } catch {
            // createOrder already surfaced the failure to the user.
            setAppliedWallet(null);
        }
    };

    if (step === "details") {
        return (
            <DetailsStep
                addressForm={addressForm}
                onChangeAddress={onChangeAddress}
                onBack={() => setStep("cart")}
                useGameBalance={useGameBalance}
                setUseGameBalance={setUseGameBalance}
                maxGameRedemption={maxGameRedemption}
                gameAmountToUse={gameAmountToUse}
                setGameAmountToUse={setGameAmountToUse}
                finalGameDeduction={finalGameDeduction}
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
                walletAmount={appliedWallet ?? (useGameBalance ? finalGameDeduction : 0)}
                requestedWalletAmount={useGameBalance ? finalGameDeduction : 0}
            />
        );
    }

    return (
        <CartStep
            cartItems={cartItems}
            subtotal={subtotal}
            lang={lang}
            onClose={onClose}
            onGoDetails={() => setStep("details")}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
        />
    );
};

export default CartFlow;
