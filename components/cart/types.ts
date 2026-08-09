export type CheckoutStep = "cart" | "details" | "success";

/** Matches the backend's deliverable-address minimum. */
export const MIN_ADDRESS_DETAILS_LENGTH = 10;
/** Leaves room for the `العنوان: ` prefix stored in the order notes field. */
export const MAX_ADDRESS_DETAILS_LENGTH = 490;

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
