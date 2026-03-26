export type PlanType = 'basic' | 'premium' | 'premium_plus' | 'sponsor';

export const PLAN_LIMITS: Record<PlanType, {
  maxPortfolioImages: number;
  maxUploadSizeMB: number;
  maxUploadSizeBytes: number;
}> = {
  basic: {
    maxPortfolioImages: 3,
    maxUploadSizeMB: 2,
    maxUploadSizeBytes: 2 * 1024 * 1024,
  },
  premium: {
    maxPortfolioImages: 9,
    maxUploadSizeMB: 5,
    maxUploadSizeBytes: 5 * 1024 * 1024,
  },
  premium_plus: {
    maxPortfolioImages: 30,
    maxUploadSizeMB: 5,
    maxUploadSizeBytes: 5 * 1024 * 1024,
  },
  sponsor: {
    maxPortfolioImages: 30,
    maxUploadSizeMB: 5,
    maxUploadSizeBytes: 5 * 1024 * 1024,
  },
};

export function getPlanLimits(plan?: string) {
  const key = (plan || 'basic') as PlanType;
  return PLAN_LIMITS[key] || PLAN_LIMITS.basic;
}

// 관리자는 항상 프리미엄+ 제한 적용
export function getUserUploadLimit(isAdmin: boolean, plan?: string) {
  if (isAdmin) return PLAN_LIMITS.premium_plus;
  return getPlanLimits(plan);
}
