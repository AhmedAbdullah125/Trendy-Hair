/**
 * Filtering for the phone field's country picker.
 *
 * Split out of the component so the matching rules can be tested directly —
 * they are the whole point of the search box and easy to get subtly wrong.
 */

export interface SearchableCountry {
  name: string;
  iso2: string;
  dialCode: string;
}

/**
 * Matches a country by name, ISO code, or dial code.
 *
 * Digits are matched against the dial code with `startsWith`, so "20" finds
 * Egypt (+20) without also dragging in every country whose code merely contains
 * a 2. Someone hunting for a "country code" types the code itself, so that path
 * matters as much as the name.
 *
 * @param countries The full list to filter.
 * @param query     Raw text from the search box.
 * @returns         Every country when the query is blank, matches otherwise.
 */
export const searchCountries = <T extends SearchableCountry>(
  countries: readonly T[],
  query: string
): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [...countries];

  // A leading "+" is natural to type and must not defeat the digit match.
  const digits = q.replace(/[^\d]/g, '');

  return countries.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.iso2.toLowerCase() === q) return true;
    return digits !== '' && c.dialCode.startsWith(digits);
  });
};
