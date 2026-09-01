/**
 * BuyWise AI — Cuelinks Sub-Affiliate Integration Readiness Layer
 * 
 * ==============================================================================
 * ARCHITECTURAL & COMPLIANCE SPECIFICATIONS:
 * ==============================================================================
 * 1. SERVER-SIDE AUTHENTICATION (API V3):
 *    - Cuelinks API V3 requires server-to-server token-based authentication (API Key / Authorization headers).
 *    - The API key MUST NEVER be exposed to client-side bundles (no NEXT_PUBLIC_ prefix).
 *    - All API calls (campaign status, link redirection, merchant queries) run exclusively in Node.js server runtime.
 * 
 * 2. FLIPKART CAMPAIGN APPROVAL STATUS:
 *    - Flipkart affiliate campaign application via Cuelinks is currently PENDING review/approval.
 *    - Production affiliate links for Flipkart or other merchants must NOT be generated or deployed
 *      until explicit merchant campaign approval is confirmed active.
 * 
 * 3. NO FAKE OFFERS / VERIFIED OFFERS ONLY:
 *    - "BUY NOW" CTAs must ONLY appear for verified live offers from legitimate retailer feeds/APIs.
 *    - Never generate synthetic prices, mock retailer offers, or unverified merchant links.
 *    - When credentials or campaign approvals are missing, the system fails safely and gracefully
 *      without interrupting the user shopping comparison experience.
 * ==============================================================================
 */

export interface CuelinksPublicStatus {
  /** Indicates whether valid Cuelinks credentials exist on the server */
  isConfigured: boolean;
  /** Integration status indicator */
  status: "configured_pending_campaign" | "unconfigured" | "ready";
  /** API version targeted */
  apiVersion: "v3";
  /** Flag showing if Flipkart campaign approval is still pending */
  isFlipkartCampaignPending: boolean;
  /** Timestamp when readiness status was queried (ISO string) */
  checkedAt: string;
}

/**
 * Safely checks if the Cuelinks API key is configured in the server environment.
 * Never throws an error if the environment variable is missing or empty.
 */
export function isCuelinksConfigured(): boolean {
  if (typeof process === "undefined" || !process.env) {
    return false;
  }
  const key = process.env.CUELINKS_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

/**
 * Returns a safe, sanitized status object for Cuelinks integration readiness.
 * STRICTLY OMITS the API key and any server credentials to prevent client leakage.
 */
export function getCuelinksStatus(): CuelinksPublicStatus {
  const configured = isCuelinksConfigured();

  return {
    isConfigured: configured,
    status: configured ? "configured_pending_campaign" : "unconfigured",
    apiVersion: "v3",
    isFlipkartCampaignPending: true, // Flipkart merchant campaign is pending approval
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Internal Server-Only Key Accessor.
 * This function must ONLY be used in server-side API routes / background sync services.
 * Returns null if unconfigured or running in client-like environment.
 */
export function getCuelinksApiKeyServerOnly(): string | null {
  if (typeof window !== "undefined") {
    // Client runtime protection: never return server secrets
    console.error("[BuyWise Security Alert] Attempted to access CUELINKS_API_KEY from client context.");
    return null;
  }
  const key = process.env.CUELINKS_API_KEY;
  if (typeof key === "string" && key.trim().length > 0) {
    return key.trim();
  }
  return null;
}
