/**
 * Property search service — placeholder for future MLS/Zillow API integration.
 * 
 * Currently returns empty results. To enable real property search:
 * 1. Sign up for RapidAPI Zillow API ($0.006/request)
 * 2. Set ZILLOW_API_KEY in env
 * 3. Uncomment the API call below
 */

export type PropertyListing = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  status: string;
  imageUrl?: string;
  listingUrl?: string;
};

export type MarketStats = {
  area: string;
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  priceChangeYoY: number;
};

export type PropertySearchParams = {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  limit?: number;
};

/**
 * Search properties — currently returns empty (falls back to AI knowledge).
 * 
 * TODO: Integrate with RapidAPI Zillow or Realty-in-US API:
 * ```
 * const response = await fetch("https://zillow-com1.p.rapidapi.com/propertyExtendedSearch", {
 *   headers: {
 *     "X-RapidAPI-Key": process.env.ZILLOW_API_KEY,
 *     "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
 *   },
 * });
 * ```
 */
export async function searchProperties(
  params: PropertySearchParams
): Promise<PropertyListing[]> {
  console.log(`[PropertyService] Search requested for ${params.city || "unknown"} — API not configured, using AI knowledge`);
  return [];
}

/**
 * Get market statistics for an area — placeholder.
 */
export async function getMarketStats(
  city: string,
  _state: string = "CA"
): Promise<MarketStats | null> {
  console.log(`[PropertyService] Market stats requested for ${city} — API not configured`);
  return null;
}

/**
 * Format property listings into a readable string for AI context.
 */
export function formatListingsForAI(listings: PropertyListing[]): string {
  if (listings.length === 0) return "No live property data available. Use your neighborhood knowledge to answer.";

  return listings
    .map(
      (p, i) =>
        `${i + 1}. **${p.address}**, ${p.city}, ${p.state} ${p.zipCode}\n` +
        `   💰 $${p.price.toLocaleString()} | 🛏 ${p.bedrooms} bed | 🛁 ${p.bathrooms} bath | 📐 ${p.sqft.toLocaleString()} sqft\n` +
        `   Type: ${p.type} | Status: ${p.status}`
    )
    .join("\n\n");
}
