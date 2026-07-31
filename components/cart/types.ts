export type CheckoutStep = "cart" | "details" | "success";

export type AddressForm = {
    name: string;
    governorate: string;
    area: string;
    details: string;
    /**
     * Not currently collected by `DetailsStep`, but read when building the order
     * payload — so it can legitimately be absent.
     */
    phone?: string;
};
