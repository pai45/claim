export const BRAND_ASSETS = {
  logo: "/assets/benefits-logo.gif",
  pineLabs: "/assets/pine-labs-logo.svg",
  /**
   * Also referenced document-relative (`../assets/login/pluspay-logo.svg`) by
   * the static app in `public/employee-benefits/`, which has no `withBasePath`.
   * Moving this file means updating that markup too.
   */
  plusPay: "/assets/login/pluspay-logo.svg",
  /** Hero art for the MPIN intro screen; falls back to a padlock glyph. */
  mpinLock: "/assets/mpin/secure-payments.svg",
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
