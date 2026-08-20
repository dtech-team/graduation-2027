export interface InviteData {
  guestName: string;
  pronoun?: string;
  relationship?: string;
  message?: string;
}

/**
 * Encodes invite data to a safe URL Base64 string supporting Unicode (Vietnamese)
 */
export function encodeInviteData(data: InviteData): string {
  try {
    const json = JSON.stringify({
      g: data.guestName || "",
      p: data.pronoun || "",
      r: data.relationship || "",
      m: data.message || "",
    });
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error("Encode error:", e);
    return "";
  }
}

/**
 * Decodes invite data from a safe URL Base64 string
 */
export function decodeInviteData(encodedStr: string): InviteData | null {
  try {
    const decoded = decodeURIComponent(atob(encodedStr));
    const parsed = JSON.parse(decoded);
    return {
      guestName: parsed.g || parsed.guestName || "",
      pronoun: parsed.p || parsed.pronoun || "",
      relationship: parsed.r || parsed.relationship || "",
      message: parsed.m || parsed.message || "",
    };
  } catch (e) {
    console.error("Decode error:", e);
    return null;
  }
}

/**
 * Generates the full shareable URL with embedded data
 */
export function generateShareUrl(data: InviteData): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeInviteData(data);
  const origin = window.location.origin;
  return `${origin}/preview?i=${encoded}`;
}
