export const LISTING_LIMITS: Record<string, { maxListings: number; maxPhotos: number; maxPhotoSizeMB: number }> = {
  basic:        { maxListings: 3,  maxPhotos: 5,  maxPhotoSizeMB: 2 },
  premium:      { maxListings: 9,  maxPhotos: 10, maxPhotoSizeMB: 5 },
  premium_plus: { maxListings: 30, maxPhotos: 20, maxPhotoSizeMB: 5 },
  sponsor:      { maxListings: 30, maxPhotos: 30, maxPhotoSizeMB: 5 },
};

export function getListingLimits(plan?: string) {
  return LISTING_LIMITS[plan || 'basic'] || LISTING_LIMITS.basic;
}

export function canCreateListing(plan?: string): boolean {
  const limits = getListingLimits(plan);
  return limits.maxListings > 0;
}
