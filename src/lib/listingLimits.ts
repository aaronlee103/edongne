export const LISTING_LIMITS: Record<string, { maxListings: number; maxPhotos: number; maxPhotoSizeMB: number }> = {
  basic:        { maxListings: 0,  maxPhotos: 0,  maxPhotoSizeMB: 0 },
  premium:      { maxListings: 5,  maxPhotos: 10, maxPhotoSizeMB: 5 },
  premium_plus: { maxListings: 20, maxPhotos: 20, maxPhotoSizeMB: 5 },
  sponsor:      { maxListings: 50, maxPhotos: 30, maxPhotoSizeMB: 5 },
};

export function getListingLimits(plan?: string) {
  return LISTING_LIMITS[plan || 'basic'] || LISTING_LIMITS.basic;
}

export function canCreateListing(plan?: string): boolean {
  const limits = getListingLimits(plan);
  return limits.maxListings > 0;
}
