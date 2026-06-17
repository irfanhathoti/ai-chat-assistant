/** Site-wide config sourced from env, with safe fallbacks. */

/**
 * Contact address shown on the Terms and Privacy pages.
 * Set NEXT_PUBLIC_CONTACT_EMAIL in .env.local; falls back to a placeholder so
 * the pages always render a valid address.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com";
