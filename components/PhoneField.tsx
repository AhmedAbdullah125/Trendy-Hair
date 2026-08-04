import React from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { DEFAULT_COUNTRY } from '../lib/phone';

interface PhoneFieldProps {
  value: string;
  /** Receives the E.164 value (`+96512345678`) and the selected country's dial code. */
  onChange: (phone: string, dialCode: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

/**
 * The app's phone input: country selector + dial code, prefilled so the user
 * never types the `+` or the country code by hand.
 *
 * Wraps the same `react-international-phone` control the profile screen already
 * uses, with the styling lifted from there so the two screens match. Callers get
 * the dial code alongside the value because validating the *national* part means
 * discounting the prefix the control always keeps in the field.
 */
const PhoneField: React.FC<PhoneFieldProps> = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = 'رقم الهاتف',
}) => (
  // The app renders RTL; the number itself always reads left-to-right.
  <div className="relative phone-input-wrapper" dir="ltr">
    <PhoneInput
      defaultCountry={DEFAULT_COUNTRY}
      value={value}
      onChange={(phone, meta) => onChange(phone, meta.country.dialCode)}
      disabled={disabled}
      inputProps={{ placeholder }}
      inputClassName={`!w-full !p-4 !bg-app-bg !border !rounded-2xl !outline-none !focus:border-app-gold !text-left !pl-[60px] !text-app-text !font-medium !h-auto ${
        hasError ? '!border-red-500' : '!border-app-card'
      }`}
      countrySelectorStyleProps={{
        buttonClassName:
          '!border-none !bg-transparent !absolute !left-0 !top-1/2 !-translate-y-1/2 !z-10 !h-full !flex !items-center !justify-center !px-3',
        flagClassName: '!m-0 w-12 shrink-0 me-2 ms-2',
      }}
      className="w-full"
    />
  </div>
);

export default PhoneField;
