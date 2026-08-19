import type { VehicleBodyType } from "@/lib/vehicle/types";

export const BRAND_ASSETS = {
  logo: "/assets/benefits-logo-v2.gif",
  pineLabs: "/assets/pine-labs-logo.svg",
  /**
   * Also referenced document-relative (`../assets/login/pluspay-logo.svg`) by
   * the static app in `public/employee-benefits/`, which has no `withBasePath`.
   * Moving this file means updating that markup too.
   */
  plusPay: "/assets/login/pluspay-logo.svg",
  /** Supplied transparent artwork used in the PlusPay home hero. */
  plusPayHero: "/assets/pluspay/hero-wallet.png",
  /** Supplied grid illustration used by Rohan's EB+ setup invitation. */
  ebPlusSetup: "/assets/pluspay/eb-setup-illustration.svg",
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
  homeSelected: "/assets/icons/home-selected.svg",
  transactionHistorySelected: "/assets/icons/transaction-history-selected.svg",
  rupay: "/employee-benefits/assets/icons/rupay-logo.svg",
  onlineTransactions: "/assets/icons/online-transactions.svg",
  tapToPay: "/assets/icons/tap-to-pay.svg",
  pos: "/assets/icons/pos.svg",
  claimsDashboard: "/assets/icons/claims-dashboard.svg",
  policyDetails: "/assets/icons/policy-details.svg",
  chatDrafts: "/assets/icons/chat-drafts.svg",
  claimHistory: "/assets/icons/claim-history.svg",
  notification: "/assets/icons/notification-bell.svg",
  vehicleDetails: "/assets/icons/vehicle-details.svg",
  driverDetails: "/assets/icons/driver-details.svg",
} as const;

export const PAYMENT_ASSETS = {
  /** Supplied paper-plane artwork shared by Pay to Anyone and Send Money. */
  sendMoney: "/assets/payments/send-money.svg",
  /** Supplied UPI mark used by the PlusPay UPI ID card. */
  upiId: "/assets/payments/upi-id.svg",
} as const;

export const CHAT_ASSETS = {
  vehicleRegistration: "/assets/vehicle-registration-cta.png",
  driverRegistration: "/assets/driver-registration-cta.png",
} as const;

/** Supplied transparent vehicle artwork, selected by the roster body type. */
export const VEHICLE_BODY_TYPE_ASSETS = {
  Hatchback: "/assets/vehicles/hatchback.webp",
  Sedan: "/assets/vehicles/sedan.webp",
  "Compact SUV": "/assets/vehicles/compact_suv.webp",
  SUV: "/assets/vehicles/suv.webp",
  "Micro SUV": "/assets/vehicles/micro_suv.webp",
  "Off-roader": "/assets/vehicles/off_roader.webp",
  MPV: "/assets/vehicles/mpv.webp",
} as const satisfies Record<VehicleBodyType, string>;

/** Supplied full-screen Lottie used by the pre-registration product intro. */
export const PRODUCT_INTRO_ASSETS = {
  animation: "/assets/product-intro/onboarding-animation.json",
  images: "/assets/product-intro/",
} as const;

export const ONBOARDING_ASSETS = {
  kycInProgress: "/assets/onboarding/in-progress.svg",
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
  mobile: "/assets/icons/mobile-internet.svg",
  fuel: "/assets/icons/fuel.svg",
  driver: "/assets/icons/driver.svg",
  books: "/assets/icons/books.svg",
  professional: "/assets/icons/professional.svg",
} as const;

export type CategoryIconId = keyof typeof CATEGORY_ICONS;

/** Clearly watermarked, fictional documents used by the upload demo. */
export const DEMO_DOCUMENT_ASSETS = {
  claimDriverSalary: "/assets/demo-documents/claim-driver-salary.png",
  claimMeal: "/assets/demo-documents/claim-meal.jpg",
  claimMealMissing: "/assets/demo-documents/claim-meal-missing.jpg",
  claimFuel: "/assets/demo-documents/claim-fuel.jpg",
  claimFuelExceeding: "/assets/demo-documents/claim-fuel-exceeding.jpg",
  claimInternet: "/assets/demo-documents/claim-internet.jpg",
  claimMobile: "/assets/demo-documents/claim-mobile.jpg",
  claimBooks: "/assets/demo-documents/claim-books.jpg",
  claimProfessional: "/assets/demo-documents/claim-professional.jpg",
  claimDuplicate: "/assets/demo-documents/claim-duplicate.jpg",
  claimLate: "/assets/demo-documents/claim-late.jpg",
  claimOther: "/assets/demo-documents/claim-other.jpg",
  dlFound: "/assets/demo-documents/dl-found.jpg",
  dlNotFound: "/assets/demo-documents/dl-not-found.jpg",
} as const;

/** Supplied merchant QR hardware image used by the Scan & Pay demo scanner. */
export const SCAN_PAY_ASSETS = {
  scannerDemo: "/assets/scan-pay/scanner-demo.png",
  flashlight: "/assets/scan-pay/flashlight.svg",
  gallery: "/assets/scan-pay/gallery.svg",
  questionCircle: "/assets/scan-pay/question-circle.svg",
  financeIllustration: "/assets/scan-pay/finance-illustration.svg",
  categoryMore: "/assets/scan-pay/category-more.svg",
  confirmPaymentMark: "/assets/scan-pay/confirm-payment-mark.png",
  paymentProcessingLogo: "/assets/scan-pay/payment-processing-logo.png",
  transactionDetails: "/assets/scan-pay/maximize-square.svg",
  downloadSquare: "/assets/scan-pay/download-square.svg",
  shareSquare: "/assets/scan-pay/square-share-line.svg",
  poweredByUpi: UPI_SETTINGS_ASSETS.poweredByUpi,
} as const;
