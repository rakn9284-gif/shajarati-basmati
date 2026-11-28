/** Shared QR/deep-link helpers so physical signs and the in-app scanner agree. */

export const DEFAULT_SITE_URL = "https://shajarati-basmati.vercel.app";

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin =
    configured ||
    (typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL);
  return origin.replace(/\/+$/, "");
}

/** Full HTTPS URL encoded in every printable campaign/tree QR code. */
export function qrDeepLink(code: string) {
  return `${siteOrigin()}/scan?code=${encodeURIComponent(code.trim())}`;
}

/**
 * Extracts a code from legacy plain text or any QR URL using
 * `?code=`, `?id=` or the older `?campaign=` parameter.
 */
export function qrCodeFromValue(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed, siteOrigin());
    const code =
      url.searchParams.get("code") ||
      url.searchParams.get("id") ||
      url.searchParams.get("campaign");
    if (code?.trim()) return code.trim();
  } catch {
    // Not a URL — treat the scanned value as a plain code.
  }

  return trimmed;
}
