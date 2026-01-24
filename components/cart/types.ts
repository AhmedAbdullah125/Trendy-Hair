export type CheckoutStep = "cart" | "details" | "success";

export type AddressForm = {
    name: string;
    governorate: string;
    area: string;
    details: string;
};
