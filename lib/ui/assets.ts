export const BRAND_ASSETS = {
  logo: "/assets/brand-logo.png",
  pineLabs: "/assets/pine-labs-logo.png",
} as const;

export const UI_ICONS = {
  plus: "/assets/icons/plus.png",
  send: "/assets/icons/send.png",
  menu: "/assets/icons/menu.png",
  card: "/assets/icons/card.png",
} as const;

export const CATEGORY_ICONS = {
  meal: "/assets/icons/meal.png",
  gift: "/assets/icons/gift.png",
  fuel: "/assets/icons/fuel.png",
  mobile: "/assets/icons/mobile.png",
  driver: "/assets/icons/driver.png",
  books: "/assets/icons/books.png",
  professional: "/assets/icons/professional.png",
} as const;

export type CategoryIconId = keyof typeof CATEGORY_ICONS;
