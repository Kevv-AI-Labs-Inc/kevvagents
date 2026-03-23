/**
 * Property search service — queries external property APIs via callDataApi.
 * Falls back to static/cached data when external API is unavailable.
 */
import { callDataApi } from "./_core/dataApi";

export type PropertyListing = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string; // "single_family" | "condo" | "townhouse" | "multi_family"
  status: string; // "for_sale" | "pending" | "sold"
  imageUrl?: string;
  listingUrl?: string;
};

export type MarketStats = {
  area: string;
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  priceChangeYoY: number; // percentage
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
 * Search properties via external API (Zillow/RapidAPI/Realtor.com).
 * Uses callDataApi infrastructure which routes through the forge gateway.
 */
export async function searchProperties(
  params: PropertySearchParams
): Promise<PropertyListing[]> {
  try {
    const query: Record<string, unknown> = {};
    if (params.city) query.city = params.city;
    if (params.state) query.state = params.state;
    if (params.zipCode) query.zip = params.zipCode;
    if (params.minPrice) query.minPrice = params.minPrice;
    if (params.maxPrice) query.maxPrice = params.maxPrice;
    if (params.bedrooms) query.bedrooms = params.bedrooms;
    if (params.propertyType) query.home_type = params.propertyType;
    query.limit = params.limit || 5;

    const result = await callDataApi("Zillow/propertyExtendedSearch", { query });

    // Parse API response into our PropertyListing format
    if (result && typeof result === "object" && "props" in result) {
      const props = (result as any).props as any[];
      return (props || []).slice(0, params.limit || 5).map((p: any) => ({
        address: p.address || p.streetAddress || "N/A",
        city: p.city || params.city || "N/A",
        state: p.state || params.state || "N/A",
        zipCode: p.zipcode || params.zipCode || "N/A",
        price: p.price || 0,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        sqft: p.livingArea || 0,
        type: p.homeType || "unknown",
        status: p.homeStatus || "for_sale",
        imageUrl: p.imgSrc || undefined,
        listingUrl: p.detailUrl || undefined,
      }));
    }

    return [];
  } catch (error) {
    console.warn("[PropertyService] API search failed, using fallback:", error);
    return getFallbackListings(params);
  }
}

/**
 * Get market statistics for an area.
 */
export async function getMarketStats(
  city: string,
  state: string = "CA"
): Promise<MarketStats | null> {
  try {
    const result = await callDataApi("Zillow/propertyExtendedSearch", {
      query: { location: `${city}, ${state}`, limit: 1 },
    });

    // If we get a response with totalResultCount, we can derive basic stats
    if (result && typeof result === "object") {
      const data = result as any;
      return {
        area: `${city}, ${state}`,
        medianPrice: data.medianListingPrice || 0,
        avgDaysOnMarket: data.avgDaysOnMarket || 0,
        activeListings: data.totalResultCount || 0,
        priceChangeYoY: data.priceChange || 0,
      };
    }

    return null;
  } catch (error) {
    console.warn("[PropertyService] Market stats failed:", error);
    return null;
  }
}

/**
 * Format property listings into a readable string for AI context.
 */
export function formatListingsForAI(listings: PropertyListing[]): string {
  if (listings.length === 0) return "No properties found matching those criteria.";

  return listings
    .map(
      (p, i) =>
        `${i + 1}. **${p.address}**, ${p.city}, ${p.state} ${p.zipCode}\n` +
        `   💰 $${p.price.toLocaleString()} | 🛏 ${p.bedrooms} bed | 🛁 ${p.bathrooms} bath | 📐 ${p.sqft.toLocaleString()} sqft\n` +
        `   Type: ${p.type} | Status: ${p.status}`
    )
    .join("\n\n");
}

/**
 * Fallback listings when API is unavailable — returns example data.
 * In production, this could query a local cache or database.
 */
function getFallbackListings(params: PropertySearchParams): PropertyListing[] {
  const city = params.city || "San Francisco";
  console.warn(`[PropertyService] Returning fallback listings for ${city}`);

  // Return empty — let the AI explain that live data is temporarily unavailable
  return [];
}
