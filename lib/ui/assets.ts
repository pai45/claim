export const BRAND_ASSETS = {
  logo: "/assets/benefits-logo.gif",
  pineLabs: "/assets/pine-labs-logo.svg",
  /**
   * Also referenced document-relative (`../assets/login/pluspay-logo.svg`) by
   * the static app in `public/employee-benefits/`, which has no `withBasePath`.
   * Moving this file means updating that markup too.
   */
  plusPay: "/assets/login/pluspay-logo.svg",
  /** Supplied transparent artwork used in the PlusPay home hero. */
  plusPayHero: "/assets/pluspay/hero-wallet.png",
  /** Animated scanner used by the PlusPay center navigation action. */
  scanPay: "/assets/scan.gif",
  /** Hero art for the MPIN intro screen; falls back to a padlock glyph. */
  mpinLock: "/assets/mpin/mpin.gif",
} as const;

export const UI_ICONS = {
  plus: "/assets/icons/plus.svg",
  send: "/assets/icons/send.svg",
  menu: "/assets/icons/menu.svg",
  card: "/assets/icons/card.svg",
  claimsDashboard: "/assets/icons/claims-dashboard.svg",
  policyDetails: "/assets/icons/policy-details.svg",
  claimHistory: "/assets/icons/claim-history.svg",
  notification: "/assets/icons/notification-bell.svg",
} as const;

export const CHAT_ASSETS = {
  vehicleRegistration: "/assets/vehicle-registration-cta.png",
  driverRegistration: "/assets/driver-registration-cta.png",
} as const;

/** Supplied full-screen Lottie used by the pre-registration product intro. */
export const PRODUCT_INTRO_ASSETS = {
  animation: "/assets/product-intro/onboarding-animation.json",
  images: "/assets/product-intro/",
} as const;

/** Supplied artwork used by the Profile screen's menu rows. */
export const PROFILE_ICONS = {
  user: "/assets/icons/profile-user.svg",
  autopay: "/assets/icons/profile-autopay.svg",
  collect: "/assets/icons/profile-collect.svg",
} as const;

export const UPI_SETTINGS_ASSETS = {
  benefits: "/assets/upi-settings/eb-benefits.svg",
  anq: "/assets/upi-settings/anq.svg",
  poweredByUpi: "/assets/upi-settings/powered-by-upi.png",
  beneficiaryLimits: "/assets/upi-settings/shield-plus.svg",
  beneficiaryCount: "/assets/upi-settings/users-group.svg",
  paymentLimits: "/assets/upi-settings/slash-circle.svg",
  paymentIndividuals: "/assets/upi-settings/payment-individuals.svg",
  paymentMerchants: "/assets/upi-settings/payment-merchants.svg",
  editBeneficiary: "/assets/upi-settings/edit-beneficiary.svg",
  deleteBeneficiary: "/assets/upi-settings/delete-beneficiary.svg",
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

/** Clearly watermarked, fictional documents used by the upload demo. */
export const DEMO_DOCUMENT_ASSETS = {
  billMeal: "/assets/demo-documents/bill-meal.jpg",
  billMealMissing: "/assets/demo-documents/bill-meal-missing.jpg",
  billFuel: "/assets/demo-documents/bill-fuel.jpg",
  billFuelExceeding: "/assets/demo-documents/bill-fuel-exceeding.jpg",
  billInternet: "/assets/demo-documents/bill-internet.jpg",
  billMobile: "/assets/demo-documents/bill-mobile.jpg",
  billGift: "/assets/demo-documents/bill-gift.jpg",
  billBooks: "/assets/demo-documents/bill-books.jpg",
  billProfessional: "/assets/demo-documents/bill-professional.jpg",
  billDuplicate: "/assets/demo-documents/bill-duplicate.jpg",
  billLate: "/assets/demo-documents/bill-late.jpg",
  billOther: "/assets/demo-documents/bill-other.jpg",
  dlFound: "/assets/demo-documents/dl-found.jpg",
  dlNotFound: "/assets/demo-documents/dl-not-found.jpg",
} as const;

/** Supplied merchant QR hardware image used by the Scan & Pay demo scanner. */
export const SCAN_PAY_ASSETS = {
  scannerDemo: "/assets/scan-pay/scanner-demo.png",
  flashlight: "/assets/scan-pay/flashlight.svg",
  gallery: "/assets/scan-pay/gallery.svg",
  questionCircle: "/assets/scan-pay/question-circle.svg",
  scratchCard: "/assets/scan-pay/scratch-card.png",
  financeIllustration: "/assets/scan-pay/finance-illustration.svg",
  categoryMore: "/assets/scan-pay/category-more.svg",
  confirmPaymentMark: "/assets/scan-pay/confirm-payment-mark.png",
  poweredByUpi: UPI_SETTINGS_ASSETS.poweredByUpi,
} as const;
