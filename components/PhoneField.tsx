import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { FlagImage, PhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import 'react-international-phone/style.css';
import { DEFAULT_COUNTRY } from '../lib/phone';
import { searchCountries } from '../lib/countrySearch';

interface PhoneFieldProps {
  value: string;
  /** Receives the E.164 value (`+96512345678`) and the selected country's dial code. */
  onChange: (phone: string, dialCode: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
  /**
   * Input background, so the field matches the ones around it.
   *
   * The auth card sits on white and uses `app-bg` inputs; the account form is
   * the other way round. Without this the phone field would be the one input on
   * the account screen with a different fill.
   */
  surface?: 'app' | 'white';
}

/**
 * The app's phone input: country selector + dial code, prefilled so the user
 * never types the `+` or the country code by hand.
 *
 * The country selector is ours rather than the library's. `react-international-phone`
 * renders an unfiltered list of ~240 countries, so reaching anything below the
 * first screenful meant scrolling blind — the reason a search box was asked for.
 * The library exposes its country data (`defaultCountries` / `parseCountry`) and
 * its flag sprite (`FlagImage`), so this reuses both and only replaces the list.
 *
 * `PhoneInput` keeps handling typing, formatting and dial-code prefixing; its own
 * dropdown is hidden. Picking a country remounts it via `key` so it adopts the new
 * `defaultCountry` — the library has no controlled `country` prop, and remounting
 * is deterministic rather than relying on it re-guessing from a changed value.
 */

/** Parsed once — the list is static and 240-odd entries long. */
const COUNTRIES = defaultCountries.map(parseCountry);

const PhoneField: React.FC<PhoneFieldProps> = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = 'رقم الهاتف',
  surface = 'app',
}) => {
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  /**
   * Bumped only when a country is chosen from the picker, and used as the
   * input's `key`.
   *
   * The remount has to be tied to *picking*, not to `country` itself. The flag
   * also follows what is typed, so keying on `country` meant that pasting or
   * typing a number from another country remounted the input mid-edit and threw
   * away focus and caret position.
   */
  const [pickCount, setPickCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === country) ?? COUNTRIES[0],
    [country]
  );

  const results = useMemo(() => searchCountries(COUNTRIES, query), [query]);

  // Close on an outside click or Escape — a dropdown that can only be dismissed
  // by picking something traps anyone who opened it by accident.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Fresh search each time it opens, with the cursor already in the box.
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const handleSelect = (iso2: string, dialCode: string) => {
    setCountry(iso2);
    setPickCount((n) => n + 1);
    setIsOpen(false);
    // Reset to the bare dial code: the previous national number belongs to the
    // country being switched away from.
    onChange(`+${dialCode}`, dialCode);
  };

  return (
    // The app renders RTL; the number itself always reads left-to-right.
    <div className="relative phone-input-wrapper" dir="ltr" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="اختر كود الدولة"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-full flex items-center gap-1 px-3 disabled:opacity-50"
      >
        <FlagImage iso2={selected.iso2} className="w-6 h-auto" />
        <ChevronDown size={14} className="text-app-textSec" />
      </button>

      <PhoneInput
        // Remounts only on an explicit pick, so the new defaultCountry takes
        // effect without disturbing anyone mid-type. See `pickCount`.
        key={pickCount}
        defaultCountry={selected.iso2}
        value={value}
        onChange={(phone, meta) => {
          // Typing a different dial code by hand still moves the flag.
          if (meta.country.iso2 !== country) setCountry(meta.country.iso2);
          onChange(phone, meta.country.dialCode);
        }}
        disabled={disabled}
        hideDropdown
        inputProps={{ placeholder }}
        inputClassName={`!w-full !p-4 ${
          surface === 'white' ? '!bg-white' : '!bg-app-bg'
        } !border !rounded-2xl !outline-none !focus:border-app-gold !text-left !pl-[76px] !text-app-text !font-medium !h-auto ${
          hasError ? '!border-red-500' : '!border-app-card'
        }`}
        countrySelectorStyleProps={{
          buttonClassName: '!hidden',
        }}
        className="w-full"
      />

      {isOpen && (
        <div
          className="absolute z-30 mt-2 w-full max-w-[320px] bg-white border border-app-card rounded-2xl shadow-xl overflow-hidden"
          role="listbox"
        >
          <div className="relative border-b border-app-card/60">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-textSec" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالدولة أو الكود"
              className="w-full py-3 pl-9 pr-9 outline-none text-sm text-app-text"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
                aria-label="مسح البحث"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-app-textSec hover:text-app-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-app-textSec">لا توجد نتائج</p>
            ) : (
              results.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  role="option"
                  aria-selected={c.iso2 === selected.iso2}
                  onClick={() => handleSelect(c.iso2, c.dialCode)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-app-bg transition-colors ${
                    c.iso2 === selected.iso2 ? 'bg-app-gold/10' : ''
                  }`}
                >
                  <FlagImage iso2={c.iso2} className="w-6 h-auto shrink-0" />
                  <span className="flex-1 text-sm text-app-text truncate">{c.name}</span>
                  <span className="text-sm text-app-textSec">+{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneField;
