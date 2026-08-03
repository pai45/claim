export const BRAND_ASSETS = {
  logo: "/assets/brand-logo.svg",
  pineLabs: "/assets/pine-labs-logo.svg",
} as const;

export const UI_ICONS = {
  plus: "/assets/icons/plus.svg",
  send: "/assets/icons/send.svg",
  menu: "/assets/icons/menu.svg",
  card: "/assets/icons/card.svg",
  claimsDashboard: "/assets/icons/claims-dashboard.svg",
  policyDetails: "/assets/icons/policy-details.svg",
  claimHistory: "/assets/icons/claim-history.svg",
} as const;

export const CATEGORY_ICONS = {
  meal: "/assets/icons/meal.svg",
  gift: "/assets/icons/gift.svg",
  fuel: "/assets/icons/fuel.svg",
  mobile: "/assets/icons/mobile.svg",
  driver: "/assets/icons/driver.svg",
  books: "/assets/icons/books.svg",
  professional: "/assets/icons/professional.svg",
} as const;

export type CategoryIconId = keyof typeof CATEGORY_ICONS;
