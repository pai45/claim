const toastRegion = document.querySelector("[data-toast-region]");
const filterButtons = document.querySelectorAll("[data-filter]");
const transactions = document.querySelectorAll("[data-wallet]");
const virtualCardToggle = document.querySelector("[data-virtual-card-toggle]");
const balanceCard = document.querySelector(".balance-card");
const cardOverlay = document.querySelector("[data-card-overlay]");
const virtualCardNumberNodes = document.querySelectorAll(
  "[data-virtual-card-number]",
);
const virtualCardNumberToggle = document.querySelector(
  "[data-virtual-card-number-toggle]",
);
const overlayCloseButtons = document.querySelectorAll(
  "[data-card-overlay-close]",
);
const walletButtons = document.querySelectorAll("[data-wallet-card]");
const pluspayToggle = document.querySelector("[data-pluspay-toggle]");
const pluspayLabel = document.querySelector("[data-pluspay-label]");
const swapTextNodes = document.querySelectorAll(
  "[data-eb-plus-text][data-pluspay-text], [data-lens-text][data-pluspay-text]",
);
const lensFilterButton = document.querySelector('[data-filter="all"]');
const walletOverlay = document.querySelector("[data-wallet-overlay]");
const walletOverlayName = document.querySelector("[data-wallet-overlay-name]");
const walletOverlayBalance = document.querySelector(
  "[data-wallet-overlay-balance]",
);
const walletOverlayPills = document.querySelector(
  "[data-wallet-overlay-pills]",
);
const walletOverlaySummary = document.querySelector(
  "[data-wallet-overlay-tone]",
);
const walletOverlayIcon = document.querySelector("[data-wallet-overlay-icon]");
const walletOverlayModeSwitch = document.querySelector(
  "[data-wallet-overlay-mode-switch]",
);
const walletOverlayPrimaryAction = document.querySelector(
  "[data-wallet-overlay-primary-action]",
);
const walletOverlayDirectoryCopy = document.querySelector(
  "[data-wallet-overlay-directory-copy]",
);
const walletOverlaySelectCopy = document.querySelector(
  "[data-wallet-overlay-select-copy]",
);
const walletOverlayHistory = document.querySelector(
  "[data-wallet-overlay-history]",
);
const walletOverlayScroll = document.querySelector(
  "[data-wallet-overlay-scroll]",
);
const walletOverlayViewAllHistory = document.querySelector(
  "[data-wallet-overlay-view-all-history]",
);
const walletOverlayCloseButtons = document.querySelectorAll(
  "[data-wallet-overlay-close]",
);
const walletDirectoryOpenButtons = document.querySelectorAll(
  "[data-wallet-directory-open]",
);
const merchantDirectoryOverlay = document.querySelector(
  "[data-merchant-directory-overlay]",
);
const merchantDirectoryTitle = document.querySelector(
  "[data-merchant-directory-title]",
);
const merchantDirectoryCount = document.querySelector(
  "[data-merchant-directory-count]",
);
const merchantDirectorySummaryCopy = document.querySelector(
  "[data-merchant-directory-summary-copy]",
);
const merchantDirectorySearchCopy = document.querySelector(
  "[data-merchant-directory-search-copy]",
);
const merchantDirectoryChips = document.querySelector(
  "[data-merchant-directory-chips]",
);
const merchantDirectoryList = document.querySelector(
  "[data-merchant-directory-list]",
);
const merchantDirectoryCloseButtons = document.querySelectorAll(
  "[data-merchant-directory-close]",
);
const merchantDirectoryScroll = document.querySelector(
  "[data-merchant-directory-scroll]",
);
const manageCardsOpenButtons = document.querySelectorAll(
  "[data-manage-cards-open]",
);
const manageCardsOverlay = document.querySelector(
  "[data-manage-cards-overlay]",
);
const manageCardsCloseButtons = document.querySelectorAll(
  "[data-manage-cards-close]",
);
const manageCardsPanel = document.querySelector(".manage-cards-panel");
const manageWalletCarousel = document.querySelector(
  ".manage-cards-wallet-carousel",
);
const manageWalletButtons = document.querySelectorAll("[data-manage-wallet]");
const manageOnlineButton = document.querySelector(
  "[data-manage-online-toggle]",
);
const manageWalletCount = document.querySelector("[data-manage-wallet-count]");
const manageWalletDots = document.querySelectorAll(
  ".manage-cards-wallet-dots i",
);
const manageAccessCopy = document.querySelector("[data-manage-access-copy]");
const manageAccessValue = document.querySelector("[data-manage-access-value]");
const manageLimitCopy = document.querySelector("[data-manage-limit-copy]");
const manageLimitValue = document.querySelector("[data-manage-limit-value]");
const manageLimitProgress = document.querySelector(
  "[data-manage-limit-progress]",
);
const manageLimitUsed = document.querySelector("[data-manage-limit-used]");
const manageLimitTotal = document.querySelector("[data-manage-limit-total]");
const manageOnlineCopy = document.querySelector("[data-manage-online-copy]");
const manageStatusCopy = document.querySelector("[data-manage-status-copy]");
const manageSensitiveFields = document.querySelectorAll(
  "[data-card-sensitive]",
);
const manageRevealButtons = document.querySelectorAll("[data-card-reveal]");
const manageCopyButton = document.querySelector("[data-card-copy]");
const managePlaceholderButtons = manageCardsOverlay?.querySelectorAll(
  ".manage-cards-control-tile[data-toast]",
);
const managePreviewNumber = document.querySelector(
  "[data-manage-preview-number]",
);
const managePreviewHolder = document.querySelector(
  "[data-manage-preview-holder]",
);
const managePreviewExpiry = document.querySelector(
  "[data-manage-preview-expiry]",
);
const currentWalletBalance = document.querySelector(
  "[data-current-wallet-balance]",
);
const manageCurrentBalance = document.querySelector(
  "[data-manage-current-balance]",
);
const manageWalletType = document.querySelector("[data-manage-wallet-type]");
const trackCardOpenButtons = document.querySelectorAll("[data-track-card-open]");
const trackCardOverlay = document.querySelector("[data-track-card-overlay]");
const trackCardPanel = document.querySelector(".track-card-panel");
const trackCardCloseButtons = document.querySelectorAll(
  "[data-track-card-close]",
);
const trackAwbCopyButton = document.querySelector("[data-track-awb-copy]");
const trackAwb = document.querySelector("[data-track-awb]");
const trackStatusButton = document.querySelector(".track-status-button[data-toast]");
const trackActivationOverlay = document.querySelector(
  "[data-track-activation-overlay]",
);
const trackActivationSheet = document.querySelector(".track-activation-sheet");
const trackActivationOpenButton = document.querySelector(
  "[data-track-activate-open]",
);
const trackActivationCloseButtons = document.querySelectorAll(
  "[data-track-activation-close]",
);
const trackActivationCvv = document.querySelector(
  "[data-track-activation-cvv]",
);
const trackActivationCvvToggle = document.querySelector(
  "[data-track-activation-cvv-toggle]",
);
const trackConfirmActivateButton = document.querySelector(
  "[data-track-confirm-activate]",
);
const trackActivateLabel = document.querySelector("[data-track-activate-label]");
const cardPinOpenButtons = document.querySelectorAll("[data-card-pin-open]");
const cardPinOverlay = document.querySelector("[data-card-pin-overlay]");
const cardPinPanel = document.querySelector(".card-pin-panel");
const cardPinTitle = document.querySelector("#card-pin-title");
const cardPinCloseButtons = document.querySelectorAll("[data-card-pin-close]");
const cardPinInputs = Array.from(
  document.querySelectorAll("[data-card-pin-digit]"),
);
const cardPinVisibilityButtons = document.querySelectorAll(
  "[data-card-pin-visibility]",
);
const cardPinError = document.querySelector("[data-card-pin-error]");
const cardPinSubmitButton = document.querySelector("[data-card-pin-submit]");
const cardSuccessOverlay = document.querySelector("[data-card-success-overlay]");
const cardSuccessSheet = document.querySelector("[data-card-success-sheet]");
const cardSuccessActivation = document.querySelector(
  "[data-card-success-activation]",
);
const cardSuccessPin = document.querySelector("[data-card-success-pin]");
const cardSuccessPinTitle = document.querySelector(
  "[data-card-success-pin-title]",
);
const cardSuccessFallback = document.querySelector(
  "[data-card-success-fallback]",
);
const cardSuccessFallbackTitle = document.querySelector(
  "[data-card-success-fallback-title]",
);
const cardSuccessFallbackDesc = document.querySelector(
  "[data-card-success-fallback-desc]",
);
const cardSuccessCloseButtons = document.querySelectorAll(
  "[data-card-success-close], [data-card-success-done], [data-card-success-ok]",
);
const cardSuccessSetPinButton = document.querySelector(
  "[data-card-success-set-pin]",
);
const cardLockOverlay = document.querySelector("[data-card-lock-overlay]");
const cardLockSheet = document.querySelector(".card-lock-sheet");
const cardLockOpenButtons = document.querySelectorAll("[data-card-lock-open]");
const cardLockCloseButtons = document.querySelectorAll("[data-card-lock-close]");
const cardLockConfirmButton = document.querySelector("[data-card-lock-confirm]");
const cardLockBanner = document.querySelector("[data-card-lock-banner]");
const cardLockTileLabel = document.querySelector("[data-card-lock-tile-label]");
const cardUnlockOpenButtons = document.querySelectorAll(
  "[data-card-unlock-open]",
);
const cardStatusOverlay = document.querySelector("[data-card-status-overlay]");
const cardStatusSheet = document.querySelector(".card-status-sheet");
const cardStatusCloseButtons = document.querySelectorAll(
  "[data-card-status-close]",
);
const cardStatusTitle = document.querySelector("[data-card-status-title]");
const cardStatusEffective = document.querySelector(
  "[data-card-status-effective]",
);
const cardStatusCopy = document.querySelector("[data-card-status-copy]");
const cardStatusHelp = document.querySelector("[data-card-status-help]");
const fallbackOverlay = document.querySelector("[data-fallback-overlay]");
const fallbackPanel = document.querySelector(".fallback-panel");
const fallbackOpenButtons = document.querySelectorAll("[data-fallback-open]");
const fallbackCloseButtons = document.querySelectorAll("[data-fallback-close]");
const fallbackInfo = document.querySelector("[data-fallback-info]");
const fallbackInfoToggle = document.querySelector(
  "[data-fallback-info-toggle]",
);
const fallbackToggles = document.querySelectorAll("[data-fallback-toggle]");
const fallbackConfirmOverlay = document.querySelector(
  "[data-fallback-confirm-overlay]",
);
const fallbackConfirmSheet = document.querySelector(
  "[data-fallback-confirm-sheet]",
);
const fallbackConfirmTitle = document.querySelector(
  "[data-fallback-confirm-title]",
);
const fallbackConfirmDesc1 = document.querySelector(
  "[data-fallback-confirm-desc-1]",
);
const fallbackConfirmDesc2 = document.querySelector(
  "[data-fallback-confirm-desc-2]",
);
const fallbackConfirmCloseButtons = document.querySelectorAll(
  "[data-fallback-confirm-close], [data-fallback-confirm-cancel]",
);
const fallbackConfirmDisableButton = document.querySelector(
  "[data-fallback-confirm-disable]",
);
let pendingDisableFallbackKey = null;
const claimsOpenButton = document.querySelector("[data-claims-open]");
const claimsAssistant = document.querySelector("[data-claims-assistant]");
const claimsCloseButtons = document.querySelectorAll("[data-claims-close]");
const claimsStatus = document.querySelector("[data-claims-status]");
const claimsThread = document.querySelector("[data-claims-thread]");
const claimsWorkspace = document.querySelector("[data-claims-workspace]");
const claimsScroll = document.querySelector("[data-claims-scroll]");
const claimsInput = document.querySelector("[data-claims-input]");
const claimsSendButton = document.querySelector("[data-claims-send]");
const claimsActionButtons = document.querySelectorAll("[data-claims-action]");
const claimsActionMenu = document.querySelector("[data-claims-action-menu]");
const claimsActionMenuButton = document.querySelector(
  "[data-claims-action-menu-toggle]",
);
const tapPayDiscovery = document.querySelector("[data-tap-pay-discovery]");
const scanPayOpenButtons = document.querySelectorAll("[data-scan-pay-open]");
const bankTransferOpenButtons = document.querySelectorAll(
  "[data-bank-transfer-open]",
);
const upiSetupOpenButton = document.querySelector("[data-upi-setup-open]");
const upiSetupFlow = document.querySelector("[data-upi-setup-flow]");
const upiIdCards = document.querySelectorAll("[data-upi-id-card]");
const upiIdValues = document.querySelectorAll("[data-upi-id-value]");
const upiSettingsOpenButtons = document.querySelectorAll(
  "[data-upi-settings-open]",
);

let toastTimer;
let activeWalletTone = "meal";
let activeManageWalletKey = "meal";
let syncedTransactionItems = [];
let syncedWalletTransactions = {};
const UPI_CREATED_STORAGE_KEY = "employee-benefits:upi-created:v1";
const CREATED_UPI_ID = "xxxxxxxx79@infosys";
const UPI_SETUP_STEP_DURATION = 1500;
const upiSetupState = { stage: 0, view: "setup" };
let upiSetupTimer;
let trackActivationCvvVisible = false;
let pendingCardMpinIntent = null;
const benefitsCardSecurityState = { activated: false, pin: null };
let cardSuccessMode = "activation";
const CARD_MPIN_VERIFY_MESSAGE = "employee-benefits:verify-mpin";
const CARD_MPIN_VERIFIED_MESSAGE = "employee-benefits:mpin-verified";
const CARD_MPIN_CANCELLED_MESSAGE = "employee-benefits:mpin-cancelled";
const benefitsCardLockState = { locked: false, statusMode: "locked" };
const FALLBACK_STORAGE_KEY = "employee-benefits:fallback-control:v1";
const FALLBACK_STORAGE_VERSION = 2;
// Only spend wallets can fall back; the Reimbursement Wallet is the source of
// funds, so it never appears as a fallback candidate itself.
const fallbackWalletLabels = { meal: "Meal Wallet", fuel: "Fuel Wallet" };
const fallbackState = { meal: true, fuel: true };
const personaDefinitions = {
  returning: {
    name: "Vishal Sharma",
    initials: "V",
    access: {
      products: { ebPlus: true, plusPay: true },
      upiEnabled: true,
      defaultProduct: "lens",
    },
    hasTransactions: true,
    hasUpiId: true,
  },
  new_user: {
    name: "Aarav Patel",
    initials: "A",
    access: {
      products: { ebPlus: true, plusPay: true },
      upiEnabled: true,
      defaultProduct: "lens",
    },
    hasTransactions: false,
    hasUpiId: false,
  },
  ebPlus_only: {
    name: "Neha Kapoor",
    initials: "N",
    access: {
      products: { ebPlus: true, plusPay: false },
      upiEnabled: true,
      defaultProduct: "lens",
    },
    hasTransactions: true,
    hasUpiId: true,
  },
  pluspay_only: {
    name: "Rohan Mehta",
    initials: "R",
    access: {
      products: { ebPlus: false, plusPay: true },
      upiEnabled: true,
      defaultProduct: "pluspay",
    },
    hasTransactions: true,
    hasUpiId: true,
  },
  ebPlus_no_upi: {
    name: "Kavya Iyer",
    initials: "K",
    access: {
      products: { ebPlus: true, plusPay: false },
      upiEnabled: false,
      defaultProduct: "lens",
    },
    hasTransactions: true,
    hasUpiId: false,
  },
};
const personaFinancialState = {
  returning: {
    wallets: {
      meal: { amount: 6400, display: "₹6,400" },
      fuel: { amount: 3150, display: "₹3,150" },
      misc: { amount: 9100, display: "₹9,100" },
      gift: { amount: 6200, display: "6,200 pts" },
    },
    limitUsed: 4200,
  },
  new_user: {
    wallets: {
      meal: { amount: 10000, display: "₹10,000" },
      fuel: { amount: 10000, display: "₹10,000" },
      misc: { amount: 10000, display: "₹10,000" },
      gift: { amount: 10000, display: "10,000 pts" },
    },
    limitUsed: 0,
  },
};
const manageWalletState = {
  meal: {
    label: "Meal Wallet",
    balance: "₹6,400",
    summary: "Available balance for daily essentials",
    accessCopy: "Groceries, Restaurants, Food Delivery",
    accessValue: "Allowed",
    limitUsed: 4200,
    limitTotal: 10000,
    online: true,
    frozen: false,
    card: {
      number: "4521 8890 4432 7845",
      holder: "VISHAL SHARMA",
      expiry: "12/28",
      cvv: "731",
      last4: "7845",
    },
    reveal: { number: false, cvv: false },
  },
  fuel: {
    label: "Fuel Wallet",
    balance: "₹3,150",
    summary: "Available balance for commute spends",
    accessCopy: "Fuel Stations, Mobility, Auto Care",
    accessValue: "Allowed",
    limitUsed: 4200,
    limitTotal: 10000,
    online: true,
    frozen: false,
    card: {
      number: "4521 8890 4432 7846",
      holder: "VISHAL SHARMA",
      expiry: "05 / 29",
      cvv: "731",
      last4: "7846",
    },
    reveal: { number: false, cvv: false },
  },
  misc: {
    label: "Reimbursement Wallet",
    balance: "₹9,100",
    summary: "Available balance for claim-based spends",
    accessCopy: "Claims, QR Payments, Approved Vendors",
    accessValue: "Allowed",
    limitUsed: 4200,
    limitTotal: 10000,
    online: true,
    frozen: false,
    card: {
      number: "4521 8890 4432 7847",
      holder: "VISHAL SHARMA",
      expiry: "05 / 29",
      cvv: "731",
      last4: "7847",
    },
    reveal: { number: false, cvv: false },
  },
  gift: {
    label: "Gift Wallet",
    balance: "6,200 pts",
    summary: "Available balance for gifting spends",
    accessCopy: "Gift Cards, Online Stores, Brand Partners",
    accessValue: "Allowed",
    limitUsed: 4200,
    limitTotal: 10000,
    online: true,
    frozen: false,
    card: {
      number: "4521 8890 4432 7848",
      holder: "VISHAL SHARMA",
      expiry: "05 / 29",
      cvv: "731",
      last4: "7848",
    },
    reveal: { number: false, cvv: false },
  },
};

function syncPageScrollLock() {
  const hasOpenOverlay = [
    cardOverlay,
    walletOverlay,
    merchantDirectoryOverlay,
    manageCardsOverlay,
    trackCardOverlay,
    trackActivationOverlay,
    cardPinOverlay,
    cardSuccessOverlay,
    cardLockOverlay,
    cardStatusOverlay,
    fallbackOverlay,
    claimsAssistant,
    upiSetupFlow,
  ].some((overlay) => overlay?.classList.contains("is-open"));
  document.body.classList.toggle("is-overlay-open", hasOpenOverlay);
}

const walletActionCatalog = {
  tap: {
    label: "Tap & Pay",
    detail: "Contactless checkout with card or phone.",
    icon: '<svg aria-hidden="true"><use href="#icon-nfc" /></svg>',
    toast: "Tap & Pay launched",
  },
  scan: {
    label: "Scan & Pay",
    detail: "Scan a merchant QR from this wallet.",
    icon: '<svg aria-hidden="true"><use href="#icon-qr-code" /></svg>',
    toast: "Scan & Pay launched",
  },
  card: {
    label: "Card Access",
    detail: "Use for gifting and card-led redemption.",
    icon: '<svg aria-hidden="true"><use href="#icon-card" /></svg>',
    toast: "Card access opened",
  },
};

const walletOverlayContent = {
  meal: {
    directoryCopy: "250+ merchants",
    selectCopy: "Request a new food outlet",
    searchCopy: "Search food merchants near you",
    summaryCopy: "Cafes, grocers, and dining partners that accept Meal Wallet",
    viewAllToast: "Meal Wallet statement opened",
    categories: ["Nearby", "Cafe", "Groceries", "Dining"],
    merchants: [
      {
        name: "WeWork counter",
        subtitle: "Cafe · 0.3 km",
        meta: "Open now",
        reward: "Meal",
        icon: "icon-food",
      },
      {
        name: "Star Bazaar",
        subtitle: "Groceries · 1.1 km",
        meta: "Open now",
        reward: "Meal",
        icon: "icon-bag",
      },
      {
        name: "Subway",
        subtitle: "Dining · 0.8 km",
        meta: "Closes 10 PM",
        reward: "Meal",
        icon: "icon-food",
      },
      {
        name: "FreshMenu",
        subtitle: "Dining · 1.2 km",
        meta: "Open now",
        reward: "Meal",
        icon: "icon-food",
      },
      {
        name: "Nature's Basket",
        subtitle: "Groceries · 2.0 km",
        meta: "Closes 11 PM",
        reward: "Meal",
        icon: "icon-bag",
      },
      {
        name: "Cafe Coffee Day",
        subtitle: "Cafe · 0.9 km",
        meta: "Open now",
        reward: "Meal",
        icon: "icon-food",
      },
    ],
    history: [
      {
        merchant: "WeWork counter",
        reference: "Ref ID: 1277834681",
        date: "15 Mar 2026",
        amount: "- ₹1,000",
        icon: "icon-food",
      },
      {
        merchant: "Star Bazaar",
        reference: "Ref ID: 1277834604",
        date: "12 Mar 2026",
        amount: "- ₹2,000",
        icon: "icon-bag",
      },
      {
        merchant: "Subway",
        reference: "Ref ID: 1277834591",
        date: "09 Mar 2026",
        amount: "- ₹480",
        icon: "icon-food",
      },
      {
        merchant: "FreshMenu",
        reference: "Ref ID: 1277834528",
        date: "06 Mar 2026",
        amount: "- ₹725",
        icon: "icon-food",
      },
      {
        merchant: "Nature's Basket",
        reference: "Ref ID: 1277834495",
        date: "03 Mar 2026",
        amount: "- ₹1,240",
        icon: "icon-bag",
      },
    ],
  },
  fuel: {
    directoryCopy: "140+ fuel stations",
    selectCopy: "Suggest a fuel partner",
    searchCopy: "Search fuel stations and QR merchants",
    summaryCopy: "Fuel, mobility, and QR merchants available for this wallet",
    viewAllToast: "Fuel Wallet statement opened",
    categories: ["Nearby", "Fuel", "Service", "QR Pay"],
    merchants: [
      {
        name: "Shell Select",
        subtitle: "Fuel station · 0.6 km",
        meta: "Tap + QR",
        reward: "Fuel",
        icon: "icon-fuel",
      },
      {
        name: "HP Petrol Pump",
        subtitle: "Fuel station · 1.4 km",
        meta: "Tap + QR",
        reward: "Fuel",
        icon: "icon-fuel",
      },
      {
        name: "Park+ Fastag Hub",
        subtitle: "Mobility · 2.1 km",
        meta: "QR only",
        reward: "Fuel",
        icon: "icon-car",
      },
      {
        name: "IndianOil COCO",
        subtitle: "Fuel station · 2.5 km",
        meta: "Tap only",
        reward: "Fuel",
        icon: "icon-fuel",
      },
      {
        name: "Bharat Petroleum",
        subtitle: "Fuel station · 3.0 km",
        meta: "Tap + QR",
        reward: "Fuel",
        icon: "icon-fuel",
      },
      {
        name: "DriveU Mobility",
        subtitle: "Mobility · Online",
        meta: "QR only",
        reward: "Fuel",
        icon: "icon-car",
      },
    ],
    history: [
      {
        merchant: "Shell Select",
        reference: "Ref ID: 2277834607",
        date: "16 Mar 2026",
        amount: "- ₹2,200",
        icon: "icon-car",
      },
      {
        merchant: "HP Petrol Pump",
        reference: "Ref ID: 2277834588",
        date: "11 Mar 2026",
        amount: "- ₹1,450",
        icon: "icon-car",
      },
      {
        merchant: "Park+ Fastag Hub",
        reference: "Ref ID: 2277834562",
        date: "08 Mar 2026",
        amount: "- ₹650",
        icon: "icon-car",
      },
      {
        merchant: "IndianOil COCO",
        reference: "Ref ID: 2277834517",
        date: "05 Mar 2026",
        amount: "- ₹2,000",
        icon: "icon-fuel",
      },
      {
        merchant: "Bharat Petroleum",
        reference: "Ref ID: 2277834490",
        date: "02 Mar 2026",
        amount: "- ₹1,800",
        icon: "icon-fuel",
      },
    ],
  },
  misc: {
    directoryCopy: "UPI QR merchants",
    selectCopy: "Suggest reimbursement merchant",
    searchCopy: "Search reimbursement-friendly merchants",
    summaryCopy: "UPI QR merchants eligible for reimbursement-led spends",
    viewAllToast: "Reimbursement Wallet statement opened",
    categories: ["Nearby", "Pharmacy", "Travel", "Services"],
    merchants: [
      {
        name: "Apollo Pharmacy",
        subtitle: "Pharmacy · 0.4 km",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-receipt",
      },
      {
        name: "Urban Company",
        subtitle: "Services · Online",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-settings",
      },
      {
        name: "Cleartrip Counter",
        subtitle: "Travel · 1.7 km",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-send",
      },
      {
        name: "Tata 1mg",
        subtitle: "Pharmacy · Online",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-receipt",
      },
      {
        name: "MakeMyTrip Desk",
        subtitle: "Travel · 2.8 km",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-send",
      },
      {
        name: "Cult Fit Center",
        subtitle: "Wellness · 1.9 km",
        meta: "UPI QR",
        reward: "Reimbursement",
        icon: "icon-settings",
      },
    ],
    history: [
      {
        merchant: "Apollo Pharmacy",
        reference: "Ref ID: 3277834582",
        date: "14 Mar 2026",
        amount: "- ₹850",
        icon: "icon-money",
        status: "Processed",
      },
      {
        merchant: "Urban Company",
        reference: "Ref ID: 3277834539",
        date: "10 Mar 2026",
        amount: "- ₹1,600",
        icon: "icon-money",
        status: "Under review",
      },
      {
        merchant: "Tata 1mg",
        reference: "Ref ID: 3277834506",
        date: "07 Mar 2026",
        amount: "- ₹940",
        icon: "icon-receipt",
        status: "Processed",
      },
      {
        merchant: "Cleartrip Counter",
        reference: "Ref ID: 3277834481",
        date: "04 Mar 2026",
        amount: "- ₹2,300",
        icon: "icon-send",
        status: "Denied",
      },
      {
        merchant: "Cult Fit Center",
        reference: "Ref ID: 3277834455",
        date: "01 Mar 2026",
        amount: "- ₹1,200",
        icon: "icon-settings",
        status: "Under review",
      },
    ],
  },
  gift: {
    directoryCopy: "Gift redemption brands",
    selectCopy: "Suggest gift partner",
    searchCopy: "Search gift redemption partners",
    summaryCopy: "Brand partners and redemption destinations for Gift Wallet",
    viewAllToast: "Gift Wallet statement opened",
    categories: ["Nearby", "Fashion", "Lifestyle", "Gift Cards"],
    merchants: [
      {
        name: "Amazon Pay",
        subtitle: "Gift cards · Online",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-gift",
      },
      {
        name: "Lifestyle Store",
        subtitle: "Fashion · 2.4 km",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-bag",
      },
      {
        name: "Shoppers Stop",
        subtitle: "Lifestyle · 1.9 km",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-grid",
      },
      {
        name: "Myntra",
        subtitle: "Fashion · Online",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-bag",
      },
      {
        name: "BookMyShow",
        subtitle: "Entertainment · Online",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-gift",
      },
      {
        name: "Croma",
        subtitle: "Electronics · 3.1 km",
        meta: "Redeem now",
        reward: "Gift",
        icon: "icon-grid",
      },
    ],
    history: [
      {
        merchant: "Amazon Pay",
        reference: "Ref ID: 4277834561",
        date: "13 Mar 2026",
        amount: "- ₹1,500",
        icon: "icon-bag",
      },
      {
        merchant: "Lifestyle Store",
        reference: "Ref ID: 4277834518",
        date: "08 Mar 2026",
        amount: "- ₹2,400",
        icon: "icon-card",
      },
      {
        merchant: "Myntra",
        reference: "Ref ID: 4277834492",
        date: "05 Mar 2026",
        amount: "- ₹1,100",
        icon: "icon-bag",
      },
      {
        merchant: "BookMyShow",
        reference: "Ref ID: 4277834468",
        date: "02 Mar 2026",
        amount: "- ₹800",
        icon: "icon-gift",
      },
      {
        merchant: "Croma",
        reference: "Ref ID: 4277834437",
        date: "28 Feb 2026",
        amount: "- ₹2,000",
        icon: "icon-grid",
      },
    ],
  },
};

const claimsMockData = {
  canonicalClaim: {
    id: "CLM-2026-0428",
    category: "Telephone & Internet",
    title: "Telephone claim",
    vendor: "Airtel Broadband",
    amount: "₹2,149",
    billDate: "30 Apr 2026",
    submittedDate: "30 Apr 2026",
    approvedDate: "1 May 2026",
    reimbursedDate: "5 May 2026, 2:45 PM",
    balanceAvailable: "₹9,100",
    uploadedDocument: {
      name: "airtel-broadband.pdf",
      size: "248 KB",
      uploadedOn: "30 Apr 2026",
      type: "PDF",
    },
    extractedDetails: {
      vendor: "Airtel Broadband",
      amount: "₹2,149",
      billDate: "30 Apr 2026",
      category: "Telephone & Internet",
      accountNumber: "XXXX XXXX 1234",
      confidenceByField: {
        vendor: "High",
        amount: "High",
        billDate: "High",
        category: "Medium",
        accountNumber: "Medium",
      },
    },
    anomalies: [
      {
        id: "duplicate",
        type: "duplicate",
        severity: "warning",
        title: "Possible duplicate detected",
        description:
          "We found a similar claim for Airtel Broadband on 28 Apr 2026 for ₹2,149.",
        requiredAction:
          "Confirm this is not a duplicate and submit a declaration.",
        similarClaim: {
          id: "CLM-2026-0487",
          date: "28 Apr 2026",
          amount: "₹2,149",
        },
        resolved: false,
      },
      {
        id: "dateWindow",
        type: "dateWindow",
        severity: "warning",
        title: "Bill date outside policy window",
        description:
          "This bill date appears to be older than the allowed reimbursement period.",
        requiredAction:
          "Attach prior approval or explain why the expense is being claimed now.",
        resolved: false,
      },
      {
        id: "lowConfidenceOCR",
        type: "lowConfidenceOCR",
        severity: "error",
        title: "Low-confidence OCR",
        description:
          "The scan is blurry or missing key information. Details may be incomplete.",
        requiredAction: "Re-upload bill or enter missing details manually.",
        resolved: false,
      },
      {
        id: "personalUsage",
        type: "personalUsage",
        severity: "error",
        title: "Possible personal usage",
        description:
          "This amount is higher than typical plans. It may include personal usage or mixed usage.",
        requiredAction:
          "Confirm this is a work expense and submit a compliance declaration.",
        resolved: false,
      },
      {
        id: "limitExceeded",
        type: "limitExceeded",
        severity: "warning",
        title: "Amount exceeds available limit",
        description:
          "This claim amount is higher than the remaining eligible balance for this category.",
        requiredAction:
          "Submit eligible amount, edit amount, or ask a policy question.",
        resolved: false,
      },
    ],
    declarations: [
      "I confirm this claim is accurate, work-related, not claimed before, and complies with the company’s reimbursement policy.",
    ],
    decisionSummary:
      "All policy checks passed. Amount within limits and required document attached.",
  },
  promptCards: [
    {
      id: "telephone",
      title: "Telephone claim",
      subtitle: "Submit a telephone or internet bill",
      icon: "icon-card",
    },
    {
      id: "meal",
      title: "Meal claim",
      subtitle: "Submit meal expenses",
      icon: "icon-food",
    },
    {
      id: "fuel",
      title: "Fuel claim",
      subtitle: "Submit fuel expenses",
      icon: "icon-fuel",
    },
    {
      id: "upload",
      title: "Upload a bill",
      subtitle: "Scan and extract details",
      icon: "icon-receipt",
    },
  ],
  history: [
    {
      id: "CLM-2026-0428",
      title: "Telephone & Internet",
      vendor: "Airtel Broadband",
      amount: "₹2,149",
      date: "30 Apr 2026",
      status: "Pending",
      icon: "icon-card",
    },
    // {
    //   id: "CLM-2026-0417",
    //   title: "Meal claim",
    //   vendor: "Team lunch with client",
    //   amount: "₹1,250",
    //   date: "29 Apr 2026",
    //   status: "Approved",
    //   icon: "icon-food",
    // },
    {
      id: "CLM-2026-0341",
      title: "Driver Salary",
      vendor: "Delhi to Bengaluru",
      amount: "₹2,320",
      date: "29 Apr 2026",
      status: "Pending",
      icon: "icon-send",
    },
    {
      id: "CLM-2026-0398",
      title: "Fuel claim",
      vendor: "Drive to client site",
      amount: "₹1,980",
      date: "27 Apr 2026",
      status: "Approved",
      icon: "icon-fuel",
    },
    // {
    //   id: "CLM-2026-0384",
    //   title: "Travel claim",
    //   vendor: "Bengaluru to Mumbai",
    //   amount: "₹4,850",
    //   date: "24 Apr 2026",
    //   status: "Rejected",
    //   icon: "icon-send",
    // },
    // {
    //   id: "CLM-2026-0372",
    //   title: "Cab/Taxi",
    //   vendor: "Airport pickup",
    //   amount: "₹720",
    //   date: "22 Apr 2026",
    //   status: "Approved",
    //   icon: "icon-car",
    // },
    {
      id: "CLM-2026-0366",
      title: "Software subscription",
      vendor: "Notion Labs, Inc.",
      amount: "₹1,299",
      date: "25 Apr 2026",
      status: "Pending",
      icon: "icon-receipt",
    },
  ],
  dashboard: {
    totalBalance: "₹9,100",
    availableBalance: "₹6,951",
    pendingPayouts: "₹2,149",
    monthlyTotalClaims: 12,
    monthlyClaimedAmount: "₹18,450",
    monthlyReimbursedAmount: "₹8,320",
    statusCounts: [
      { label: "Under review", count: 3, amount: "₹2,840", status: "pending" },
      { label: "Approved", count: 5, amount: "₹8,320", status: "approved" },
      { label: "Rejected", count: 1, amount: "₹1,240", status: "rejected" },
      { label: "Reimbursed", count: 4, amount: "₹6,180", status: "reimbursed" },
    ],
    recentActivity: [
      {
        vendor: "Airtel Broadband",
        amount: "₹2,149",
        status: "Approved",
        meta: "Bill date: 30 Apr 2026",
      },
      {
        vendor: "Telephone & Internet",
        amount: "₹1,299",
        status: "Under review",
        meta: "Bill date: 25 Apr 2026",
      },
      {
        vendor: "Mobile Recharge",
        amount: "₹799",
        status: "Rejected",
        meta: "Bill date: 20 Apr 2026",
      },
      // {
      //   vendor: "Electricity Bill",
      //   amount: "₹1,880",
      //   status: "Reimbursed",
      //   meta: "Bill date: 15 Apr 2026",
      // },
    ],
  },
};

const claimState = {
  view: "home",
  messages: [],
  scanningProgress: 0,
  uploaded: false,
  selectedClaim: null,
  anomalyResolved: false,
  supportingDocumentAttached: false,
  declarationAccepted: [false],
  claimSubmitted: false,
  trackStatus: "submitted",
  historyFilter: "All",
  historySearch: "",
  selectedHistoryId: "CLM-2026-0428",
  isActionMenuOpen: false,
  manualDetails: {
    vendor: "Airtel Broadband",
    amount: "₹2,149",
    billDate: "30 Apr 2026",
  },
  isThinking: false,
  greetingAnimating: false,
};

const CLAIMS_GREETING_TEXT =
  "Hi, I’m your Benefits assistant. Let’s get your claim sorted quickly.";
let claimsGreetingShown = false;

const UPI_SETUP_STEPS = [
  {
    title: "Verifying Wallet",
    detail: "Checking details",
    gif: "./assets/upi-setup/1.gif",
    still: "./assets/upi-setup/1-still.png",
  },
  {
    title: "Creating UPI ID",
    detail: "Setting up identifier",
    gif: "./assets/upi-setup/2.gif",
    still: "./assets/upi-setup/2-still.png",
  },
  {
    title: "Signing you up!",
    detail: "Enabling payments",
    gif: "./assets/upi-setup/3.gif",
    still: "./assets/upi-setup/3-still.png",
  },
  {
    title: "You're all set",
    detail: "A better UPI experience is ready for you!",
    gif: "./assets/upi-setup/4.gif",
    still: "./assets/upi-setup/4-still.png",
  },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readUpiCreatedState() {
  try {
    return window.localStorage.getItem(UPI_CREATED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function applyUpiCreatedState(isCreated) {
  document.body.classList.toggle("is-upi-created", isCreated);

  upiIdValues.forEach((value) => {
    if (isCreated) {
      value.textContent = CREATED_UPI_ID;
      value.dataset.ebPlusText = CREATED_UPI_ID;
      value.dataset.pluspayText = CREATED_UPI_ID;
    }
  });

  upiIdCards.forEach((card) => {
    card.setAttribute(
      "aria-label",
      isCreated ? `UPI ID ${CREATED_UPI_ID}` : "UPI settings",
    );
  });
}

function clearUpiSetupTimer() {
  window.clearTimeout(upiSetupTimer);
}

function renderUpiSetupFlow() {
  if (!upiSetupFlow) return;

  if (upiSetupState.view === "safety") {
    upiSetupFlow.innerHTML = `
      <button class="upi-setup-backdrop" type="button" aria-label="Close UPI setup" data-upi-setup-action="close"></button>
      <section class="upi-setup-screen upi-setup-safety" role="dialog" aria-modal="true" aria-labelledby="upi-safety-title" tabindex="-1" data-upi-setup-dialog>
        <main class="upi-safety-hero">
          <span class="upi-safety-mark" aria-hidden="true">
            <svg viewBox="0 0 96 104"><path d="M48 5 81 17v27c0 24-14 43-33 53C29 87 15 68 15 44V17L48 5Z" fill="currentColor"/><path d="m32 50 10 10 23-25" fill="none" stroke="#0f5d4c" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/></svg>
          </span>
          <h1 id="upi-safety-title">Important</h1>
          <p>Safety Guidelines</p>
        </main>
        <section class="upi-safety-sheet" aria-label="UPI safety guidelines">
          <span class="upi-safety-handle" aria-hidden="true"></span>
          <ul>
            <li>Verify recipient details before confirming payment</li>
            <li>Never share OTP or login credentials with anyone</li>
            <li>Use secure networks - avoid public Wi-Fi</li>
            <li>Don't scan unknown QR codes or click suspicious links</li>
          </ul>
          <span class="upi-setup-powered" aria-hidden="true">POWERED BY <strong>UPI</strong></span>
        </section>
        <footer class="upi-safety-footer">
          <button type="button" class="upi-safety-confirm" data-upi-setup-action="complete">I understand &amp; agree</button>
        </footer>
      </section>
    `;
    bindUpiSetupActions();
    window.requestAnimationFrame(() =>
      upiSetupFlow.querySelector("[data-upi-setup-action='complete']")?.focus(),
    );
    return;
  }

  const step = UPI_SETUP_STEPS[upiSetupState.stage];
  const imageSource = prefersReducedMotion() ? step.still : step.gif;
  const progressItems = UPI_SETUP_STEPS.map(
    (_, index) =>
      `<i class="${index <= upiSetupState.stage ? "is-complete" : ""}" aria-hidden="true"></i>`,
  ).join("");

  upiSetupFlow.innerHTML = `
    <button class="upi-setup-backdrop" type="button" aria-label="Close UPI setup" data-upi-setup-action="close"></button>
    <section class="upi-setup-screen" role="dialog" aria-modal="true" aria-labelledby="upi-setup-title" tabindex="-1" data-upi-setup-dialog>
      <main class="upi-setup-main" aria-live="polite">
        <span class="upi-setup-handle" aria-hidden="true"></span>
        <h1 id="upi-setup-title">Setting up UPI</h1>
        <p>PlusPay</p>
        <img class="upi-setup-illustration" src="${imageSource}" alt="" />
        <div class="upi-setup-progress" aria-label="Step ${upiSetupState.stage + 1} of ${UPI_SETUP_STEPS.length}">${progressItems}</div>
        <span class="upi-setup-step" aria-hidden="true">${upiSetupState.stage + 1}</span>
        <strong>${step.title}</strong>
        <small>${step.detail}</small>
        <span class="upi-setup-processing" aria-label="Processing"><i aria-hidden="true"></i>Processing...</span>
      </main>
      <footer class="upi-setup-footer"><span class="upi-setup-powered" aria-hidden="true">POWERED BY <strong>UPI</strong></span></footer>
    </section>
  `;
  bindUpiSetupActions();
}

function scheduleUpiSetupStep() {
  clearUpiSetupTimer();
  if (upiSetupState.view !== "setup") return;
  upiSetupTimer = window.setTimeout(() => {
    if (!upiSetupFlow?.classList.contains("is-open")) return;
    if (upiSetupState.stage < UPI_SETUP_STEPS.length - 1) {
      upiSetupState.stage += 1;
    } else {
      upiSetupState.view = "safety";
    }
    renderUpiSetupFlow();
    scheduleUpiSetupStep();
  }, UPI_SETUP_STEP_DURATION);
}

function bindUpiSetupActions() {
  if (!upiSetupFlow) return;
  upiSetupFlow.querySelectorAll("[data-upi-setup-action]").forEach((control) => {
    control.addEventListener("click", () => {
      const action = control.dataset.upiSetupAction;
      if (action === "close") closeUpiSetupFlow();
      if (action === "complete") completeUpiSetupFlow();
    });
  });
}

function openUpiSetupFlow() {
  if (document.body.classList.contains("is-no-upi")) return;
  if (!upiSetupFlow || upiSetupFlow.classList.contains("is-open")) return;
  closeCardOverlay();
  closeWalletOverlay();
  closeMerchantDirectory();
  closeManageCardsOverlay();
  closeClaimsAssistant();
  upiSetupState.stage = 0;
  upiSetupState.view = "setup";
  upiSetupFlow.hidden = false;
  renderUpiSetupFlow();
  window.requestAnimationFrame(() => {
    upiSetupFlow.classList.add("is-open");
    upiSetupFlow.querySelector("[data-upi-setup-dialog]")?.focus();
    syncPageScrollLock();
    scheduleUpiSetupStep();
  });
}

function closeUpiSetupFlow() {
  if (!upiSetupFlow || !upiSetupFlow.classList.contains("is-open")) return;
  clearUpiSetupTimer();
  upiSetupFlow.classList.remove("is-open");
  window.setTimeout(() => {
    upiSetupFlow.hidden = true;
    syncPageScrollLock();
  }, 220);
}

function completeUpiSetupFlow() {
  try {
    window.localStorage.setItem(UPI_CREATED_STORAGE_KEY, "true");
  } catch {
    // Keep the current session usable if browser storage is unavailable.
  }
  applyUpiCreatedState(true);
  closeUpiSetupFlow();
  showToast("UPI ID created");
}

function createBaseClaimMessages() {
  return [];
}

function resetClaimJourney() {
  claimState.view = "home";
  claimState.messages = createBaseClaimMessages();
  claimState.scanningProgress = 0;
  claimState.uploaded = false;
  claimState.selectedClaim = null;
  claimState.anomalyResolved = false;
  claimState.supportingDocumentAttached = false;
  claimState.declarationAccepted = [false];
  claimState.claimSubmitted = false;
  claimState.trackStatus = "submitted";
  claimState.historyFilter = "All";
  claimState.historySearch = "";
  claimState.selectedHistoryId = "CLM-2026-0428";
  claimState.isActionMenuOpen = false;
  claimState.isThinking = false;
  claimState.greetingAnimating = false;
}

resetClaimJourney();

function addClaimMessage(role, text, type = "normal") {
  claimState.messages.push({
    id: `msg-${Date.now()}-${claimState.messages.length}`,
    role,
    text,
    type,
    time: claimState.messages.length > 1 ? "9:42 AM" : "9:41 AM",
  });
}

function syncClaimsComposer() {
  if (!claimsInput || !claimsSendButton) return;
  const hasText = Boolean(claimsInput.value.trim());
  claimsSendButton.disabled = !hasText;
  claimsSendButton.setAttribute("aria-disabled", String(!hasText));
  claimsActionMenuButton?.setAttribute(
    "aria-expanded",
    String(claimState.isActionMenuOpen),
  );
  claimsActionMenuButton?.classList.toggle(
    "is-open",
    claimState.isActionMenuOpen,
  );
  if (claimsActionMenu) {
    claimsActionMenu.hidden = !claimState.isActionMenuOpen;
  }
  claimsInput.placeholder =
    claimState.view === "track"
      ? "Ask about this claim..."
      : claimState.view === "detail"
        ? "Ask a question about this claim..."
        : "Ask or upload a bill...";
}

function getClaimAssistantReply(text) {
  const message = text.toLowerCase();
  const claim = claimsMockData.canonicalClaim;
  if (/(policy|eligible|limit|allowed)/.test(message)) {
    return `For ${claim.category}, the assistant checks bill date, duplicate claims, available balance, and whether the expense is work related. This mock flow flags anything that needs clarification before submission.`;
  }
  if (/(status|track|approved|pending|reimbursed|payout)/.test(message)) {
    return `Claim ${claim.id} is currently shown as ${claimState.trackStatus.replace("-", " ")}. You can use the status controls to simulate Pending → Approved → Reimbursed.`;
  }
  if (/(duplicate|same bill|other claim)/.test(message)) {
    return "The duplicate check compares vendor, amount, bill period, and employee profile. In production this would call a claims history and policy rules API.";
  }
  if (/(ocr|scan|extract|bill)/.test(message)) {
    return "The OCR result is mocked here. In production, this is where a real OCR/document AI service would extract bill fields and confidence scores.";
  }
  return `I can help with claim status, policy eligibility, OCR extraction, duplicate checks, compliance declarations, and payout timing for ${claim.vendor}.`;
}

function addLiveClaimBotMessage(text, delay = 520) {
  claimState.isThinking = true;
  renderClaimsAssistant();
  window.setTimeout(() => {
    claimState.isThinking = false;
    addClaimMessage("assistant", text);
    renderClaimsAssistant();
  }, delay);
}

function openClaimsAssistant() {
  if (!claimsAssistant) return;
  closeCardOverlay();
  closeWalletOverlay();
  closeMerchantDirectory();
  closeManageCardsOverlay();
  claimsAssistant.hidden = false;
  if (!claimState.messages.length) resetClaimJourney();
  syncClaimsComposer();
  renderClaimsAssistant();
  window.requestAnimationFrame(() => {
    claimsAssistant.classList.add("is-open");
    syncPageScrollLock();
  });
  maybeAnimateClaimsGreeting();
}

function maybeAnimateClaimsGreeting() {
  if (claimsGreetingShown || claimState.view !== "home") return;
  claimsGreetingShown = true;
  claimState.greetingAnimating = true;
  renderClaimsAssistant();
  window.setTimeout(() => {
    claimState.greetingAnimating = false;
    renderClaimsAssistant();
  }, 900);
}

function closeClaimsAssistant() {
  if (!claimsAssistant) return;
  claimsAssistant.classList.remove("is-open");
  window.setTimeout(() => {
    claimsAssistant.hidden = true;
    syncPageScrollLock();
  }, 260);
}

function goToClaimsView(view) {
  setClaimsActionMenu(false);
  claimState.view = view;
  claimState.isThinking = false;
  renderClaimsAssistant();
}

function goToClaimsHome() {
  resetClaimJourney();
  renderClaimsAssistant();
}

function setClaimsActionMenu(isOpen) {
  claimState.isActionMenuOpen = isOpen;
  claimsActionMenuButton?.setAttribute("aria-expanded", String(isOpen));
  claimsActionMenuButton?.classList.toggle("is-open", isOpen);
  if (claimsActionMenu) {
    claimsActionMenu.hidden = !isOpen;
  }
}

function startClaimFromPrompt(id) {
  const card =
    claimsMockData.promptCards.find((promptCard) => promptCard.id === id) ||
    claimsMockData.promptCards[0];
  claimState.selectedClaim = card.id;
  claimState.view = "claimStart";
  claimState.isActionMenuOpen = false;
  claimState.messages = [
    {
      id: "start-1",
      role: "assistant",
      text: `Sure - let's start your ${card.title}.`,
      time: "9:41 AM",
    },
    {
      id: "start-2",
      role: "user",
      text: `<strong>${card.title}</strong><br><span>${card.subtitle}</span>`,
      time: "9:41 AM",
    },
    {
      id: "start-3",
      role: "assistant",
      text: "Great. Please upload your bill so I can extract the details and check policy compliance.",
      time: "9:41 AM",
    },
  ];
  renderClaimsAssistant();
}

function startTelephoneClaim() {
  setClaimsActionMenu(false);
  claimState.selectedClaim = "telephone";
  claimState.view = "claimStart";
  claimState.messages = [
    {
      id: "start-1",
      role: "assistant",
      text: "Sure — let’s start your Telephone & Internet claim.",
      time: "9:41 AM",
    },
    {
      id: "start-2",
      role: "user",
      text: "<strong>Telephone claim</strong><br><span>Telephone & Internet</span>",
      time: "9:41 AM",
    },
    {
      id: "start-3",
      role: "assistant",
      text: "Great. Please upload your bill so I can extract the details and check policy compliance.",
      time: "9:41 AM",
    },
  ];
  renderClaimsAssistant();
}

function openUploadFlow(addMessage = false) {
  setClaimsActionMenu(false);
  claimState.view = "upload";
  claimState.uploaded = false;
  claimState.scanningProgress = 0;
  if (addMessage) {
    claimState.messages = [
      {
        id: "upload-1",
        role: "assistant",
        text: "Upload your bill and I’ll extract vendor, amount, bill date, category, and account details.",
        time: "9:41 AM",
      },
    ];
  }
  renderClaimsAssistant();
}

function selectMockBill() {
  claimState.uploaded = true;
  renderClaimsAssistant();
}

function quickUploadAndScan() {
  // Device upload shortcut: skip the upload screen and the manual "Start scan"
  // tap by selecting the mock bill and kicking off the scan immediately.
  setClaimsActionMenu(false);
  claimState.uploaded = true;
  claimState.scanningProgress = 0;
  startMockScan();
}

function startMockScan() {
  claimState.view = "scanning";
  claimState.scanningProgress = 0;
  addClaimMessage(
    "assistant",
    "I’m reading the bill and extracting the important details.",
  );
  renderClaimsAssistant();
  const scanTimer = window.setInterval(() => {
    claimState.scanningProgress = Math.min(
      100,
      claimState.scanningProgress + 20,
    );
    renderClaimsAssistant();
    if (claimState.scanningProgress >= 100) {
      window.clearInterval(scanTimer);
      window.setTimeout(() => {
        claimState.view = "extracted";
        addClaimMessage(
          "assistant",
          "Here’s what I found. Please review the extracted details.",
        );
        renderClaimsAssistant();
      }, 320);
    }
  }, 260);
  // Integration point: replace this timer with OCR/document AI progress events.
}

function confirmExtractedDetails() {
  claimState.view = "aiReview";
  addClaimMessage("user", "Looks correct");
  addClaimMessage(
    "assistant",
    "I’ll now check policy limits, duplicates, required documents, and compliance declarations.",
  );
  window.setTimeout(() => {
    addClaimMessage(
      "assistant",
      "I’ve reviewed the bill details. Something similar may have already been submitted.",
      "warning",
    );
    renderClaimsAssistant();
  }, 260);
  renderClaimsAssistant();
  // Integration point: call policy, duplicate, and compliance checks here.
}

function resolveDuplicateClaim(
  response = "Not a duplicate — different period.",
) {
  claimState.anomalyResolved = true;
  claimState.view = "submitReady";
  addClaimMessage("user", response);
  addClaimMessage(
    "assistant",
    "Great, please review the final details and confirm the compliance declaration to submit.",
    "success",
  );
  renderClaimsAssistant();
}

function toggleDeclaration(index) {
  claimState.declarationAccepted[index] =
    !claimState.declarationAccepted[index];
  renderClaimsAssistant();
}

function submitCanonicalClaim() {
  if (!claimState.declarationAccepted.every(Boolean)) {
    showToast("Please accept the compliance declaration to submit");
    return;
  }
  claimState.claimSubmitted = true;
  claimState.view = "track";
  claimState.trackStatus = "submitted";
  addClaimMessage("user", "Submit claim");
  addClaimMessage(
    "assistant",
    "Your claim has been submitted successfully. We’ll keep you updated at every step.",
    "success",
  );
  renderClaimsAssistant();
  // Integration point: replace this with a real claim submission API call.
}

function updateTrackStatus(status) {
  claimState.view = "track";
  claimState.trackStatus = status;
  renderClaimsAssistant();
}

function renderClaimsAssistant() {
  if (!claimsStatus || !claimsThread || !claimsWorkspace) return;
  claimsStatus.hidden = true;
  claimsThread.innerHTML = renderClaimsThread();
  claimsWorkspace.innerHTML = renderClaimsWorkspace();
  bindClaimsWorkspaceActions();
  syncClaimsComposer();
  window.requestAnimationFrame(() => {
    if (["history", "dashboard", "detail"].includes(claimState.view)) {
      claimsScroll?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    claimsScroll?.scrollTo({
      top: claimsScroll.scrollHeight,
      behavior: "smooth",
    });
  });
}

function renderClaimsThread() {
  const shouldShowThread = ![
    "home",
    "history",
    "filteredHistory",
    "detail",
    "dashboard",
    "upload",
    "track",
  ].includes(claimState.view);
  if (!shouldShowThread) return "";
  return renderClaimsMessageStream();
}

function renderClaimsMessageStream() {
  const messages = claimState.messages
    .map((message) => renderClaimMessage(message))
    .join("");
  return (
    messages +
    (claimState.isThinking
      ? renderClaimMessage({
          role: "assistant",
          text: `<span class="claims-mini-typing"><i></i><i></i><i></i></span>`,
          typing: true,
        })
      : "")
  );
}

function renderClaimMessage(message) {
  const isUser = message.role === "user";
  const typingClass = message.typing ? " is-typing" : "";
  const variantClass = message.type ? ` is-${message.type}` : "";
  const time = message.time || "9:41 AM";
  return `
    <div class="claims-message-row ${isUser ? "user" : "bot"}">
      ${isUser ? "" : `<span class="claims-avatar" aria-hidden="true"><svg><use href="#icon-headset" /></svg></span>`}
      <div class="claims-message ${isUser ? "user" : "bot"}${typingClass}${variantClass}">
        <span class="claims-message-text">${message.text}</span>
        ${message.typing ? "" : `<span class="claims-message-meta">${time}${isUser ? `<svg aria-hidden="true"><use href="#icon-checks" /></svg>` : ""}</span>`}
      </div>
    </div>
  `;
}

function renderClaimsWorkspace() {
  if (claimState.view === "home") return renderClaimsHome();
  if (claimState.view === "claimStart") return renderClaimStartActions();
  if (claimState.view === "upload") return renderUploadScreen();
  if (claimState.view === "scanning") return renderScanningScreen();
  if (claimState.view === "extracted") return renderExtractedDetailsScreen();
  if (claimState.view === "aiReview") return renderAIReviewScreen();
  if (claimState.view === "submitReady") return renderSubmitReadyScreen();
  if (claimState.view === "track") return renderTrackClaimScreen();
  if (claimState.view === "history") return renderClaimHistoryScreen("All");
  if (claimState.view === "filteredHistory")
    return renderClaimHistoryScreen("Pending");
  if (claimState.view === "detail") return renderClaimDetailScreen();
  if (claimState.view === "dashboard") return renderClaimDashboardScreen();
  return renderClaimsHome();
}

function renderClaimsHome() {
  const greeting = claimState.greetingAnimating
    ? renderClaimMessage({
        role: "assistant",
        text: `<span class="claims-mini-typing"><i></i><i></i><i></i></span>`,
        typing: true,
      })
    : renderClaimMessage({
        role: "assistant",
        text: CLAIMS_GREETING_TEXT,
      });
  return `
    <section class="claims-home">
      ${renderClaimsQuickActions()}
      ${greeting}
      ${renderClaimsMessageStream()}
    </section>
  `;
}

function renderClaimsQuickActions() {
  const actions = [
    ["dashboard", "Dashboard", "icon-grid"],
    ["history", "History", "icon-receipt"],
    ["policy", "Policy help", "icon-help"],
  ];
  return `
    <div class="claims-quick-action-grid" aria-label="Claims quick actions">
      ${actions
        .map(
          ([action, label, icon]) => `
        <button type="button" class="claims-quick-action-card" data-claims-workspace-action="${action}">
          <span aria-hidden="true"><svg><use href="#${icon}" /></svg></span>
          <strong>${label}</strong>
        </button>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderPromptCard(card) {
  const action =
    card.id === "telephone"
      ? "start-telephone"
      : card.id === "upload"
        ? "upload-start"
        : "policy";
  return `
    <button type="button" class="claims-prompt-card" data-claims-workspace-action="${action}">
      <span aria-hidden="true"><svg><use href="#${card.icon}" /></svg></span>
      <strong>${card.title}</strong>
      <small>${card.subtitle}</small>
    </button>
  `;
}

function renderClaimStartActions() {
  return `
    <section class="claims-upload-options-card">
      <h3>Upload your bill</h3>
      <div class="claims-upload-option-grid">
        ${[
          ["Upload bill", "From device", "icon-plus"],
          ["Take photo", "Use camera", "icon-eye"],
          ["Choose PDF", "Select file", "icon-receipt"],
        ]
          .map(
            ([title, subtitle, icon]) => `
          <button type="button" class="claims-upload-option" data-claims-workspace-action="upload-start">
            <span aria-hidden="true"><svg><use href="#${icon}" /></svg></span>
            <strong>${title}</strong>
            <small>${subtitle}</small>
          </button>
        `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderClaimStepper(activeStep) {
  const steps = ["Upload", "Review", "Verify", "Submit"];
  return `
    <div class="claim-stepper" aria-label="Claim progress">
      ${steps
        .map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          const isDone = stepNumber < activeStep;
          return `
          <span class="${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}">
            <i>${isDone ? "✓" : stepNumber}</i>
            <small>${step}</small>
          </span>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderUploadScreen() {
  const claim = claimsMockData.canonicalClaim;
  return `
    <section class="claims-screen">
      ${renderClaimStepper(1)}
      <button type="button" class="upload-bill-card" data-claims-workspace-action="mock-upload">
        <span aria-hidden="true"><svg><use href="#icon-receipt" /></svg></span>
        <strong>Upload your bill</strong>
        <p>Drag & drop an image or PDF, or tap to browse</p>
        <small>JPG, PNG, PDF • Max 10MB</small>
      </button>
      ${claimState.uploaded ? renderBillPreviewCard() : ""}
      <div class="claims-tips-card">
        <strong>Tips for a better scan</strong>
        <span>✓ Ensure all edges are visible</span>
        <span>✓ No shadows or blur</span>
        <span>✓ Good lighting</span>
      </div>
      ${claimState.uploaded ? `<button type="button" class="wallet-overlay-cta claims-primary-action" data-claims-workspace-action="start-scan"><span class="wallet-overlay-cta-copy"><strong>Start scan</strong></span></button>` : ""}
      <p class="claims-integration-note">Mock upload selected: ${claim.uploadedDocument.name}. Real file validation and storage APIs plug in here.</p>
    </section>
  `;
}

function renderBillPreviewCard() {
  const doc = claimsMockData.canonicalClaim.uploadedDocument;
  return `
    <article class="bill-preview-card">
      <span aria-hidden="true"><svg><use href="#icon-receipt" /></svg></span>
      <div>
        <strong>${doc.name}</strong>
        <small>${doc.type} • ${doc.size}</small>
      </div>
      <button type="button" data-claims-workspace-action="mock-upload">Replace</button>
    </article>
  `;
}

function renderScanningScreen() {
  const progress = claimState.scanningProgress;
  return `
    <section class="claims-screen">
      ${renderClaimStepper(1)}
      ${renderBillPreviewCard()}
      <article class="scanning-progress-card">
        <div class="scanning-progress-head">
          <span class="claims-typing" aria-hidden="true"><i></i><i></i><i></i></span>
          <div>
            <strong>Scanning your bill...</strong>
            <p>Extracting merchant, amount, and bill date</p>
          </div>
          <em>${progress}%</em>
        </div>
        <div class="claims-progress-meter" aria-label="Bill scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" role="progressbar">
          <span class="claims-progress-track"><i style="width: ${progress}%"></i></span>
        </div>
        <div class="scanning-progress-steps" aria-label="Scan checks">
          <span class="${progress >= 25 ? "is-active" : ""}">OCR</span>
          <span class="${progress >= 50 ? "is-active" : ""}">Details</span>
          <span class="${progress >= 75 ? "is-active" : ""}">Policy</span>
        </div>
      </article>
    </section>
  `;
}

function renderExtractedDetailsScreen() {
  return `
    <section class="claims-screen">
      ${renderClaimStepper(2)}
      ${renderExtractedDetailsCard()}
      <div class="claims-action-grid wallet-overlay-mode-switch">
        <button type="button" class="wallet-overlay-mode-button is-active" data-claims-workspace-action="confirm-details">Submit</button>
      </div>
    </section>
  `;
}

function renderExtractedDetailsCard() {
  const details = claimsMockData.canonicalClaim.extractedDetails;
  return `
    <section class="extracted-details-card claims-draft-card wallet-overlay-summary gift">
      <div class="claims-card-head wallet-overlay-section-head">
        <div>
          <span>Extracted details</span>
          <h3>Telephone & Internet</h3>
        </div>
        <small class="wallet-rail-pill is-active">Review</small>
      </div>
      ${[
        ["vendor", "Vendor", details.vendor],
        ["billDate", "Bill date", details.billDate],
        ["amount", "Amount", details.amount],
        ["category", "Category", details.category],
        ["accountNumber", "Account / Number", details.accountNumber],
      ]
        .map(([field, label, value]) =>
          renderExtractedDetailRow(
            field,
            label,
            value,
            details.confidenceByField[field] || "High",
          ),
        )
        .join("")}
    </section>
  `;
}

function renderExtractedDetailRow(field, label, value, confidence) {
  const currentValue = claimState.manualDetails[field] || value;
  const dateValue = parseClaimDateValue(currentValue);
  return `
    <label class="claims-field-row transaction-item is-filled">
      <span class="transaction-icon" aria-hidden="true"><svg><use href="#icon-checks" /></svg></span>
      <span class="transaction-meta">
        <strong>${label} <em>${confidence}</em></strong>
        ${
          field === "billDate"
            ? `
          <span class="claims-detail-date-entry">
            <input value="${currentValue}" data-claims-field="${field}" data-claims-date-display aria-label="${label}" />
            <button type="button" class="claims-period-calendar claims-detail-calendar" data-claims-date-trigger aria-label="Update bill date">
              <svg aria-hidden="true"><use href="#icon-calendar" /></svg>
            </button>
            <input class="claims-period-picker" type="date" value="${dateValue}" data-claims-date-picker aria-label="${label}" />
          </span>
        `
            : `<input value="${currentValue}" data-claims-field="${field}" aria-label="${label}" />`
        }
      </span>
    </label>
  `;
}

function parseClaimDateValue(value) {
  const match = String(value || "").match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/,
  );
  if (!match) return "";
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const month = months[match[2]];
  if (!month) return "";
  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

function formatClaimDateValue(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(",", "");
}

function renderAIReviewScreen() {
  return `
    <section class="claims-screen">
      ${renderClaimStepper(3)}
      ${renderPolicyReviewCard()}
      ${renderAnomalyCard(claimsMockData.canonicalClaim.anomalies[0])}
      ${claimState.anomalyResolved ? "" : renderQuickReplyChips(["Not a duplicate", "Yes, same bill", "Show me the other claim"])}
      <div class="claims-edge-scenarios">
        <button type="button" data-claims-workspace-action="edge-date">Bill date issue</button>
        <button type="button" data-claims-workspace-action="edge-ocr">Low OCR</button>
        <button type="button" data-claims-workspace-action="edge-usage">Personal usage</button>
        <button type="button" data-claims-workspace-action="edge-limit">Limit exceeded</button>
      </div>
    </section>
  `;
}

function renderPolicyReviewCard() {
  return `
    <article class="policy-review-card">
      <span aria-hidden="true"><svg><use href="#icon-refresh" /></svg></span>
      <div>
        <strong>AI policy review</strong>
        <p>Checking policy limits, duplicates, required documents, and compliance declarations.</p>
      </div>
    </article>
  `;
}

function renderAnomalyCard(anomaly) {
  if (anomaly.type === "dateWindow") {
    return `
      <article class="anomaly-card warning">
        <strong>${anomaly.title}</strong>
        <p>${anomaly.description}</p>
        <div class="claim-mini-card"><span>Detected bill date</span><strong>30 Apr 2024</strong><span>Allowed window: 1 May 2024 - Today</span></div>
        ${renderQuickReplyChips(["Attach proof", "It was missed earlier", "Provide explanation"])}
        ${claimState.supportingDocumentAttached ? renderSupportingDocumentUploadCard(true) : renderSupportingDocumentUploadCard(false)}
      </article>
    `;
  }
  if (anomaly.type === "lowConfidenceOCR") {
    return `
      <article class="anomaly-card danger">
        <strong>${anomaly.title}</strong>
        <p>${anomaly.description}</p>
        <ul><li>Vendor: Not detected</li><li>Amount: Unclear</li><li>Bill date: Detected</li></ul>
        <div class="claims-manual-grid">
          <input data-claims-field="vendor" placeholder="e.g., Airtel Broadband" value="${claimState.manualDetails.vendor}" />
          <input data-claims-field="amount" placeholder="e.g., 2,149" value="${claimState.manualDetails.amount}" />
          <input data-claims-field="billDate" placeholder="30 Apr 2026" value="${claimState.manualDetails.billDate}" />
        </div>
        ${renderQuickReplyChips(["Re-upload bill", "Enter manually"])}
      </article>
    `;
  }
  if (anomaly.type === "personalUsage") {
    return `
      <article class="anomaly-card danger">
        <strong>${anomaly.title}</strong>
        <p>${anomaly.description}</p>
        ${renderQuickReplyChips(["This is a work expense", "Mixed usage", "Not sure"])}
      </article>
    `;
  }
  if (anomaly.type === "limitExceeded") {
    return `
      <article class="anomaly-card warning">
        <strong>${anomaly.title}</strong>
        <p>${anomaly.description}</p>
        <div class="claims-metric-grid">
          <span><small>Claim amount</small><strong>₹12,149</strong></span>
          <span><small>Available limit</small><strong>₹9,100</strong></span>
          <span><small>Eligible</small><strong>₹9,100</strong></span>
          <span><small>Not eligible</small><strong>₹3,049</strong></span>
        </div>
        ${renderQuickReplyChips(["Submit eligible amount", "Edit amount", "Ask policy question"])}
      </article>
    `;
  }
  return `
    <article class="anomaly-card warning">
      <strong>${anomaly.title}</strong>
      <p>${anomaly.description}</p>
      <div class="claim-mini-card">
        <span>Similar claim</span>
        <strong>Claim ID: ${anomaly.similarClaim.id}</strong>
        <span>${anomaly.similarClaim.date} • ${anomaly.similarClaim.amount}</span>
      </div>
      <p>Is this the same bill? Please confirm it is not a duplicate and submit a declaration.</p>
    </article>
  `;
}

function renderQuickReplyChips(replies) {
  return `<div class="quick-reply-chips">${replies.map((reply) => `<button type="button" data-claims-reply="${reply}">${reply}</button>`).join("")}</div>`;
}

function renderSupportingDocumentUploadCard(isAttached) {
  return `
    <article class="supporting-document-card">
      <span aria-hidden="true"><svg><use href="#icon-receipt" /></svg></span>
      <div>
        <strong>${isAttached ? "Approval_Late_Claim.pdf" : "Attach prior approval"}</strong>
        <small>${isAttached ? "Uploaded • 9:42 AM" : "PDF, PNG, JPG accepted"}</small>
      </div>
      <button type="button" data-claims-workspace-action="attach-proof">${isAttached ? "Replace" : "Attach"}</button>
    </article>
  `;
}

function renderSubmitReadyScreen() {
  const claim = claimsMockData.canonicalClaim;
  const details = claim.extractedDetails;
  const declarations = claim.declarations;
  return `
    <section class="claims-screen">
      ${renderClaimStepper(4)}
      <section class="claims-review-card wallet-overlay-summary gift">
        <span>Ready to submit</span>
        <h3>${claim.title}</h3>
        <div class="claims-review-amount"><span>Claim amount</span><strong>${claim.amount}</strong></div>
        <div class="claims-submit-summary" aria-label="Claim summary">
          <div><span>Vendor</span><strong>${details.vendor}</strong></div>
          <div><span>Category</span><strong>${details.category}</strong></div>
          <div><span>Bill date</span><strong>${details.billDate}</strong></div>
          <div><span>Available balance</span><strong>${claim.balanceAvailable}</strong></div>
        </div>
        <div class="claims-submit-note">
          <strong>Compliance declaration</strong>
          <p>Confirm the details are accurate before sending this claim for review.</p>
        </div>
        ${declarations
          .map(
            (item, index) => `
        <label class="claims-checkbox-row">
          <input type="checkbox" ${claimState.declarationAccepted[index] ? "checked" : ""} data-claims-declaration="${index}" />
          <span>${item}</span>
        </label>
      `,
          )
          .join("")}
        <button type="button" class="wallet-overlay-cta claims-primary-action" ${claimState.declarationAccepted.every(Boolean) ? "" : "disabled"} data-claims-workspace-action="submit-claim">
          <span class="wallet-overlay-cta-copy"><strong>Submit claim</strong></span>
        </button>
        <small class="claims-helper-text">Submit is enabled after the compliance declaration is accepted.</small>
      </section>
    </section>
  `;
}

function renderTrackClaimScreen() {
  const claim = claimsMockData.canonicalClaim;
  const statusCopy = {
    submitted: [
      "Your claim has been submitted successfully.",
      "We’ll keep you updated at every step.",
    ],
    pending: [
      "Your claim is under review.",
      "The assistant is checking the submitted bill and policy details.",
    ],
    approved: [
      "Great news! Your claim is approved.",
      "It will be reimbursed in the next payout cycle.",
    ],
    reimbursed: [
      "Reimbursement successful!",
      "₹2,149 has been credited to your account.",
    ],
  };
  return `
    <section class="claims-screen">
      ${renderClaimStepper(5)}
      <section class="claim-summary-card">
        <div><span>Claim ID</span><strong>${claim.id}</strong></div>
        <div><span>Category</span><strong>${claim.category}</strong></div>
        <div><span>Claim amount</span><strong>${claim.amount}</strong></div>
        <div><span>Submitted on</span><strong>${claim.submittedDate}</strong></div>
      </section>
      <article class="claim-status-note ${claimState.trackStatus}">
        <span aria-hidden="true"><svg><use href="#${claimState.trackStatus === "approved" || claimState.trackStatus === "reimbursed" ? "icon-checks" : "icon-headset"}" /></svg></span>
        <div><strong>${statusCopy[claimState.trackStatus][0]}</strong><p>${statusCopy[claimState.trackStatus][1]}</p></div>
      </article>
      ${claimState.trackStatus === "approved" ? renderApprovalSummary() : ""}
    </section>
  `;
}

function renderApprovalSummary() {
  const claim = claimsMockData.canonicalClaim;
  return `
    <section class="approval-summary-card">
      <strong>Approval summary</strong>
      <span>Claim type: ${claim.category}</span>
      <span>Amount: ${claim.amount}</span>
      <span>Claim ID: ${claim.id}</span>
      <span>Approved on: ${claim.approvedDate}</span>
      <span>Payout: Paid in next cycle</span>
    </section>
  `;
}

function renderClaimStatusTimeline(activeStatus = "submitted") {
  const steps = [
    ["submitted", "Submitted", "30 Apr 2026, 9:41 AM"],
    ["pending", "Pending review", "30 Apr 2026, 10:15 AM"],
    ["approved", "Approved", "1 May 2026, 11:20 AM"],
    ["reimbursed", "Reimbursed", "5 May 2026, 2:45 PM"],
  ];
  const activeIndex = steps.findIndex(([id]) => id === activeStatus);
  return `
    <section class="claim-status-timeline">
      <h4>Claim status</h4>
      ${steps
        .map(
          ([id, label, date], index) => `
        <article class="${index < activeIndex ? "is-complete" : ""} ${index === activeIndex ? "is-current" : ""}">
          <i>${index <= activeIndex ? "✓" : ""}</i>
          <div><strong>${label}</strong><span>${index <= activeIndex ? date : "Upcoming"}</span></div>
        </article>
      `,
        )
        .join("")}
    </section>
  `;
}

function renderClaimHistoryScreen(filter = "All") {
  const activeFilter =
    filter === "Pending" ? "Pending" : claimState.historyFilter;
  const search = claimState.historySearch.trim().toLowerCase();
  const claims = claimsMockData.history.filter((claim) => {
    const matchesFilter =
      activeFilter === "All" || claim.status === activeFilter;
    const matchesSearch =
      !search ||
      `${claim.title} ${claim.vendor}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
  return `
    <section class="claims-screen">
      <div class="claims-subscreen-head"><h3>Claim history</h3></div>
      <label class="claims-search-bar"><svg><use href="#icon-search" /></svg><input value="${claimState.historySearch}" placeholder="Search claims by category, vendor..." data-claims-history-search /></label>
      <div class="claims-filter-row">
        ${["All", "Pending", "Approved", "Rejected"].map((item) => `<button type="button" class="${activeFilter === item ? "active" : ""}" data-claims-filter="${item}">${item}</button>`).join("")}
      </div>
      ${activeFilter === "Pending" ? `<div class="claims-filter-summary"><strong>Pending (${claims.length})</strong><button type="button" data-claims-workspace-action="clear-filter">Clear filters</button></div>` : ""}
      <div class="claim-history-list">
        ${claims.length ? claims.map(renderClaimHistoryListItem).join("") : renderEmptyClaimsState(activeFilter === "All" ? "No claims yet" : "No claims match this filter")}
      </div>
    </section>
  `;
}

function renderClaimHistoryListItem(claim) {
  return `
    <button type="button" class="claim-history-item" data-claims-detail="${claim.id}">
      <span class="transaction-icon"><svg><use href="#${claim.icon}" /></svg></span>
      <span class="transaction-meta"><strong>${claim.title}</strong><span>${claim.vendor}</span></span>
      <span class="transaction-amount"><strong>${claim.amount}</strong><span>${claim.date}</span>${renderStatusBadge(claim.status)}</span>
    </button>
  `;
}

function renderEmptyClaimsState(copy) {
  return `<article class="claims-empty-inline"><strong>${copy}</strong><button type="button" data-claims-workspace-action="start-telephone">Start a claim</button></article>`;
}

function renderClaimDetailScreen() {
  const claim = claimsMockData.canonicalClaim;
  return `
    <section class="claims-screen">
      <div class="claims-subscreen-head"><h3>Claim details</h3></div>
      <section class="claim-detail-summary">
        ${renderStatusBadge("Approved")}
        <div class="claim-detail-title"><div><strong>${claim.category}</strong><span>${claim.vendor}</span></div><strong>${claim.amount}</strong></div>
        <small>${claim.id}</small>
        <div class="claims-detail-chip-row"><span>Bill date<br><strong>${claim.billDate}</strong></span><span>Vendor<br><strong>${claim.vendor}</strong></span><span>Category<br><strong>${claim.category}</strong></span></div>
      </section>
      ${renderClaimStatusTimeline("approved")}
      <article class="supporting-document-card">
        <span aria-hidden="true"><svg><use href="#icon-receipt" /></svg></span>
        <div><strong>airtel-broadband-bill-apr.pdf</strong><small>Uploaded on 30 Apr 2026</small></div>
        <button type="button" data-toast="Document preview opened">View</button>
      </article>
      <section class="decision-summary-card"><strong>Decision summary</strong><p>${claim.decisionSummary}</p><button type="button" data-claims-workspace-action="thread">View full thread</button></section>
    </section>
  `;
}

function renderClaimDashboardScreen() {
  const dashboard = claimsMockData.dashboard;
  return `
    <section class="claims-screen">
      <div class="claims-subscreen-head"><h3>Claim dashboard</h3></div>
      <section class="dashboard-month-card"><span>This month: Apr 2026</span><div><p><b>${dashboard.monthlyTotalClaims}</b><small>Total claims</small></p><p><b>${dashboard.monthlyClaimedAmount}</b><small>Claimed amount</small></p><p><b>${dashboard.monthlyReimbursedAmount}</b><small>Reimbursed</small></p></div></section>
      <div class="dashboard-metric-grid">${dashboard.statusCounts.map((metric) => renderMetricCard(metric)).join("")}</div>
      <section class="dashboard-chart-card">
        <h4>Status analytics</h4>
        <div class="claims-donut" aria-hidden="true"><span>12<br><small>Total</small></span></div>
        <div class="dashboard-insights"><p>Average approval time <strong>2.4 days</strong></p><p>Pending payout amount <strong>${dashboard.pendingPayouts}</strong></p><p>Approved this month <strong>5</strong></p></div>
      </section>
      <section class="dashboard-activity-card"><h4>Recent activity</h4>${dashboard.recentActivity.map((item) => `<article><span>${item.vendor}<small>${item.meta}</small></span><strong>${item.amount}<em>${item.status}</em></strong></article>`).join("")}</section>
      <section class="dashboard-activity-card"><h4>Upcoming reimbursements</h4><article><span>2 payouts scheduled<small>Next payout on 07 May 2026</small></span><strong>${dashboard.pendingPayouts}</strong></article></section>
      <div class="dashboard-action-list">${[
        ["Start a claim", "start-telephone"],
        ["Track claim", "track"],
        ["View history", "history"],
        ["Ask policy question", "policy"],
      ]
        .map(
          ([label, action]) =>
            `<button type="button" data-claims-workspace-action="${action}">${label}<svg><use href="#icon-arrow-right" /></svg></button>`,
        )
        .join("")}</div>
    </section>
  `;
}

function renderMetricCard(metric) {
  return `<article class="metric-card ${metric.status}"><span>${metric.label}</span><strong>${metric.count}</strong><small>${metric.amount}</small></article>`;
}

function renderStatusBadge(status) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-badge ${key}">${status}</span>`;
}

function bindClaimsWorkspaceActions() {
  claimsWorkspace
    ?.querySelectorAll("[data-claims-workspace-action]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        handleClaimsAction(button.dataset.claimsWorkspaceAction),
      );
    });
  claimsWorkspace?.querySelectorAll("[data-claims-reply]").forEach((button) => {
    button.addEventListener("click", () =>
      handleClaimsReply(button.dataset.claimsReply),
    );
  });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-declaration]")
    .forEach((input) => {
      input.addEventListener("change", () =>
        toggleDeclaration(Number(input.dataset.claimsDeclaration)),
      );
    });
  claimsWorkspace?.querySelectorAll("[data-claims-field]").forEach((input) => {
    input.addEventListener("input", () => {
      claimState.manualDetails[input.dataset.claimsField] = input.value;
    });
  });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-date-display]")
    .forEach((input) => {
      input.addEventListener("click", () => {
        const picker = input
          .closest(".claims-detail-date-entry")
          ?.querySelector("[data-claims-date-picker]");
        picker?.showPicker?.();
      });
    });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-date-trigger]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const picker = button
          .closest(".claims-detail-date-entry")
          ?.querySelector("[data-claims-date-picker]");
        picker?.showPicker?.();
      });
    });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-date-picker]")
    .forEach((picker) => {
      picker.addEventListener("change", () => {
        const dateEntry = picker.closest(".claims-detail-date-entry");
        const displayInput = dateEntry?.querySelector(
          "[data-claims-date-display]",
        );
        const formattedDate = formatClaimDateValue(picker.value);
        if (!displayInput || !formattedDate) return;
        displayInput.value = formattedDate;
        claimState.manualDetails.billDate = formattedDate;
      });
    });
  claimsWorkspace?.querySelectorAll("[data-claims-track]").forEach((button) => {
    button.addEventListener("click", () =>
      updateTrackStatus(button.dataset.claimsTrack),
    );
  });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-filter]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        claimState.historyFilter = button.dataset.claimsFilter;
        claimState.view =
          button.dataset.claimsFilter === "Pending"
            ? "filteredHistory"
            : "history";
        renderClaimsAssistant();
      });
    });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-history-search]")
    .forEach((input) => {
      input.addEventListener("input", () => {
        claimState.historySearch = input.value;
        renderClaimsAssistant();
      });
    });
  claimsWorkspace
    ?.querySelectorAll("[data-claims-detail]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        claimState.selectedHistoryId = button.dataset.claimsDetail;
        goToClaimsView("detail");
      });
    });
}

function handleClaimsReply(reply) {
  if (reply === "Not a duplicate")
    resolveDuplicateClaim("Not a duplicate — different period.");
  else if (reply === "Attach proof") {
    claimState.supportingDocumentAttached = true;
    addClaimMessage("user", "Attaching email approval for late claim.");
    addClaimMessage(
      "assistant",
      "Thanks! I’ll review the approval and update the claim.",
    );
    renderClaimsAssistant();
  } else if (reply === "This is a work expense") {
    resolveDuplicateClaim("This is a work expense.");
  } else {
    addClaimMessage("user", reply);
    addLiveClaimBotMessage(getClaimAssistantReply(reply), 420);
  }
}

function handleClaimsAction(action) {
  if (action === "toggle-claim-menu") {
    setClaimsActionMenu(!claimState.isActionMenuOpen);
    return;
  }
  setClaimsActionMenu(false);
  if (action === "home") goToClaimsHome();
  if (action === "history") goToClaimsView("history");
  if (action === "track") goToClaimsView("track");
  if (action === "dashboard") goToClaimsView("dashboard");
  if (action === "start-telephone") startTelephoneClaim();
  if (action === "start-meal") startClaimFromPrompt("meal");
  if (action === "start-fuel") startClaimFromPrompt("fuel");
  if (action === "upload") openUploadFlow(true);
  if (action === "upload-start") quickUploadAndScan();
  if (action === "mock-upload") selectMockBill();
  if (action === "start-scan") startMockScan();
  if (action === "confirm-details") confirmExtractedDetails();
  if (action === "edit-details") showToast("Fields are editable inline");
  if (action === "submit-claim") submitCanonicalClaim();
  if (action === "clear-filter") {
    claimState.historyFilter = "All";
    claimState.historySearch = "";
    goToClaimsView("history");
  }
  if (action === "thread") {
    claimState.messages = [
      {
        role: "assistant",
        text: "Here is the full thread for this Airtel Broadband claim. The duplicate concern was resolved with your declaration.",
        time: "9:41 AM",
      },
      {
        role: "user",
        text: "Not a duplicate — different period.",
        time: "9:42 AM",
      },
      {
        role: "assistant",
        text: "All checks passed and the claim was approved.",
        time: "9:43 AM",
        type: "success",
      },
    ];
    goToClaimsView("aiReview");
  }
  if (action === "policy")
    addLiveClaimBotMessage(
      "I can explain eligible categories, duplicate checks, reimbursement windows, available balance, and required declarations.",
      420,
    );
  if (action?.startsWith("edge-")) {
    const map = {
      "edge-date": 1,
      "edge-ocr": 2,
      "edge-usage": 3,
      "edge-limit": 4,
    };
    addClaimMessage(
      "assistant",
      "Here’s another possible edge scenario the assistant can handle.",
      "warning",
    );
    claimsWorkspace.innerHTML = `<section class="claims-screen">${renderClaimStepper(3)}${renderAnomalyCard(claimsMockData.canonicalClaim.anomalies[map[action]])}</section>`;
    bindClaimsWorkspaceActions();
  }
}

const claimsAssistantData = {
  wallet: {
    name: "Reimbursement Wallet",
    balance: "₹9,100",
    monthlyLimit: "₹15,000",
    used: "₹4,699",
  },
  uploadClaim: {
    id: "CLM-43872",
    category: "Telephone & Internet",
    vendor: "Airtel Broadband",
    provider: "Airtel Broadband",
    amount: "₹1,299",
    billDate: "12 May 2026",
    billingMonth: "May 2026",
    invoiceNo: "INV-AT-9021",
    confidence: "96%",
    document: {
      name: "Airtel_Broadband_May.pdf",
      size: "1.2 MB",
      type: "PDF",
    },
  },
  dashboard: {
    metrics: [
      ["Available balance", "₹9,100"],
      ["Claimed this month", "₹4,699"],
      ["Pending claims", "₹3,400"],
      ["Approved this month", "₹1,299"],
      ["Rejected", "₹0"],
    ],
    categories: [
      ["Telephone & Internet", "₹1,299"],
      ["Fuel & Maintenance", "₹3,400"],
      ["Professional Development", "₹0"],
      ["Driver Salary", "₹0"],
    ],
    recent: [
      ["CLM-43872", "Airtel Broadband", "₹1,299", "Under review"],
      ["CLM-42812", "Indian Oil", "₹3,400", "Needs info"],
      ["CLM-40111", "Coursera", "₹7,999", "Approved"],
    ],
  },
  policies: {
    "Telephone & Internet": [
      "Monthly mobile/internet bills are eligible",
      "Bill must show name/number, billing period, amount, and date",
      "Duplicate claim for same month is not allowed",
    ],
    "Fuel & Maintenance": [
      "Fuel receipts and vehicle maintenance invoices are eligible",
      "Vehicle number is required",
      "Blurry receipts or missing amount/date cannot be submitted",
    ],
    "Professional Development": [
      "Courses, certifications, and conferences are eligible",
      "Invoice and course name are required",
      "Approval or completion proof may be required",
    ],
    "Driver Salary": [
      "Monthly driver salary can be claimed",
      "Driver name, month, amount, and payment proof are required",
      "Cash payment requires signed receipt/declaration",
    ],
  },
  history: [
    {
      id: "CLM-43872",
      vendor: "Airtel Broadband",
      amount: "₹1,299",
      category: "Telephone & Internet",
      status: "Under review",
      submitted: "12 May 2026",
      icon: "icon-card",
      timelineStatus: "under-review",
    },
    {
      id: "CLM-42812",
      vendor: "Indian Oil",
      amount: "₹3,400",
      category: "Fuel & Maintenance",
      status: "Needs info",
      submitted: "11 May 2026",
      icon: "icon-fuel",
      timelineStatus: "needs-info",
    },
    {
      id: "CLM-40111",
      vendor: "Coursera",
      amount: "₹7,999",
      category: "Professional Development",
      status: "Approved",
      submitted: "03 May 2026",
      icon: "icon-receipt",
      timelineStatus: "approved",
    },
  ],
};

const claimsScenarioAliases = {
  "duplicate month": "duplicate-month",
  duplicate: "duplicate-month",
  "missing billing period": "missing-billing-period",
  "name mismatch": "name-mismatch",
  "amount mismatch": "amount-mismatch",
  "missing vehicle number": "missing-vehicle-number",
  "blurry receipt": "blurry-receipt",
  blurry: "blurry-receipt",
  "future date": "future-date",
  "invalid bill type": "invalid-bill-type",
  "multiple items": "multiple-items",
  "missing course name": "missing-course-name",
  "missing approval proof": "missing-approval",
  "missing completion certificate": "missing-completion",
  "payment screenshot": "payment-screenshot",
  "personal subscription": "personal-subscription",
  "missing driver name": "missing-driver-name",
  "missing month": "missing-month",
  "payment proof missing": "payment-proof-missing",
  "cash receipt not signed": "cash-receipt-not-signed",
  "driver limit exceeded": "driver-limit-exceeded",
  "unsupported file": "unsupported-file",
  "file too large": "file-too-large",
  "network error": "network-failure",
  "ocr failed": "ocr-failed",
  "wallet balance": "wallet-balance-insufficient",
  "policy limit": "policy-limit-exceeded",
  "duplicate invoice": "duplicate-invoice",
  timeout: "session-timeout",
};

let claimMessageCounter = 0;

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHTML(value).replace(/`/g, "&#096;");
}

function claimIcon(id) {
  return `<svg aria-hidden="true"><use href="#${id}" /></svg>`;
}

function getClaimMessageTime() {
  return claimState.messages.length < 4 ? "10:30 AM" : "10:31 AM";
}

function beginClaimsFlow(view = "chat") {
  claimState.view = view;
  claimState.flowToken = (claimState.flowToken || 0) + 1;
  claimState.isActionMenuOpen = false;
  setClaimsActionMenu(false);
  return claimState.flowToken;
}

function isActiveClaimsFlow(token) {
  return claimState.flowToken === token;
}

function resetWorkspace() {
  if (claimsWorkspace) claimsWorkspace.innerHTML = "";
}

function resetClaimJourney() {
  claimState.view = "home";
  claimState.messages = [];
  claimState.scanningProgress = 0;
  claimState.uploaded = false;
  claimState.selectedClaim = null;
  claimState.anomalyResolved = false;
  claimState.supportingDocumentAttached = false;
  claimState.declarationAccepted = [false];
  claimState.claimSubmitted = false;
  claimState.trackStatus = "under-review";
  claimState.historyFilter = "All";
  claimState.historySearch = "";
  claimState.selectedHistoryId = "CLM-43872";
  claimState.isActionMenuOpen = false;
  claimState.manualDetails = {};
  claimState.isThinking = false;
  claimState.greetingAnimating = false;
  claimState.activeJourney = "home";
  claimState.awaiting = "";
  claimState.flowToken = (claimState.flowToken || 0) + 1;
}

function addClaimMessage(role, text, type = "normal") {
  claimState.messages.push({
    id: `claim-chat-${++claimMessageCounter}`,
    kind: "message",
    role,
    text,
    type,
    time: getClaimMessageTime(),
  });
  renderClaimsAssistant();
}

function addUserMessage(text) {
  addClaimMessage("user", escapeHTML(text));
}

function addBotMessage(text, type = "normal") {
  addClaimMessage("assistant", text, type);
}

function addTypingIndicator() {
  claimState.isThinking = true;
  renderClaimsAssistant();
}

function removeTypingIndicator() {
  claimState.isThinking = false;
  renderClaimsAssistant();
}

function addQuickReplies(replies) {
  const visibleReplies = replies.flatMap((reply) => {
    const label = typeof reply === "string" ? reply : reply.label;
    return label === "Claim history" ? [reply, "View chat history"] : [reply];
  });

  claimState.messages.push({
    id: `claim-chat-${++claimMessageCounter}`,
    kind: "quickReplies",
    replies: visibleReplies.map((reply) =>
      typeof reply === "string" ? { label: reply, action: reply } : reply,
    ),
    time: getClaimMessageTime(),
  });
  renderClaimsAssistant();
}

function addInlineCard(html, cardType = "generic") {
  claimState.messages.push({
    id: `claim-chat-${++claimMessageCounter}`,
    kind: "card",
    role: "assistant",
    html,
    cardType,
    time: getClaimMessageTime(),
  });
  renderClaimsAssistant();
}

function scrollClaimsToBottom(behavior = "smooth") {
  window.requestAnimationFrame(() => {
    claimsScroll?.scrollTo({
      top: claimsScroll.scrollHeight,
      behavior,
    });
  });
}

function simulateDelay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function botSay(text, delay = 420, type = "normal", token) {
  addTypingIndicator();
  await simulateDelay(delay);
  if (token && !isActiveClaimsFlow(token)) return;
  removeTypingIndicator();
  addBotMessage(text, type);
}

async function botCard(html, delay = 280, cardType = "generic", token) {
  addTypingIndicator();
  await simulateDelay(delay);
  if (token && !isActiveClaimsFlow(token)) return;
  removeTypingIndicator();
  addInlineCard(html, cardType);
}

function renderHomeJourney() {
  resetClaimJourney();
  resetWorkspace();
  addBotMessage(
    "Hi Vishal Sharma 👋 I can help you claim reimbursements from your Reimbursement Wallet. What would you like to do?",
  );
  addQuickReplies([
    "Upload bill",
    "View dashboard",
    "View policy",
    "Claim history",
  ]);
}

async function startUploadBillJourney() {
  const token = beginClaimsFlow("upload");
  claimState.activeJourney = "upload";
  await botSay(
    "Sure. Upload a bill and I’ll read it for you.",
    380,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderUploadOptionsCard(), "upload-options");
}

async function simulateBillUploadJourney() {
  const token = beginClaimsFlow("upload-scan");
  claimState.declarationAccepted = [false];
  const claim = claimsAssistantData.uploadClaim;
  addInlineCard(renderFilePreviewCard(claim.document), "file-preview");
  await botSay("Reading your bill...", 520, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderScanningCard(), "scanning");
  await simulateDelay(1250);
  if (!isActiveClaimsFlow(token)) return;
  await botSay(
    "I found an Airtel Broadband bill. It looks like a Telephone & Internet claim.",
    360,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderExtractionCard(), "extraction");
  addQuickReplies(["Looks good", "Edit details", "Change category"]);
}

async function continueUploadValidationJourney() {
  const token = beginClaimsFlow("validate");
  await botSay(
    "Great. I’ll check your wallet balance and policy eligibility.",
    420,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderValidationCard(), "validation");
  await simulateDelay(900);
  if (!isActiveClaimsFlow(token)) return;
  await botSay("Everything looks good. Ready to submit?", 320, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderFinalReviewCard(), "final-review");
}

async function submitClaimJourney() {
  if (!claimState.declarationAccepted[0]) {
    showToast("Please confirm the declaration to submit");
    return;
  }
  const token = beginClaimsFlow("submit");
  addUserMessage("Submit claim");
  await botSay("Done 🎉 Your claim has been submitted.", 650, "success", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderSuccessCard(), "success");
  addQuickReplies(["Track status", "Submit another claim", "View dashboard"]);
}

async function renderDashboardJourney() {
  const token = beginClaimsFlow("dashboard");
  await botSay(
    "Here’s your Reimbursement Wallet dashboard.",
    360,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderDashboardCard(), "dashboard");
  addQuickReplies(["Upload bill", "View policy", "Claim history"]);
}

async function renderPolicyJourney(category = "") {
  const token = beginClaimsFlow("policy");
  if (!category) {
    await botSay(
      "Here’s the reimbursement policy summary. Which category do you want to check?",
      360,
      "normal",
      token,
    );
    if (!isActiveClaimsFlow(token)) return;
    addQuickReplies([
      "Telephone & Internet",
      "Fuel & Maintenance",
      "Professional Development",
      "Driver Salary",
      "All categories",
    ]);
    return;
  }

  if (category === "All categories") {
    addInlineCard(renderPolicySummaryCard(), "policy-summary");
    addQuickReplies(["Upload bill", "Ask about a category", "Claim history"]);
    return;
  }

  addInlineCard(renderPolicyCategoryCard(category), "policy-category");
  await botSay("Do you want to start this claim now?", 280, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addQuickReplies(["Start claim", "View another policy"]);
}

async function renderClaimHistoryJourney(filter = "All") {
  const token = beginClaimsFlow("history");
  claimState.historyFilter = filter;
  await botSay(
    "Here are your recent reimbursement claims.",
    360,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderClaimHistoryCard(filter), "history");
}

async function renderClaimDetailJourney(id) {
  const token = beginClaimsFlow("claim-detail");
  const claim =
    claimsAssistantData.history.find((item) => item.id === id) ||
    claimsAssistantData.history[0];
  claimState.selectedHistoryId = claim.id;
  await botSay(`Here’s the detail for ${claim.id}.`, 300, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderClaimDetailCard(claim), "claim-detail");
  if (claim.id === "CLM-42812") {
    await botSay(
      "This fuel claim needs your vehicle number before it can be submitted further.",
      360,
      "warning",
      token,
    );
    if (!isActiveClaimsFlow(token)) return;
    addQuickReplies(["Add vehicle number", "Upload different bill"]);
  }
}

async function renderClaimStatusJourney() {
  const token = beginClaimsFlow("status");
  await botSay("Here’s the latest status of your claim.", 300, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(renderClaimStatusCard(), "status");
  addQuickReplies(["View dashboard", "Claim history", "Submit another claim"]);
}

async function startTelephoneJourney() {
  const token = beginClaimsFlow("telephone");
  await botSay(
    "Telephone & Internet claims are checked for billing month, employee name, amount, invoice number, and duplicate month.",
    360,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(
    renderPolicyCategoryCard("Telephone & Internet"),
    "policy-category",
  );
  addQuickReplies([
    "Upload bill",
    "Duplicate month",
    "Missing billing period",
    "Name mismatch",
    "Amount mismatch",
  ]);
}

async function startFuelJourney() {
  const token = beginClaimsFlow("fuel");
  await botSay("Let’s read a Fuel & Maintenance bill.", 320, "normal", token);
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(
    renderMockExtractionCard({
      title: "IndianOil_Receipt.jpg",
      icon: "icon-fuel",
      rows: [
        ["Category", "Fuel & Maintenance"],
        ["Vendor", "Indian Oil"],
        ["Amount", "₹3,400"],
        ["Date", "11 May 2026"],
        ["Vehicle number", "Not found"],
      ],
      tone: "warning",
    }),
    "fuel-extraction",
  );
  await botSay(
    "I couldn’t find the vehicle number. Please enter it.",
    360,
    "warning",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  claimState.awaiting = "vehicle-number";
  addQuickReplies([
    "DL01AB1234",
    "Missing vehicle number",
    "Blurry receipt",
    "Future date",
    "Invalid bill type",
    "Multiple items",
  ]);
}

async function startProfessionalDevelopmentJourney() {
  const token = beginClaimsFlow("professional-development");
  await botSay(
    "I found a Professional Development claim from Coursera.",
    340,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  addInlineCard(
    renderMockExtractionCard({
      title: "Coursera_AI_PM.pdf",
      icon: "icon-receipt",
      rows: [
        ["Category", "Professional Development"],
        ["Provider", "Coursera"],
        ["Course", "AI Product Management"],
        ["Amount", "₹7,999"],
        ["Date", "03 May 2026"],
      ],
      footer: "This category may need approval or completion proof.",
    }),
    "professional-extraction",
  );
  addQuickReplies([
    "Upload approval",
    "Missing course name",
    "Missing approval proof",
    "Missing completion certificate",
    "Payment screenshot",
    "Personal subscription",
  ]);
}

async function startDriverSalaryJourney() {
  const token = beginClaimsFlow("driver-salary");
  await botSay(
    "Driver salary claims need a few details. I’ll ask only what’s required.",
    340,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  await botSay(
    "I need the driver’s name to continue. What’s the driver’s name?",
    260,
    "normal",
    token,
  );
  if (!isActiveClaimsFlow(token)) return;
  claimState.awaiting = "driver-name";
  addQuickReplies([
    "Ramesh Kumar",
    "Enter manually",
    "Missing driver name",
    "Payment proof missing",
    "Cash receipt not signed",
    "Driver limit exceeded",
  ]);
}

async function renderErrorScenario(type) {
  const scenario = getErrorScenario(type);
  if (!scenario) return;
  const token = beginClaimsFlow(`error-${type}`);
  await botSay(scenario.message, 300, scenario.tone || "warning", token);
  if (!isActiveClaimsFlow(token)) return;
  if (scenario.card) addInlineCard(scenario.card, scenario.cardType || "error");
  if (scenario.replies?.length) addQuickReplies(scenario.replies);
}

function renderUploadOptionsCard() {
  return `
    <article class="claims-inline-card upload-options">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-receipt")}</span>
        <div><strong>Upload options</strong><small>PDF, JPG or PNG up to 10 MB</small></div>
      </div>
      <div class="claims-option-list">
        ${[
          ["Take photo", "icon-eye"],
          ["Upload PDF", "icon-receipt"],
          ["Choose from gallery", "icon-image"],
        ]
          .map(
            ([label, icon]) => `
          <button type="button" data-claims-workspace-action="simulate-upload" data-user-message="${escapeAttribute(label)}">
            <span aria-hidden="true">${claimIcon(icon)}</span>
            <strong>${label}</strong>
          </button>
        `,
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderFilePreviewCard(doc) {
  return `
    <article class="claims-inline-card file-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-receipt")}</span>
        <div><strong>${doc.name}</strong><small>${doc.type} • ${doc.size}</small></div>
      </div>
      <span class="claims-card-status success">Uploaded</span>
    </article>
  `;
}

function renderScanningCard() {
  return `
    <article class="claims-inline-card scan-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-scan")}</span>
        <div><strong>Scanning bill...</strong><small>Extracting key details from your document</small></div>
      </div>
      <div class="claims-scan-steps">
        ${[
          "Vendor detected",
          "Amount detected",
          "Bill date detected",
          "Checking policy",
        ]
          .map((step) => `<span>${claimIcon("icon-checks")}${step}</span>`)
          .join("")}
      </div>
    </article>
  `;
}

function renderExtractionCard() {
  const claim = claimsAssistantData.uploadClaim;
  return `
    <article class="claims-inline-card extraction-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-card")}</span>
        <div><strong>Claim details extracted</strong><small>Confidence ${claim.confidence}</small></div>
      </div>
      ${renderClaimsDataGrid([
        ["Category", claim.category],
        ["Vendor", claim.vendor],
        ["Amount", claim.amount],
        ["Bill date", claim.billDate],
        ["Billing month", claim.billingMonth],
        ["Invoice no", claim.invoiceNo],
      ])}
    </article>
  `;
}

function renderValidationCard() {
  return `
    <article class="claims-inline-card scan-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-wallet")}</span>
        <div><strong>Validating policy...</strong><small>Wallet balance, policy and duplicate checks</small></div>
      </div>
      <div class="claims-scan-steps">
        ${[
          "Wallet balance available",
          "Monthly policy matched",
          "Invoice number unique",
          "No duplicate month found",
        ]
          .map((step) => `<span>${claimIcon("icon-checks")}${step}</span>`)
          .join("")}
      </div>
    </article>
  `;
}

function renderFinalReviewCard() {
  const isChecked = Boolean(claimState.declarationAccepted[0]);
  return `
    <article class="claims-inline-card final-review-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-claim")}</span>
        <div><strong>Final review</strong><small>Reimbursement Wallet</small></div>
      </div>
      ${renderClaimsDataGrid([
        ["Wallet", "Reimbursement Wallet"],
        ["Category", "Telephone & Internet"],
        ["Amount", "₹1,299"],
        ["Balance before", "₹9,100"],
        ["Balance after", "₹7,801"],
        ["Document", "Airtel_Broadband_May.pdf"],
      ])}
      <label class="claims-declaration">
        <input type="checkbox" ${isChecked ? "checked" : ""} data-claims-declaration="0" />
        <span>I confirm this claim is genuine and not submitted earlier.</span>
      </label>
      <button type="button" class="claims-primary-action" ${isChecked ? "" : "disabled"} data-claims-workspace-action="submit-claim">
        Submit claim
      </button>
    </article>
  `;
}

function renderSuccessCard() {
  return `
    <article class="claims-inline-card success-card">
      <div class="claims-success-mark">${claimIcon("icon-checks")}</div>
      <strong>Claim submitted</strong>
      ${renderClaimsDataGrid([
        ["Claim ID", "CLM-43872"],
        ["Amount", "₹1,299"],
        ["Status", "Under review"],
        ["Expected update", "2 working days"],
      ])}
    </article>
  `;
}

function renderDashboardCard() {
  const dashboard = claimsAssistantData.dashboard;
  return `
    <article class="claims-inline-card dashboard-chat-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-wallet")}</span>
        <div><strong>Reimbursement Wallet dashboard</strong><small>May 2026 overview</small></div>
      </div>
      ${renderClaimsDataGrid(dashboard.metrics)}
      <div class="claims-usage-block">
        <div><span>Used: ₹4,699</span><strong>Monthly limit: ₹15,000</strong><span>Available: ₹9,100</span></div>
        <i><b style="width:31%"></b></i>
      </div>
      <section class="claims-card-section">
        <strong>Category breakdown</strong>
        ${dashboard.categories.map(([label, value]) => `<p><span>${label}</span><b>${value}</b></p>`).join("")}
      </section>
      <section class="claims-card-section">
        <strong>Recent activity</strong>
        ${dashboard.recent
          .map(
            ([id, vendor, amount, status]) =>
              `<button type="button" data-claims-workspace-action="claim-detail" data-claim-id="${id}"><span>${id}<small>${vendor}</small></span><b>${amount}<em>${status}</em></b></button>`,
          )
          .join("")}
      </section>
    </article>
  `;
}

function renderPolicySummaryCard() {
  return `
    <article class="claims-inline-card policy-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-help")}</span>
        <div><strong>Reimbursement Wallet Policy</strong><small>All categories</small></div>
      </div>
      ${Object.entries(claimsAssistantData.policies)
        .map(
          ([category, rules]) => `
        <section class="claims-policy-group">
          <strong>${category}</strong>
          <ul>${rules.map((rule) => `<li>${rule}</li>`).join("")}</ul>
        </section>
      `,
        )
        .join("")}
    </article>
  `;
}

function renderPolicyCategoryCard(category) {
  const rules =
    claimsAssistantData.policies[category] ||
    claimsAssistantData.policies["Telephone & Internet"];
  return `
    <article class="claims-inline-card policy-card compact">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon(category === "Fuel & Maintenance" ? "icon-fuel" : "icon-card")}</span>
        <div><strong>${category}</strong><small>Policy summary</small></div>
      </div>
      <ul>${rules.map((rule) => `<li>${rule}</li>`).join("")}</ul>
    </article>
  `;
}

function renderClaimHistoryCard(filter = "All") {
  const claims = claimsAssistantData.history.filter(
    (claim) => filter === "All" || claim.status === filter,
  );
  return `
    <article class="claims-inline-card history-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-receipt")}</span>
        <div><strong>Claim history</strong><small>${filter} claims</small></div>
      </div>
      <div class="claims-history-filters">
        ${["All", "Under review", "Needs info", "Approved", "Rejected"]
          .map(
            (item) =>
              `<button type="button" class="${item === filter ? "active" : ""}" data-claims-workspace-action="history-filter" data-filter="${item}">${item}</button>`,
          )
          .join("")}
      </div>
      <div class="claims-history-list-chat">
        ${
          claims.length
            ? claims.map((claim) => renderHistoryItemButton(claim)).join("")
            : `<p>No claims match this filter.</p>`
        }
      </div>
    </article>
  `;
}

function renderHistoryItemButton(claim) {
  return `
    <button type="button" class="claim-history-item" data-claims-workspace-action="claim-detail" data-claim-id="${claim.id}">
      <span class="transaction-icon" aria-hidden="true">${claimIcon(claim.icon)}</span>
      <span class="transaction-meta"><strong>${claim.id}</strong><span>${claim.vendor}<br>${claim.category}</span></span>
      <span class="transaction-amount"><strong>${claim.amount}</strong><span>${claim.submitted}</span>${renderStatusBadge(claim.status)}</span>
    </button>
  `;
}

function renderClaimDetailCard(claim) {
  return `
    <article class="claims-inline-card detail-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon(claim.icon)}</span>
        <div><strong>${claim.id}</strong><small>${claim.vendor}</small></div>
      </div>
      ${renderClaimsDataGrid([
        ["Category", claim.category],
        ["Vendor", claim.vendor],
        ["Amount", claim.amount],
        ["Submitted", claim.submitted],
        ["Current status", claim.status],
      ])}
      ${renderTimeline(claim.timelineStatus)}
    </article>
  `;
}

function renderClaimStatusCard() {
  return `
    <article class="claims-inline-card detail-card">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon("icon-claim")}</span>
        <div><strong>CLM-43872</strong><small>Airtel Broadband</small></div>
      </div>
      ${renderClaimsDataGrid([
        ["Category", "Telephone & Internet"],
        ["Amount", "₹1,299"],
        ["Submitted", "12 May 2026, 10:33 AM"],
        ["Current status", "Under review"],
      ])}
      ${renderTimeline("under-review")}
      <p class="claims-card-note">I’ll notify you once it’s approved.</p>
    </article>
  `;
}

function renderTimeline(status) {
  const steps = [
    ["submitted", "Submitted"],
    ["policy", "Policy checked"],
    [
      "under-review",
      status === "needs-info"
        ? "Needs info"
        : status === "approved"
          ? "Approved"
          : "Under review",
    ],
    ["reimbursed", "Reimbursed"],
  ];
  const currentIndex =
    status === "approved" ? 2 : status === "needs-info" ? 2 : 2;
  return `
    <div class="claim-status-timeline compact">
      ${steps
        .map(
          ([id, label], index) => `
        <article class="${index < currentIndex ? "is-complete" : ""} ${index === currentIndex ? "is-current" : ""}">
          <i>${index <= currentIndex ? "✓" : ""}</i>
          <div><strong>${label}</strong><span>${index <= currentIndex ? "12 May 2026" : "Upcoming"}</span></div>
        </article>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderMockExtractionCard({
  title,
  icon,
  rows,
  footer = "",
  tone = "",
}) {
  return `
    <article class="claims-inline-card extraction-card ${tone}">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon(icon)}</span>
        <div><strong>${title}</strong><small>Mock extraction</small></div>
      </div>
      ${renderClaimsDataGrid(rows)}
      ${footer ? `<p class="claims-card-note">${footer}</p>` : ""}
    </article>
  `;
}

function renderClaimsDataGrid(rows) {
  return `
    <div class="claims-data-grid">
      ${rows
        .map(
          ([label, value]) => `
        <p><span>${label}</span><strong>${value}</strong></p>
      `,
        )
        .join("")}
    </div>
  `;
}

function getErrorScenario(type) {
  const card = (title, rows, tone = "error") => `
    <article class="claims-inline-card scenario-card ${tone}">
      <div class="claims-card-title">
        <span aria-hidden="true">${claimIcon(tone === "danger" ? "icon-close" : "icon-help")}</span>
        <div><strong>${title}</strong><small>Recovery available</small></div>
      </div>
      ${rows?.length ? renderClaimsDataGrid(rows) : ""}
    </article>
  `;

  const scenarios = {
    "duplicate-month": {
      message: "I found a similar Telephone & Internet claim for May 2026.",
      card: card("Duplicate Claim Found", [
        ["Existing claim", "CLM-32811"],
        ["Category", "Telephone & Internet"],
        ["Month", "May 2026"],
        ["Amount", "₹1,299"],
        ["Status", "Approved"],
      ]),
      replies: ["View existing claim", "Upload different bill"],
    },
    "missing-billing-period": {
      message: "I couldn’t identify the billing month on this bill.",
      card: `<article class="claims-inline-card scenario-card"><strong>Which month is this bill for?</strong></article>`,
      replies: ["May 2026", "June 2026", "Other"],
    },
    "name-mismatch": {
      message: "The name on this bill doesn’t match your employee profile.",
      card: card("Name mismatch", [
        ["Bill name", "Rohan Mehta"],
        ["Employee profile", "Vishal Sharma"],
      ]),
      replies: ["Upload proof", "Change bill", "Cancel claim"],
    },
    "amount-mismatch": {
      message: "The amount entered doesn’t match the bill.",
      card: card("Amount mismatch", [
        ["Detected amount", "₹1,299"],
        ["Entered amount", "₹1,500"],
      ]),
      replies: ["Use ₹1,299", "Edit amount", "Cancel"],
    },
    "missing-vehicle-number": {
      message: "I couldn’t find the vehicle number. Please enter it.",
      replies: ["DL01AB1234", "Upload different bill"],
    },
    "blurry-receipt": {
      message:
        "Hmm... this receipt is too blurry. I can’t read the amount and date clearly.",
      replies: ["Retake photo", "Upload another file", "Enter manually"],
    },
    "future-date": {
      message:
        "The bill date appears to be in the future: 18 July 2026. Please check the date.",
      replies: ["Edit date", "Upload another bill"],
    },
    "invalid-bill-type": {
      message: "This doesn’t look like a fuel or vehicle maintenance bill.",
      replies: ["Change category", "Upload fuel bill", "Cancel"],
    },
    "multiple-items": {
      message:
        "This bill has multiple line items. Select what you want to claim.",
      card: card("Eligible line items", [
        ["Fuel", "₹2,800"],
        ["Car wash", "₹600"],
        ["Snacks", "₹250 - not eligible"],
      ]),
      replies: ["Fuel ₹2,800", "Car wash ₹600", "Upload another bill"],
    },
    "missing-course-name": {
      message: "I couldn’t detect the course name. What course is this for?",
      replies: ["AI Product Management", "Enter manually"],
    },
    "missing-approval": {
      message: "This claim needs approval proof before submission.",
      replies: ["Upload approval", "Save as draft"],
    },
    "missing-completion": {
      message: "This claim needs a completion certificate before submission.",
      replies: ["Upload certificate", "Save as draft"],
    },
    "payment-screenshot": {
      message:
        "This looks like a payment screenshot. I need an invoice or receipt with provider, course, date and amount.",
      replies: ["Upload invoice", "Save draft", "Cancel"],
    },
    "personal-subscription": {
      message:
        "This looks like a personal subscription, not a professional development course.",
      replies: ["Change category", "Upload course invoice", "Save draft"],
    },
    "missing-driver-name": {
      message:
        "I need the driver’s name to continue. What’s the driver’s name?",
      replies: ["Ramesh Kumar", "Enter manually"],
    },
    "missing-month": {
      message: "Which month is this driver salary claim for?",
      replies: ["May 2026", "June 2026", "Other"],
    },
    "payment-proof-missing": {
      message:
        "Please upload payment proof or a signed receipt for this salary claim.",
      replies: ["Upload payment proof", "Upload signed receipt", "Save draft"],
    },
    "cash-receipt-not-signed": {
      message: "The cash receipt is missing a signature.",
      replies: ["Upload signed receipt", "Change payment mode", "Save draft"],
    },
    "driver-limit-exceeded": {
      message: "This amount exceeds the monthly limit for Driver Salary.",
      card: card("Policy limit exceeded", [
        ["Claimed amount", "₹18,000"],
        ["Allowed limit", "₹15,000"],
      ]),
      replies: ["Claim ₹15,000", "Edit amount", "Cancel"],
    },
    "unsupported-file": {
      message: "I can only read PDF, JPG or PNG files right now.",
      replies: ["Upload PDF", "Upload image"],
    },
    "file-too-large": {
      message: "This file is larger than 10 MB. Please upload a smaller file.",
      replies: ["Upload smaller file"],
    },
    "network-failure": {
      message: "I couldn’t connect for a moment. Your draft is safe.",
      replies: ["Try again", "Save draft"],
    },
    "ocr-failed": {
      message: "I couldn’t read this bill clearly.",
      replies: ["Retake photo", "Upload another", "Enter manually"],
    },
    "wallet-balance-insufficient": {
      message:
        "Your Reimbursement Wallet balance is lower than this claim amount.",
      card: card("Wallet balance insufficient", [
        ["Claim amount", "₹12,000"],
        ["Available balance", "₹9,100"],
      ]),
      replies: ["Claim ₹9,100", "Edit amount", "Cancel"],
    },
    "policy-limit-exceeded": {
      message: "This claim exceeds the category limit.",
      replies: ["Claim allowed amount", "View policy", "Edit amount"],
    },
    "duplicate-invoice": {
      message: "This invoice number was already used in another claim.",
      replies: ["View existing claim", "Upload another bill"],
    },
    "session-timeout": {
      message: "You were away for a while, so I saved this as a draft.",
      replies: ["Resume draft", "Start new claim"],
    },
  };
  return scenarios[type];
}

function renderClaimsAssistant() {
  if (!claimsStatus || !claimsThread || !claimsWorkspace) return;
  claimsStatus.hidden = true;
  claimsThread.innerHTML = renderClaimsThread();
  claimsWorkspace.innerHTML = "";
  bindClaimsWorkspaceActions();
  syncClaimsComposer();
  scrollClaimsToBottom();
}

function renderClaimsThread() {
  return renderClaimsMessageStream();
}

function renderClaimsMessageStream() {
  const messages = claimState.messages
    .map((message) => renderClaimMessage(message))
    .join("");
  const typing = claimState.isThinking
    ? renderClaimMessage({
        role: "assistant",
        text: `<span class="claims-mini-typing"><i></i><i></i><i></i></span>`,
        typing: true,
        type: "normal",
      })
    : "";
  return messages + typing;
}

function renderClaimMessage(message) {
  if (message.kind === "quickReplies") return renderQuickReplyMessage(message);
  if (message.kind === "card") return renderInlineCardMessage(message);

  const isUser = message.role === "user";
  const typingClass = message.typing ? " is-typing" : "";
  const variantClass = message.type ? ` is-${message.type}` : "";
  const time = message.time || "10:30 AM";
  return `
    <div class="claims-message-row ${isUser ? "user" : "bot"}">
      ${isUser ? "" : `<span class="claims-avatar" aria-hidden="true">${claimIcon("icon-claim")}</span>`}
      <div class="claims-message ${isUser ? "user" : "bot"}${typingClass}${variantClass}">
        <span class="claims-message-text">${message.text}</span>
        ${message.typing ? "" : `<span class="claims-message-meta">${time}${isUser ? claimIcon("icon-checks") : ""}</span>`}
      </div>
    </div>
  `;
}

function renderInlineCardMessage(message) {
  const html =
    message.cardType === "final-review"
      ? renderFinalReviewCard()
      : message.html;
  return `
    <div class="claims-message-row bot card-row">
      <span class="claims-avatar" aria-hidden="true">${claimIcon("icon-claim")}</span>
      <div class="claims-message bot claims-card-message">${html}</div>
    </div>
  `;
}

function renderQuickReplyMessage(message) {
  return `
    <div class="claims-message-row bot quick-row">
      <span class="claims-avatar" aria-hidden="true">${claimIcon("icon-claim")}</span>
      <div class="quick-reply-chips">
        ${message.replies
          .map(
            ({ label, action }) =>
              `<button type="button" data-claims-reply="${escapeAttribute(action || label)}">${escapeHTML(label)}</button>`,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderClaimsWorkspace() {
  return "";
}

function syncClaimsComposer() {
  if (!claimsInput || !claimsSendButton) return;
  const hasText = Boolean(claimsInput.value.trim());
  claimsSendButton.disabled = !hasText;
  claimsSendButton.setAttribute("aria-disabled", String(!hasText));
  claimsActionMenuButton?.setAttribute(
    "aria-expanded",
    String(claimState.isActionMenuOpen),
  );
  claimsActionMenuButton?.classList.toggle(
    "is-open",
    claimState.isActionMenuOpen,
  );
  if (claimsActionMenu) claimsActionMenu.hidden = !claimState.isActionMenuOpen;
  claimsInput.placeholder = "Message Benefits assistant...";
}

function openClaimsAssistant() {
  if (!claimsAssistant) return;
  closeCardOverlay();
  closeWalletOverlay();
  closeMerchantDirectory();
  closeManageCardsOverlay();
  claimsAssistant.hidden = false;
  if (!claimState.messages.length) renderHomeJourney();
  syncClaimsComposer();
  renderClaimsAssistant();
  window.requestAnimationFrame(() => {
    claimsAssistant.classList.add("is-open");
    syncPageScrollLock();
  });
}

function closeClaimsAssistant() {
  if (!claimsAssistant) return;
  claimsAssistant.classList.remove("is-open");
  window.setTimeout(() => {
    claimsAssistant.hidden = true;
    syncPageScrollLock();
  }, 260);
}

function goToClaimsHome() {
  renderHomeJourney();
}

function setClaimsActionMenu(isOpen) {
  claimState.isActionMenuOpen = isOpen;
  claimsActionMenuButton?.setAttribute("aria-expanded", String(isOpen));
  claimsActionMenuButton?.classList.toggle("is-open", isOpen);
  if (claimsActionMenu) claimsActionMenu.hidden = !isOpen;
}

function toggleDeclaration(index) {
  claimState.declarationAccepted[index] =
    !claimState.declarationAccepted[index];
  renderClaimsAssistant();
}

function bindClaimsWorkspaceActions() {
  const roots = [claimsThread, claimsWorkspace].filter(Boolean);
  roots.forEach((root) => {
    root
      .querySelectorAll("[data-claims-workspace-action]")
      .forEach((button) => {
        button.addEventListener("click", () =>
          handleClaimsAction(button.dataset.claimsWorkspaceAction, button),
        );
      });
    root.querySelectorAll("[data-claims-reply]").forEach((button) => {
      button.addEventListener("click", () =>
        handleClaimsReply(button.dataset.claimsReply),
      );
    });
    root.querySelectorAll("[data-claims-declaration]").forEach((input) => {
      input.addEventListener("change", () =>
        toggleDeclaration(Number(input.dataset.claimsDeclaration)),
      );
    });
  });
}

function handleClaimsReply(reply = "") {
  addUserMessage(reply);
  routeClaimIntent(reply);
}

function handleClaimsAction(action, target) {
  if (action === "toggle-claim-menu") {
    setClaimsActionMenu(!claimState.isActionMenuOpen);
    return;
  }

  setClaimsActionMenu(false);
  const userMessage = target?.dataset?.userMessage;
  if (userMessage) addUserMessage(userMessage);
  if (
    !userMessage &&
    target?.classList?.contains("claims-action-option-card")
  ) {
    const menuLabels = {
      "upload-start": "Upload bill",
      dashboard: "View dashboard",
      policy: "View policy",
      history: "Claim history",
    };
    if (menuLabels[action]) addUserMessage(menuLabels[action]);
  }

  if (action === "upload-start" || action === "upload")
    startUploadBillJourney();
  if (action === "dashboard") renderDashboardJourney();
  if (action === "policy") renderPolicyJourney();
  if (action === "history") renderClaimHistoryJourney();
  if (action === "simulate-upload") simulateBillUploadJourney();
  if (action === "submit-claim") submitClaimJourney();
  if (action === "claim-detail") {
    const id = target?.dataset?.claimId || "CLM-43872";
    if (!userMessage) addUserMessage(id);
    renderClaimDetailJourney(id);
  }
  if (action === "history-filter") {
    const filter = target?.dataset?.filter || "All";
    addUserMessage(filter);
    addInlineCard(renderClaimHistoryCard(filter), "history");
  }
  if (action === "start-telephone") startTelephoneJourney();
  if (action === "start-fuel") startFuelJourney();
  if (action === "start-professional-development")
    startProfessionalDevelopmentJourney();
  if (action === "start-driver-salary" || action === "start-meal")
    startDriverSalaryJourney();
}

function routeClaimIntent(rawText = "") {
  const text = rawText.trim();
  const key = text.toLowerCase();

  if (
    /^upload bill$|upload pdf|upload image|upload smaller file|upload another|upload different bill|submit another claim|start new claim|resume draft|try again/.test(
      key,
    )
  ) {
    startUploadBillJourney();
    return;
  }
  if (/dashboard|show dashboard/.test(key)) {
    renderDashboardJourney();
    return;
  }
  if (/claim history|^history$/.test(key)) {
    renderClaimHistoryJourney();
    return;
  }
  if (/chat history/.test(key)) {
    addBotMessage(
      "You can review this conversation above in the current chat thread.",
    );
    return;
  }
  if (/track status|status|clm-43872/.test(key)) {
    renderClaimStatusJourney();
    return;
  }
  if (
    /^policy$|view policy|ask about a category|view another policy/.test(key)
  ) {
    renderPolicyJourney();
    return;
  }
  if (claimsAssistantData.policies[text]) {
    renderPolicyJourney(text);
    return;
  }
  if (key === "all categories") {
    renderPolicyJourney("All categories");
    return;
  }
  if (/telephone/.test(key)) {
    startTelephoneJourney();
    return;
  }
  if (/fuel/.test(key) && !/₹/.test(key)) {
    startFuelJourney();
    return;
  }
  if (/professional development|coursera/.test(key)) {
    startProfessionalDevelopmentJourney();
    return;
  }
  if (/driver salary/.test(key)) {
    startDriverSalaryJourney();
    return;
  }
  if (key === "looks good") {
    continueUploadValidationJourney();
    return;
  }
  if (key === "edit details") {
    addBotMessage(
      "Sure. Tell me which detail you want to change: amount, bill date, billing month, or category.",
    );
    addQuickReplies([
      "Amount mismatch",
      "Missing billing period",
      "Change category",
    ]);
    return;
  }
  if (key === "change category") {
    renderPolicyJourney();
    return;
  }
  if (key === "view existing claim") {
    renderClaimDetailJourney("CLM-43872");
    return;
  }
  if (/dl01ab1234/.test(key)) {
    claimState.awaiting = "";
    addBotMessage(
      "Thanks. I added vehicle number DL01AB1234 to the fuel claim.",
    );
    addInlineCard(
      renderMockExtractionCard({
        title: "Fuel claim updated",
        icon: "icon-fuel",
        rows: [
          ["Vendor", "Indian Oil"],
          ["Amount", "₹3,400"],
          ["Vehicle number", "DL01AB1234"],
          ["Status", "Ready to submit"],
        ],
      }),
      "fuel-updated",
    );
    addQuickReplies([
      "Submit another claim",
      "View dashboard",
      "Claim history",
    ]);
    return;
  }
  if (/ramesh kumar/.test(key)) {
    claimState.awaiting = "driver-month";
    addBotMessage("Got it. Which month is this salary for?");
    addQuickReplies(["May 2026", "June 2026", "Other"]);
    return;
  }
  if (/may 2026|june 2026/.test(key)) {
    addBotMessage(`Thanks. I’ll use ${text} for this claim.`);
    addQuickReplies(["Upload bill", "View dashboard", "Claim history"]);
    return;
  }
  if (
    /upload proof|upload approval|upload certificate|upload payment proof|upload signed receipt|upload invoice/.test(
      key,
    )
  ) {
    addInlineCard(
      renderFilePreviewCard({
        name: "Supporting_Document.pdf",
        type: "PDF",
        size: "640 KB",
      }),
      "file-preview",
    );
    addBotMessage("Thanks. I attached it to this draft.");
    addQuickReplies(["Upload bill", "View dashboard", "Claim history"]);
    return;
  }
  if (/save draft|save as draft/.test(key)) {
    addBotMessage(
      "Saved as a draft. You can resume it anytime from this assistant.",
      "success",
    );
    addQuickReplies(["Resume draft", "Start new claim", "View dashboard"]);
    return;
  }
  if (
    /claim ₹15,000|claim ₹9,100|claim allowed amount|use ₹1,299|fuel ₹2,800|car wash ₹600|ai product management/.test(
      key,
    )
  ) {
    addBotMessage("Done. I updated the claim with that value.", "success");
    addQuickReplies(["Upload bill", "View dashboard", "Claim history"]);
    return;
  }
  if (/cancel claim|cancel/.test(key)) {
    addBotMessage("No problem. I cancelled this draft.", "warning");
    addQuickReplies([
      "Upload bill",
      "View dashboard",
      "View policy",
      "Claim history",
    ]);
    return;
  }

  const directScenario = claimsScenarioAliases[key];
  if (directScenario) {
    renderErrorScenario(directScenario);
    return;
  }

  const fuzzyScenario = Object.entries(claimsScenarioAliases).find(([alias]) =>
    key.includes(alias),
  );
  if (fuzzyScenario) {
    renderErrorScenario(fuzzyScenario[1]);
    return;
  }

  addBotMessage(
    "I can help you upload a bill, view the dashboard, check policy, review history, or test claim error scenarios.",
  );
  addQuickReplies([
    "Upload bill",
    "View dashboard",
    "View policy",
    "Claim history",
  ]);
}

function getClaimAssistantReply(text) {
  routeClaimIntent(text);
  return "";
}

function addLiveClaimBotMessage(text, delay = 520) {
  if (!text) return;
  window.setTimeout(() => addBotMessage(text), delay);
}

function updateTrackStatus(status) {
  claimState.trackStatus = status;
  renderClaimStatusJourney();
}

function renderStatusBadge(status) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-badge ${key}">${status}</span>`;
}

resetClaimJourney();

function showToast(message) {
  if (!toastRegion) return;
  window.clearTimeout(toastTimer);
  toastRegion.textContent = message;
  toastRegion.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toastRegion.classList.remove("is-visible");
  }, 2200);
}

function initializeTapPayDiscovery() {
  if (!tapPayDiscovery) return;

  window.requestAnimationFrame(() => {
    tapPayDiscovery.classList.add("is-visible");
  });

  tapPayDiscovery.addEventListener("click", (event) => {
    if (event.target.closest(".tap-pay-close")) {
      tapPayDiscovery.classList.add("is-dismissed");
      window.setTimeout(() => {
        tapPayDiscovery.hidden = true;
      }, 280);
      return;
    }

    const tapWallet = Array.from(walletButtons).find((button) =>
      (button.dataset.walletActions || "")
        .split(",")
        .map((value) => value.trim())
        .includes("tap"),
    );
    if (tapWallet) {
      openWalletOverlay(tapWallet);
    }
  });
}

function createOverlayPill(actionKey) {
  const action = walletActionCatalog[actionKey];
  if (!action) return null;
  const pill = document.createElement("span");
  pill.className = "wallet-rail-pill is-active";
  pill.innerHTML = `${action.icon}${action.label}`;
  return pill;
}

function createOverlayAction(actionKey) {
  const action = walletActionCatalog[actionKey];
  if (!action) return null;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "wallet-overlay-action";
  button.innerHTML = `
    <span class="wallet-overlay-action-icon" aria-hidden="true">${action.icon}</span>
    <span class="wallet-overlay-action-copy">
      <strong>${action.label}</strong>
      <span>${action.detail}</span>
    </span>
    <span class="wallet-overlay-action-arrow" aria-hidden="true"><svg><use href="#icon-arrow-right" /></svg></span>
  `;
  button.addEventListener("click", () => showToast(action.toast));
  return button;
}

function renderPrimaryAction(action) {
  if (!walletOverlayPrimaryAction || !action) return;
  const idleLetters = Array.from(action.label)
    .map(
      (char) =>
        `<span class="wallet-cta-letter">${char === " " ? "&nbsp;" : char}</span>`,
    )
    .join("");
  walletOverlayPrimaryAction.dataset.toast = action.toast;
  walletOverlayPrimaryAction.innerHTML = `
    <span class="wallet-overlay-cta-icon" aria-hidden="true">${action.icon}</span>
    <span class="wallet-overlay-cta-copy">
      <strong class="wallet-cta-text" aria-label="${action.label}">
        <span class="wallet-cta-text-layer is-idle">${idleLetters}</span>
      </strong>
    </span>
  `;
  walletOverlayPrimaryAction.onclick = () => showToast(action.toast);
}

function renderModeSwitch(actionKeys, selectedKey) {
  if (!walletOverlayModeSwitch) return;
  if (actionKeys.length < 2) {
    walletOverlayModeSwitch.hidden = true;
    walletOverlayModeSwitch.replaceChildren();
    return;
  }

  walletOverlayModeSwitch.hidden = false;
  walletOverlayModeSwitch.replaceChildren();

  actionKeys.forEach((actionKey) => {
    const action = walletActionCatalog[actionKey];
    if (!action) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `wallet-overlay-mode-button${actionKey === selectedKey ? " is-active" : ""}`;
    button.innerHTML = `${action.icon}<span>${action.label}</span>`;
    button.addEventListener("click", () => {
      renderModeSwitch(actionKeys, actionKey);
      renderPrimaryAction(action);
    });
    walletOverlayModeSwitch.append(button);
  });
}

function createHistoryItem(item) {
  const isPositive = item.positive || item.type === "credit";
  const article = document.createElement(item.id ? "button" : "article");
  if (item.id) article.type = "button";
  article.className = `transaction-item${isPositive ? " positive" : ""}`;
  if (item.wallet) article.dataset.wallet = item.wallet;
  const statusKey = item.status
    ? item.status.toLowerCase().replace(/\s+/g, "-")
    : "";
  const status = item.status
    ? `<span class="transaction-status ${statusKey}">${item.status}</span>`
    : "";
  const icon = item.icon
    ? item.icon.startsWith("icon-")
      ? item.icon
      : `icon-${item.icon}`
    : "icon-arrow-right";
  const reference =
    item.reference || `${item.paymentMethod} | Ref ID: ${item.refId}`;
  const amount =
    typeof item.amount === "number"
      ? `${isPositive ? "+" : "-"} ${formatCurrency(item.amount)}`
      : item.amount;
  const date = item.date || item.dateLabel;
  article.innerHTML = `
    <span class="transaction-icon" aria-hidden="true"><svg><use href="#${icon}" /></svg></span>
    <span class="transaction-meta">
      <strong>${item.merchant}</strong>
      <span>${reference}</span>
    </span>
    <span class="transaction-amount${isPositive ? " positive" : ""}">
      <strong>${amount}</strong>
      <span>${date}</span>
      ${status}
    </span>
  `;
  if (item.id) {
    article.setAttribute("aria-label", `Open ${item.merchant} transaction details`);
    article.addEventListener("click", () => {
      window.parent.postMessage(
        {
          type: "employee-benefits:open-transaction-details",
          transactionId: item.id,
        },
        window.location.origin,
      );
    });
  }
  return article;
}

function isBrandNewPersona() {
  return window.localStorage.getItem("eb-claims:active-persona") === "new_user";
}

function createEmptyTransactionState(message) {
  const notice = document.createElement("p");
  notice.className = "transaction-empty-state";
  notice.textContent = message;
  return notice;
}

function renderWalletHistory() {
  if (!walletOverlayHistory) return;

  walletOverlayHistory.replaceChildren();
  if (isBrandNewPersona()) {
    walletOverlayHistory.append(
      createEmptyTransactionState("No transactions yet for this wallet."),
    );
    if (walletOverlayViewAllHistory) walletOverlayViewAllHistory.hidden = true;
    return;
  }

  const history = Array.isArray(syncedWalletTransactions[activeWalletTone])
    ? syncedWalletTransactions[activeWalletTone]
    : syncedTransactionItems
        .filter((item) => item.wallet === activeWalletTone)
        .sort((left, right) => {
          const dateOrder = right.postedOn.localeCompare(left.postedOn);
          return dateOrder === 0
            ? left.id.localeCompare(right.id)
            : dateOrder;
        })
        .slice(0, 10);
  if (history.length === 0) {
    walletOverlayHistory.append(
      createEmptyTransactionState("No transactions yet for this wallet."),
    );
    if (walletOverlayViewAllHistory) walletOverlayViewAllHistory.hidden = true;
    return;
  }
  history.forEach((item) => {
    walletOverlayHistory.append(createHistoryItem(item));
  });
  if (walletOverlayViewAllHistory) walletOverlayViewAllHistory.hidden = false;
}

function renderSyncedTransactions(items, walletTransactions) {
  syncedTransactionItems = Array.isArray(items) ? items : [];
  syncedWalletTransactions =
    walletTransactions && typeof walletTransactions === "object"
      ? walletTransactions
      : {};
  const transactionList = document.querySelector("[data-transaction-list]");
  if (transactionList) {
    transactionList.replaceChildren();
    if (syncedTransactionItems.length === 0) {
      transactionList.append(
        createEmptyTransactionState("No transactions yet for your new account."),
      );
    } else {
      syncedTransactionItems
        .slice(0, 10)
        .forEach((item) => transactionList.append(createHistoryItem(item)));
    }
  }

  const activeFilter =
    document.querySelector("[data-filter].active")?.dataset.filter || "all";
  document.querySelectorAll("[data-transaction-list] [data-wallet]").forEach((item) => {
    item.classList.toggle(
      "is-hidden",
      activeFilter !== "all" && item.dataset.wallet !== activeFilter,
    );
  });

  const activeOverlayContent = walletOverlayContent[activeWalletTone];
  if (activeOverlayContent && walletOverlay?.classList.contains("is-open")) {
    renderWalletHistory();
  }
}

function createMerchantChip(label, isActive) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = `merchant-directory-chip${isActive ? " is-active" : ""}`;
  chip.textContent = label;
  chip.addEventListener("click", () => showToast(`${label} filter applied`));
  return chip;
}

function createMerchantItem(item, hasExtraBottomSpace = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "merchant-directory-item";
  if (hasExtraBottomSpace) button.classList.add("has-extra-bottom-space");
  button.innerHTML = `
    <span class="merchant-directory-item-icon" aria-hidden="true"><svg><use href="#${item.icon}" /></svg></span>
    <span class="merchant-directory-item-copy">
      <strong>${item.name}</strong>
      <span>${item.subtitle}</span>
    </span>
    <span class="merchant-directory-item-meta">
      <strong>${item.reward}</strong>
      <span>${item.meta}</span>
    </span>
  `;
  button.addEventListener("click", () => showToast(`${item.name} selected`));
  return button;
}

function renderManageWalletState() {
  const state = manageWalletState[activeManageWalletKey];
  if (!state) return;

  const progress = Math.round((state.limitUsed / state.limitTotal) * 100);
  const onlineEnabled = Boolean(state.online);

  if (manageWalletType) manageWalletType.textContent = state.label;
  if (manageAccessCopy) manageAccessCopy.textContent = state.accessCopy;
  if (manageAccessValue) manageAccessValue.textContent = state.accessValue;
  if (manageOnlineCopy)
    manageOnlineCopy.textContent = `Online merchant transactions ${onlineEnabled ? "enabled" : "disabled"}`;
  manageOnlineButton?.classList.toggle("is-enabled", onlineEnabled);
  manageOnlineButton?.setAttribute("aria-pressed", String(onlineEnabled));
  manageOnlineButton
    ?.querySelector(".manage-cards-toggle")
    ?.setAttribute("aria-checked", String(onlineEnabled));
  if (manageLimitCopy)
    manageLimitCopy.textContent = `${formatCurrency(state.limitUsed)} of ${formatCurrency(state.limitTotal)}`;
  if (manageLimitValue) manageLimitValue.textContent = `${progress}% used`;
  if (manageLimitUsed)
    manageLimitUsed.textContent = `${formatCurrency(state.limitUsed)} used`;
  if (manageLimitTotal)
    manageLimitTotal.textContent = `${formatCurrency(state.limitTotal)} limit`;
  if (manageLimitProgress) manageLimitProgress.style.width = `${progress}%`;
  if (manageStatusCopy)
    manageStatusCopy.textContent = "Your card is active and ready to use";
  if (managePreviewNumber)
    managePreviewNumber.textContent = state.reveal.number
      ? state.card.number
      : `•••• •••• •••• ${state.card.last4}`;
  if (managePreviewHolder) managePreviewHolder.textContent = state.card.holder;
  if (managePreviewExpiry) managePreviewExpiry.textContent = state.card.expiry;
  manageSensitiveFields.forEach((field) => {
    const key = field.dataset.cardSensitive;
    if (key === "number")
      field.textContent = state.reveal.number
        ? state.card.number
        : `•••• •••• •••• ${state.card.last4}`;
    if (key === "holder") field.textContent = state.card.holder;
    if (key === "expiry") field.textContent = state.card.expiry;
    if (key === "cvv")
      field.textContent = state.reveal.cvv ? state.card.cvv : "•••";
  });
  manageRevealButtons.forEach((button) => {
    const key = button.dataset.cardReveal;
    if (!Object.prototype.hasOwnProperty.call(state.reveal, key)) return;
    const isRevealed = state.reveal[key];
    button.setAttribute(
      "aria-label",
      `${isRevealed ? "Hide" : "Reveal"} ${key === "cvv" ? "CVV" : "card number"}`,
    );
    button.setAttribute("aria-pressed", String(isRevealed));
    button.classList.toggle("is-hidden", !isRevealed);
  });
  manageWalletButtons.forEach((button) => {
    const walletState = manageWalletState[button.dataset.walletKey];
    const statusBadge = button.querySelector(".manage-cards-status-badge");
    button.classList.toggle("is-frozen", Boolean(walletState?.frozen));
    if (statusBadge)
      statusBadge.textContent = walletState?.frozen ? "Frozen" : "Active";
  });
}

function selectManageWallet(button) {
  activeManageWalletKey = button.dataset.walletKey || "meal";
  const selectedIndex = Math.max(
    0,
    Array.from(manageWalletButtons).indexOf(button),
  );

  manageWalletButtons.forEach((walletButton, index) => {
    const isSelected = walletButton === button;
    walletButton.classList.toggle("is-selected", isSelected);
    walletButton.setAttribute("aria-pressed", String(isSelected));
    manageWalletDots[index]?.classList.toggle("is-active", isSelected);
  });
  if (manageWalletCount)
    manageWalletCount.textContent = `${selectedIndex + 1}/${manageWalletButtons.length}`;

  renderManageWalletState();
}

manageWalletButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectManageWallet(button);
    button.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
});

manageWalletDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    const targetWallet = manageWalletButtons[index];
    if (!targetWallet) return;
    selectManageWallet(targetWallet);
    targetWallet.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
});

manageWalletCarousel?.addEventListener("scroll", () => {
  window.clearTimeout(manageWalletCarousel.scrollTimer);
  manageWalletCarousel.scrollTimer = window.setTimeout(() => {
    const carouselCenter =
      manageWalletCarousel.getBoundingClientRect().left +
      manageWalletCarousel.clientWidth / 2;
    const nearestButton = Array.from(manageWalletButtons).reduce(
      (nearest, button) => {
        const currentRect = button.getBoundingClientRect();
        const nearestRect = nearest.getBoundingClientRect();
        const currentDistance = Math.abs(
          currentRect.left + currentRect.width / 2 - carouselCenter,
        );
        const nearestDistance = Math.abs(
          nearestRect.left + nearestRect.width / 2 - carouselCenter,
        );
        return currentDistance < nearestDistance ? button : nearest;
      },
      manageWalletButtons[0],
    );
    if (nearestButton && !nearestButton.classList.contains("is-selected"))
      selectManageWallet(nearestButton);
  }, 90);
});

manageOnlineButton?.addEventListener("click", () => {
  const state = manageWalletState[activeManageWalletKey];
  if (!state) return;
  state.online = !state.online;
  renderManageWalletState();
  showToast(
    `${state.label} online transactions ${state.online ? "enabled" : "disabled"}`,
  );
});

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const copyField = document.createElement("textarea");
  copyField.value = value;
  copyField.setAttribute("readonly", "");
  copyField.style.position = "fixed";
  copyField.style.opacity = "0";
  document.body.append(copyField);
  copyField.select();
  const didCopy = document.execCommand("copy");
  copyField.remove();
  if (!didCopy) throw new Error("Copy command failed");
}

manageRevealButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const state = manageWalletState[activeManageWalletKey];
    const key = button.dataset.cardReveal;
    if (!state || !Object.prototype.hasOwnProperty.call(state.reveal, key))
      return;
    state.reveal[key] = !state.reveal[key];
    button.setAttribute(
      "aria-label",
      `${state.reveal[key] ? "Hide" : "Reveal"} ${key === "cvv" ? "CVV" : "card number"}`,
    );
    renderManageWalletState();
  });
});

manageCopyButton?.addEventListener("click", async (event) => {
  event.stopPropagation();
  const cardNumber = manageWalletState[activeManageWalletKey]?.card.number;
  if (!cardNumber) return;

  try {
    await copyTextToClipboard(cardNumber);
    showToast("Card number copied");
  } catch {
    showToast("Could not copy card number");
  }
});

managePlaceholderButtons?.forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});
renderManageWalletState();

claimsOpenButton?.addEventListener("click", () => {
  window.parent.postMessage(
    { type: "employee-benefits:open-benefits-assistant" },
    window.location.origin,
  );
});

document.querySelectorAll("[data-transactions-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-transactions" },
      window.location.origin,
    );
  });
});

document.querySelectorAll("[data-manage-limits-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-manage-limits" },
      window.location.origin,
    );
  });
});

document.querySelectorAll("[data-profile-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-profile" },
      window.location.origin,
    );
  });
});

document.querySelectorAll("[data-spend-analytics-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-spend-analytics" },
      window.location.origin,
    );
  });
});

document.querySelectorAll("[data-send-money-open]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-send-money" },
      window.location.origin,
    );
  });
});

bankTransferOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-bank-transfer" },
      window.location.origin,
    );
  });
});

scanPayOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      { type: "employee-benefits:open-scan-pay" },
      window.location.origin,
    );
  });
});

upiSetupOpenButton?.addEventListener("click", openUpiSetupFlow);

upiSettingsOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.parent.postMessage(
      {
        type: "employee-benefits:open-upi-settings",
        tab: document.body.classList.contains("is-pluspay")
          ? "pluspay"
          : "benefits",
      },
      window.location.origin,
    );
  });
});

claimsCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (claimState.view && claimState.view !== "home") {
      goToClaimsHome();
      return;
    }
    closeClaimsAssistant();
  });
});

claimsActionButtons.forEach((button) => {
  button.addEventListener("click", () =>
    handleClaimsAction(button.dataset.claimsAction, button),
  );
});

claimsSendButton?.addEventListener("click", () => {
  const text = claimsInput?.value.trim();
  if (!text) return;
  addUserMessage(text);
  claimsInput.value = "";
  syncClaimsComposer();
  routeClaimIntent(text);
});

claimsInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") claimsSendButton?.click();
});

claimsInput?.addEventListener("input", syncClaimsComposer);

walletOverlayViewAllHistory?.addEventListener("click", (event) => {
  event.preventDefault();
  window.parent.postMessage(
    {
      type: "employee-benefits:open-wallet-statement",
      wallet: activeWalletTone,
    },
    window.location.origin,
  );
});

function applyMode(isPluspay) {
  document.body.classList.toggle("is-pluspay", isPluspay);
  pluspayToggle?.setAttribute("aria-pressed", String(isPluspay));

  if (pluspayLabel) {
    pluspayLabel.textContent = isPluspay ? "EB+" : "PlusPay";
  }

  swapTextNodes.forEach((node) => {
    node.textContent = isPluspay
      ? node.dataset.pluspayText
      : (node.dataset.ebPlusText ?? node.dataset.lensText ?? "");
  });

  if (isPluspay) {
    closeCardOverlay();
    closeWalletOverlay();
    filterButtons.forEach((chip) => {
      chip.classList.remove("active");
      chip.setAttribute("aria-selected", "false");
    });
    lensFilterButton?.classList.add("active");
    lensFilterButton?.setAttribute("aria-selected", "true");
    document.querySelectorAll("[data-transaction-list] [data-wallet]").forEach((transaction) => {
      transaction.classList.remove("is-hidden");
    });
  }
}

pluspayToggle?.addEventListener("click", () => {
  if (document.body.classList.contains("is-product-locked")) return;
  const nextState = pluspayToggle.getAttribute("aria-pressed") !== "true";
  applyMode(nextState);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedWallet = button.dataset.filter;
    filterButtons.forEach((chip) => {
      chip.classList.remove("active");
      chip.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");

    document.querySelectorAll("[data-transaction-list] [data-wallet]").forEach((transaction) => {
      const shouldShow =
        selectedWallet === "all" ||
        transaction.dataset.wallet === selectedWallet;
      transaction.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

function closeCardOverlay() {
  if (!cardOverlay || !virtualCardToggle) return;
  virtualCardToggle.setAttribute("aria-expanded", "false");
  cardOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    cardOverlay.hidden = true;
    syncPageScrollLock();
  }, 320);
}

function closeWalletOverlay() {
  if (!walletOverlay) return;
  walletOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    walletOverlay.hidden = true;
    syncPageScrollLock();
  }, 280);
}

function closeMerchantDirectory() {
  if (!merchantDirectoryOverlay) return;
  merchantDirectoryOverlay.classList.remove("is-open");
  document.body.classList.remove("is-merchant-directory-open");
  window.setTimeout(() => {
    merchantDirectoryOverlay.hidden = true;
    syncPageScrollLock();
  }, 280);
}

function closeManageCardsOverlay() {
  if (!manageCardsOverlay) return;
  manageCardsOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    manageCardsOverlay.hidden = true;
    syncPageScrollLock();
  }, 280);
}

function renderTrackActivationCvv() {
  if (trackActivationCvv)
    trackActivationCvv.textContent = trackActivationCvvVisible ? "731" : "•••";
  if (!trackActivationCvvToggle) return;
  trackActivationCvvToggle.classList.toggle(
    "is-hidden",
    !trackActivationCvvVisible,
  );
  trackActivationCvvToggle.setAttribute(
    "aria-pressed",
    String(trackActivationCvvVisible),
  );
  trackActivationCvvToggle.setAttribute(
    "aria-label",
    `${trackActivationCvvVisible ? "Hide" : "Reveal"} activation CVV`,
  );
}

function closeTrackActivationSheet() {
  if (!trackActivationOverlay) return;
  trackActivationOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    trackActivationOverlay.hidden = true;
    syncPageScrollLock();
  }, 260);
}

function openTrackActivationSheet() {
  if (!trackActivationOverlay) return;
  trackActivationCvvVisible = false;
  renderTrackActivationCvv();
  trackActivationOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    if (trackActivationSheet) trackActivationSheet.scrollTop = 0;
    trackActivationOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function getCardPinInputs(group) {
  return cardPinInputs.filter((input) => input.dataset.cardPinDigit === group);
}

function getCardPinValue(group) {
  return getCardPinInputs(group)
    .map((input) => input.value)
    .join("");
}

function isSequentialCardPin(value) {
  if (value.length !== 4) return false;
  const digits = [...value].map(Number);
  return [1, -1].some((step) =>
    digits.slice(1).every((digit, index) => digit - digits[index] === step),
  );
}

function validateCardPin({ announce = false } = {}) {
  const pin = getCardPinValue("pin");
  const confirmation = getCardPinValue("confirm");
  let message = "";

  if (pin.length === 4 && /^(\d)\1{3}$/.test(pin)) {
    message = "Choose a PIN without repeating the same digit.";
  } else if (pin.length === 4 && isSequentialCardPin(pin)) {
    message = "Choose a PIN without sequential digits.";
  } else if (
    pin.length === 4 &&
    confirmation.length === 4 &&
    pin !== confirmation
  ) {
    message = "The PINs do not match. Please try again.";
  }

  const valid =
    pin.length === 4 &&
    confirmation.length === 4 &&
    pin === confirmation &&
    !message;
  if (cardPinSubmitButton) cardPinSubmitButton.disabled = !valid;
  if (cardPinError) {
    cardPinError.textContent = announce || message ? message : "";
  }
  cardPinInputs.forEach((input) => {
    input.classList.toggle("is-invalid", Boolean(message));
  });
  return valid;
}

function resetCardPinForm() {
  cardPinInputs.forEach((input) => {
    input.value = "";
    input.type = "password";
    input.classList.remove("is-invalid");
  });
  cardPinVisibilityButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    const group = button.dataset.cardPinVisibility;
    button.setAttribute(
      "aria-label",
      group === "confirm"
        ? "Show re-entered Benefits Card PIN"
        : "Show Benefits Card PIN",
    );
  });
  if (cardPinError) cardPinError.textContent = "";
  if (cardPinSubmitButton) cardPinSubmitButton.disabled = true;
}

function openCardPinOverlay() {
  if (!cardPinOverlay) return;
  resetCardPinForm();
  cardPinOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    if (cardPinPanel) cardPinPanel.scrollTop = 0;
    cardPinOverlay.classList.add("is-open");
    syncPageScrollLock();
    getCardPinInputs("pin")[0]?.focus();
  });
}

function closeCardPinOverlay() {
  if (!cardPinOverlay) return;
  cardPinOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    if (!cardPinOverlay.classList.contains("is-open")) {
      cardPinOverlay.hidden = true;
      resetCardPinForm();
      syncPageScrollLock();
    }
  }, 280);
}

function openCardSuccessSheet(mode, payload) {
  if (!cardSuccessOverlay) return;
  cardSuccessMode =
    mode === "pin" ? "pin" : mode === "fallback" ? "fallback" : "activation";
  if (cardSuccessActivation)
    cardSuccessActivation.hidden = cardSuccessMode !== "activation";
  if (cardSuccessPin) cardSuccessPin.hidden = cardSuccessMode !== "pin";
  if (cardSuccessFallback) {
    cardSuccessFallback.hidden = cardSuccessMode !== "fallback";
    if (cardSuccessMode === "fallback" && payload) {
      const walletLabel =
        payload.walletLabel ||
        (payload.walletKey === "fuel" ? "Fuel Wallet" : "Meal Wallet");
      const walletKeyName =
        payload.walletKey === "fuel" ? "fuel wallet" : "meal wallet";
      const isDisabled = payload.status === "disabled";
      if (cardSuccessFallbackTitle) {
        cardSuccessFallbackTitle.textContent = isDisabled
          ? `${walletLabel} Split Pay Disabled`
          : `${walletLabel} Split Pay Enabled`;
      }
      if (cardSuccessFallbackDesc) {
        cardSuccessFallbackDesc.textContent = isDisabled
          ? `${walletLabel} shortfalls will no longer use Reimbursement Wallet automatically.`
          : `${walletLabel} will be used first and Reimbursement Wallet will cover only the remaining amount.`;
      }
    }
  }
  cardSuccessOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    cardSuccessOverlay.classList.add("is-open");
    syncPageScrollLock();
    const focusTarget =
      cardSuccessMode === "pin"
        ? cardSuccessPin?.querySelector("button")
        : cardSuccessMode === "fallback"
          ? cardSuccessFallback?.querySelector("button")
          : cardSuccessActivation?.querySelector("button");
    focusTarget?.focus({ preventScroll: true });
  });
}

function closeCardSuccessSheet() {
  if (!cardSuccessOverlay) return;
  cardSuccessOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    if (!cardSuccessOverlay.classList.contains("is-open")) {
      cardSuccessOverlay.hidden = true;
      syncPageScrollLock();
    }
  }, 260);
}

/**
 * Activation and the card PIN are session state, like the lock toggle above:
 * the host challenges for the MPIN on every load, so a demo run always opens on
 * a card that has not been activated yet.
 */
function renderBenefitsCardSecurityState() {
  const { activated, pin } = benefitsCardSecurityState;

  if (trackActivateLabel) {
    trackActivateLabel.textContent = activated
      ? "Card Activated"
      : "Received Your Card?";
  }
  // Activating twice is not a journey the card has, so the CTA hands over to
  // the step that actually follows activation.
  if (trackActivationOpenButton) {
    trackActivationOpenButton.textContent = activated
      ? pin
        ? "Reset PIN"
        : "Set PIN"
      : "Activate Now";
  }

  const pinAction = pin ? "Reset" : "Set";
  if (cardPinTitle) cardPinTitle.textContent = `${pinAction} Benefits Card PIN`;
  if (cardPinSubmitButton) cardPinSubmitButton.textContent = `${pinAction} PIN`;
  cardPinCloseButtons.forEach((button) => {
    button.setAttribute("aria-label", `Close ${pinAction} Benefits Card PIN`);
  });
}

function requestCardMpinVerification(intent) {
  if (pendingCardMpinIntent) return;
  pendingCardMpinIntent = intent;
  window.parent.postMessage(
    { type: CARD_MPIN_VERIFY_MESSAGE, intent },
    window.location.origin,
  );
}

function renderBenefitsCardLockState() {
  const { locked } = benefitsCardLockState;
  document.body.classList.toggle("is-benefits-card-locked", locked);
  if (cardLockBanner) cardLockBanner.hidden = !locked;
  if (cardLockTileLabel)
    cardLockTileLabel.innerHTML = locked
      ? "Unlock<br />Card"
      : "Lock<br />Card";
  cardLockOpenButtons.forEach((button) => {
    button.setAttribute(
      "aria-label",
      locked ? "Unlock Benefits Card" : "Lock Benefits Card",
    );
  });
}

function formatCardLockTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const hours = date.getHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${displayHours}:${pad(date.getMinutes())}${meridiem}`;
}

function closeCardLockSheet() {
  if (!cardLockOverlay) return;
  cardLockOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    cardLockOverlay.hidden = true;
    syncPageScrollLock();
  }, 260);
}

function openCardLockSheet() {
  if (!cardLockOverlay) return;
  cardLockOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    if (cardLockSheet) cardLockSheet.scrollTop = 0;
    cardLockOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function openCardStatusSheet(mode) {
  if (!cardStatusOverlay) return;
  const isUnlocked = mode === "unlocked";
  benefitsCardLockState.statusMode = isUnlocked ? "unlocked" : "locked";
  if (cardStatusSheet) cardStatusSheet.dataset.cardStatusMode = mode;
  if (cardStatusTitle)
    cardStatusTitle.textContent = isUnlocked
      ? "Your Benefits Card has been Successfully Unlocked"
      : "Your Benefits Card has been Locked Successfully";
  if (cardStatusEffective) {
    cardStatusEffective.hidden = isUnlocked;
    if (!isUnlocked)
      cardStatusEffective.textContent = `Effective ${formatCardLockTimestamp(new Date())}`;
  }
  if (cardStatusCopy) cardStatusCopy.hidden = isUnlocked;
  if (cardStatusHelp) cardStatusHelp.hidden = isUnlocked;

  cardStatusOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    cardStatusOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function closeCardStatusSheet() {
  if (!cardStatusOverlay) return;
  // Unlock is committed when the confirmation sheet is dismissed, either from
  // the OK button or by tapping outside it.
  if (benefitsCardLockState.statusMode === "unlocked") {
    benefitsCardLockState.locked = false;
    renderBenefitsCardLockState();
  }
  cardStatusOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    cardStatusOverlay.hidden = true;
    syncPageScrollLock();
  }, 260);
}

function closeTrackCardOverlay() {
  if (!trackCardOverlay) return;
  if (trackActivationOverlay?.classList.contains("is-open"))
    closeTrackActivationSheet();
  trackCardOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    trackCardOverlay.hidden = true;
    syncPageScrollLock();
  }, 280);
}

function openTrackCardOverlay() {
  if (!trackCardOverlay) return;
  trackCardOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    const scroll = trackCardPanel?.querySelector(".track-card-scroll");
    if (scroll) scroll.scrollTop = 0;
    trackCardOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function readFallbackState() {
  try {
    const stored = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const wallets = parsed?.version === FALLBACK_STORAGE_VERSION
      ? parsed.wallets
      : parsed;
    Object.keys(fallbackState).forEach((key) => {
      if (typeof wallets?.[key] === "boolean") {
        fallbackState[key] = wallets[key];
      }
    });
  } catch {
    // Ignore unreadable/legacy values and keep the defaults.
  }
}

function writeFallbackState() {
  try {
    window.localStorage.setItem(
      FALLBACK_STORAGE_KEY,
      JSON.stringify({
        version: FALLBACK_STORAGE_VERSION,
        wallets: fallbackState,
      }),
    );
  } catch {
    // Storage is optional; the in-memory state still drives the screen.
  }
}

function renderFallbackState() {
  fallbackToggles.forEach((toggle) => {
    const key = toggle.dataset.fallbackToggle;
    const isChecked = fallbackState[key] === true;
    toggle.setAttribute("aria-checked", String(isChecked));
    const warningBox = document.querySelector(
      `[data-fallback-warning="${key}"]`,
    );
    if (warningBox) {
      warningBox.hidden = !isChecked;
    }
  });

  // Mirror the summary on the Manage Card tile so the state is visible without
  // opening the screen.
  const anyEnabled = Object.values(fallbackState).some(Boolean);
  fallbackOpenButtons.forEach((button) => {
    button.classList.toggle("is-enabled", anyEnabled);
  });
}

function setFallbackInfoOpen(isOpen) {
  if (!fallbackInfo || !fallbackInfoToggle) return;
  fallbackInfo.classList.toggle("is-open", isOpen);
  fallbackInfoToggle.setAttribute("aria-expanded", String(isOpen));
}

function openFallbackOverlay() {
  if (!fallbackOverlay) return;
  setFallbackInfoOpen(false);
  renderFallbackState();
  fallbackOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    const scroll = fallbackPanel?.querySelector(".fallback-scroll");
    if (scroll) scroll.scrollTop = 0;
    fallbackOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function closeFallbackOverlay() {
  if (!fallbackOverlay) return;
  fallbackOverlay.classList.remove("is-open");
  window.setTimeout(() => {
    fallbackOverlay.hidden = true;
    syncPageScrollLock();
  }, 280);
}

function openFallbackConfirmSheet(key) {
  if (!fallbackConfirmOverlay) return;
  pendingDisableFallbackKey = key;
  const label =
    fallbackWalletLabels[key] ||
    (key === "fuel" ? "Fuel Wallet" : "Meal Wallet");
  const walletKeyName = key === "fuel" ? "fuel wallet" : "meal wallet";

  if (fallbackConfirmTitle) {
    fallbackConfirmTitle.textContent = `Disable ${label} Split Pay?`;
  }
  if (fallbackConfirmDesc1) {
    fallbackConfirmDesc1.textContent = `Reimbursement Wallet will no longer cover the remaining amount when ${walletKeyName} has a low balance.`;
  }
  if (fallbackConfirmDesc2) {
    fallbackConfirmDesc2.textContent = `Low-balance payments will be blocked unless you select Reimbursement Wallet directly. Are you sure you want to disable Split Pay?`;
  }

  fallbackConfirmOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    fallbackConfirmOverlay.classList.add("is-open");
    syncPageScrollLock();
    fallbackConfirmDisableButton?.focus({ preventScroll: true });
  });
}

function closeFallbackConfirmSheet() {
  if (!fallbackConfirmOverlay) return;
  fallbackConfirmOverlay.classList.remove("is-open");
  pendingDisableFallbackKey = null;
  window.setTimeout(() => {
    if (!fallbackConfirmOverlay.classList.contains("is-open")) {
      fallbackConfirmOverlay.hidden = true;
      syncPageScrollLock();
    }
  }, 260);
}

function confirmDisableFallback() {
  const key = pendingDisableFallbackKey;
  if (!key || !(key in fallbackState)) {
    closeFallbackConfirmSheet();
    return;
  }
  fallbackState[key] = false;
  writeFallbackState();
  renderFallbackState();
  const label =
    fallbackWalletLabels[key] ||
    (key === "fuel" ? "Fuel Wallet" : "Meal Wallet");

  closeFallbackConfirmSheet();

  window.setTimeout(() => {
    openCardSuccessSheet("fallback", {
      walletKey: key,
      walletLabel: label,
      status: "disabled",
    });
  }, 220);
}

function toggleFallbackWallet(key) {
  if (!(key in fallbackState)) return;
  const isCurrentlyEnabled = fallbackState[key] === true;
  if (isCurrentlyEnabled) {
    openFallbackConfirmSheet(key);
  } else {
    fallbackState[key] = true;
    writeFallbackState();
    renderFallbackState();
    const label = fallbackWalletLabels[key] || "Wallet";
    openCardSuccessSheet("fallback", {
      walletKey: key,
      walletLabel: label,
      status: "enabled",
    });
  }
}

function openMerchantDirectory() {
  if (
    !merchantDirectoryOverlay ||
    !merchantDirectoryList ||
    !merchantDirectoryChips
  )
    return;
  const content =
    walletOverlayContent[activeWalletTone] || walletOverlayContent.meal;
  const activeWalletButton = Array.from(walletButtons).find((button) =>
    button.classList.contains(activeWalletTone),
  );
  const walletName = activeWalletButton?.dataset.walletName || "Wallet";

  if (merchantDirectoryTitle) merchantDirectoryTitle.textContent = walletName;
  if (merchantDirectoryCount)
    merchantDirectoryCount.textContent = content.directoryCopy;
  if (merchantDirectorySummaryCopy)
    merchantDirectorySummaryCopy.textContent = content.summaryCopy;
  if (merchantDirectorySearchCopy)
    merchantDirectorySearchCopy.textContent = content.searchCopy;

  merchantDirectoryChips.replaceChildren();
  content.categories.forEach((label, index) => {
    merchantDirectoryChips.append(createMerchantChip(label, index === 0));
  });

  merchantDirectoryList.replaceChildren();
  content.merchants.forEach((item, index) => {
    merchantDirectoryList.append(
      createMerchantItem(item, index === content.merchants.length - 1),
    );
  });

  merchantDirectoryOverlay.hidden = false;
  document.body.classList.add("is-merchant-directory-open");
  window.requestAnimationFrame(() => {
    if (merchantDirectoryScroll) merchantDirectoryScroll.scrollTop = 0;
    merchantDirectoryOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function openManageCardsOverlay() {
  if (!manageCardsOverlay) return;
  manageCardsOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    if (manageCardsPanel) manageCardsPanel.scrollTop = 0;
    manageCardsOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

function openWalletOverlay(button) {
  if (!walletOverlay || !walletOverlayPills || !walletOverlaySummary) return;

  const walletName = button.dataset.walletName || "Wallet";
  const walletBalance = button.dataset.walletBalance || "";
  const actionKeys = (button.dataset.walletActions || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const walletTone = button.classList.contains("fuel")
    ? "fuel"
    : button.classList.contains("misc")
      ? "misc"
      : button.classList.contains("gift")
        ? "gift"
        : "meal";
  const overlayContent =
    walletOverlayContent[walletTone] || walletOverlayContent.meal;
  const primaryActionKey = actionKeys.includes("tap") ? "tap" : actionKeys[0];
  const primaryAction = primaryActionKey
    ? walletActionCatalog[primaryActionKey]
    : null;

  walletButtons.forEach((wallet) => {
    const isTarget = wallet === button;
    wallet.classList.toggle("is-active", isTarget);
    wallet.setAttribute("aria-pressed", String(isTarget));
  });
  activeWalletTone = walletTone;

  if (walletOverlayName) walletOverlayName.textContent = walletName;
  if (walletOverlayBalance) walletOverlayBalance.textContent = walletBalance;
  if (walletOverlayDirectoryCopy)
    walletOverlayDirectoryCopy.textContent = overlayContent.directoryCopy;
  if (walletOverlaySelectCopy)
    walletOverlaySelectCopy.textContent = overlayContent.selectCopy;
  if (walletOverlayViewAllHistory)
    walletOverlayViewAllHistory.dataset.toast = overlayContent.viewAllToast;

  walletOverlaySummary.classList.remove("meal", "fuel", "misc", "gift");
  walletOverlaySummary.classList.add(walletTone);

  if (walletOverlayIcon) {
    walletOverlayIcon.classList.remove(
      "meal-icon",
      "fuel-icon",
      "misc-icon",
      "gift-icon",
    );
    walletOverlayIcon.classList.add(`${walletTone}-icon`);
    const sourceIcon = button.querySelector(".wallet-icon");
    if (sourceIcon) {
      walletOverlayIcon.innerHTML = sourceIcon.innerHTML;
    }
  }

  walletOverlayPills.replaceChildren();
  actionKeys.forEach((actionKey) => {
    if (walletTone === "meal" && actionKey === "tap") return;
    const pill = createOverlayPill(actionKey);
    if (pill) walletOverlayPills.append(pill);
  });

  if (walletOverlayPrimaryAction && primaryAction) {
    renderModeSwitch(actionKeys, primaryActionKey);
    renderPrimaryAction(primaryAction);
  }

  renderWalletHistory();

  walletOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    if (walletOverlayScroll) walletOverlayScroll.scrollTop = 0;
    walletOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
}

virtualCardToggle?.addEventListener("click", () => {
  if (document.body.classList.contains("is-pluspay")) return;
  if (!cardOverlay) return;
  virtualCardToggle.setAttribute("aria-expanded", "true");
  cardOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    cardOverlay.classList.add("is-open");
    syncPageScrollLock();
  });
});

virtualCardNumberToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isVisible =
    virtualCardNumberToggle.getAttribute("aria-pressed") === "true";
  const nextVisible = !isVisible;
  virtualCardNumberToggle.setAttribute("aria-pressed", String(nextVisible));
  virtualCardNumberToggle.setAttribute(
    "aria-label",
    nextVisible ? "Hide card number" : "Show card number",
  );
  virtualCardNumberNodes.forEach((node) => {
    node.textContent = nextVisible
      ? "4356 2468 0089 1234"
      : "xxxx xxxx xxxx 1234";
  });
});

// Keep the previous virtual-card-details behavior available for a future
// rollout, but do not attach it while the hero card should lead to Manage Cards.
// balanceCard?.addEventListener("click", (event) => {
//   if (document.body.classList.contains("is-pluspay")) return;
//   if (benefitsCardLockState.locked) return;
//   if (event.target.closest("[data-virtual-card-toggle]")) return;
//   virtualCardToggle?.click();
// });

balanceCard?.addEventListener("click", (event) => {
  if (document.body.classList.contains("is-pluspay")) return;
  if (benefitsCardLockState.locked) return;
  if (event.target.closest("[data-virtual-card-toggle]")) return;
  openManageCardsOverlay();
});

overlayCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCardOverlay);
});

walletButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openWalletOverlay(button);
  });
});

initializeTapPayDiscovery();

walletOverlayCloseButtons.forEach((button) => {
  button.addEventListener("click", closeWalletOverlay);
});

walletDirectoryOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openMerchantDirectory();
  });
});

merchantDirectoryCloseButtons.forEach((button) => {
  button.addEventListener("click", closeMerchantDirectory);
});

manageCardsOpenButtons.forEach((button) => {
  button.addEventListener("click", openManageCardsOverlay);
});

manageCardsCloseButtons.forEach((button) => {
  button.addEventListener("click", closeManageCardsOverlay);
});

trackCardOpenButtons.forEach((button) => {
  button.addEventListener("click", openTrackCardOverlay);
});

trackCardCloseButtons.forEach((button) => {
  button.addEventListener("click", closeTrackCardOverlay);
});

trackAwbCopyButton?.addEventListener("click", async () => {
  const awbNumber = trackAwb?.textContent?.trim();
  if (!awbNumber) return;

  try {
    await copyTextToClipboard(awbNumber);
    showToast("AWB number copied");
  } catch {
    showToast("Could not copy AWB number");
  }
});

trackStatusButton?.addEventListener("click", () => {
  showToast(trackStatusButton.dataset.toast);
});

trackActivationOpenButton?.addEventListener("click", () => {
  if (benefitsCardSecurityState.activated) {
    openCardPinOverlay();
    return;
  }
  openTrackActivationSheet();
});

trackActivationCloseButtons.forEach((button) => {
  button.addEventListener("click", closeTrackActivationSheet);
});

trackActivationCvvToggle?.addEventListener("click", () => {
  trackActivationCvvVisible = !trackActivationCvvVisible;
  renderTrackActivationCvv();
});

trackConfirmActivateButton?.addEventListener("click", () => {
  requestCardMpinVerification("activate-card");
});

cardPinOpenButtons.forEach((button) => {
  button.addEventListener("click", openCardPinOverlay);
});

cardPinCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCardPinOverlay);
});

cardPinInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(-1);
    if (input.value) {
      const groupInputs = getCardPinInputs(input.dataset.cardPinDigit);
      const index = groupInputs.indexOf(input);
      if (index < groupInputs.length - 1) {
        groupInputs[index + 1].focus();
      } else if (input.dataset.cardPinDigit === "pin") {
        getCardPinInputs("confirm")[0]?.focus();
      }
    }
    validateCardPin();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Backspace" || input.value) return;
    const allInputs = cardPinInputs;
    const index = allInputs.indexOf(input);
    if (index > 0) allInputs[index - 1].focus();
  });

  input.addEventListener("paste", (event) => {
    const digits = event.clipboardData
      ?.getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!digits) return;
    event.preventDefault();
    const groupInputs = getCardPinInputs(input.dataset.cardPinDigit);
    groupInputs.forEach((field, index) => {
      field.value = digits[index] || "";
    });
    (digits.length === 4
      ? input.dataset.cardPinDigit === "pin"
        ? getCardPinInputs("confirm")[0]
        : groupInputs[3]
      : groupInputs[digits.length]
    )?.focus();
    validateCardPin();
  });
});

cardPinVisibilityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const revealed = button.getAttribute("aria-pressed") !== "true";
    const group = button.dataset.cardPinVisibility;
    getCardPinInputs(group).forEach((input) => {
      input.type = revealed ? "text" : "password";
    });
    button.setAttribute("aria-pressed", String(revealed));
    button.setAttribute(
      "aria-label",
      `${revealed ? "Hide" : "Show"} ${
        group === "confirm" ? "re-entered " : ""
      }Benefits Card PIN`,
    );
  });
});

cardPinSubmitButton?.addEventListener("click", () => {
  if (!validateCardPin({ announce: true })) return;
  requestCardMpinVerification("set-card-pin");
});

cardSuccessCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCardSuccessSheet);
});

cardSuccessSetPinButton?.addEventListener("click", () => {
  closeCardSuccessSheet();
  window.setTimeout(openCardPinOverlay, 180);
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.source !== window.parent) return;
  if (
    event.data?.type !== CARD_MPIN_VERIFIED_MESSAGE &&
    event.data?.type !== CARD_MPIN_CANCELLED_MESSAGE
  ) {
    return;
  }
  if (event.data.intent !== pendingCardMpinIntent) return;

  const intent = pendingCardMpinIntent;
  pendingCardMpinIntent = null;
  if (event.data.type === CARD_MPIN_CANCELLED_MESSAGE) return;

  if (intent === "activate-card") {
    benefitsCardSecurityState.activated = true;
    renderBenefitsCardSecurityState();
    closeTrackActivationSheet();
    openCardSuccessSheet("activation");
    return;
  }

  if (intent === "set-card-pin") {
    // Read before the write: the sheet has to say which of the two just
    // happened, and afterwards a PIN always exists.
    const wasSet = benefitsCardSecurityState.pin !== null;
    benefitsCardSecurityState.pin = getCardPinValue("pin");
    renderBenefitsCardSecurityState();
    if (cardSuccessPinTitle) {
      cardSuccessPinTitle.innerHTML = `Your Benefits Card PIN has been<br />${
        wasSet ? "Reset" : "Set"
      } Successfully`;
    }
    closeCardPinOverlay();
    openCardSuccessSheet("pin");
  }
});

cardLockOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (benefitsCardLockState.locked) {
      openCardStatusSheet("unlocked");
      return;
    }
    openCardLockSheet();
  });
});

cardLockCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCardLockSheet);
});

cardLockConfirmButton?.addEventListener("click", () => {
  benefitsCardLockState.locked = true;
  renderBenefitsCardLockState();
  closeCardLockSheet();
  openCardStatusSheet("locked");
});

cardUnlockOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openCardStatusSheet("unlocked");
  });
});

cardStatusCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCardStatusSheet);
});

fallbackOpenButtons.forEach((button) => {
  button.addEventListener("click", openFallbackOverlay);
});

fallbackCloseButtons.forEach((button) => {
  button.addEventListener("click", closeFallbackOverlay);
});

fallbackInfoToggle?.addEventListener("click", () => {
  setFallbackInfoOpen(!fallbackInfo?.classList.contains("is-open"));
});

fallbackToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggleFallbackWallet(toggle.dataset.fallbackToggle);
  });
});

fallbackConfirmCloseButtons.forEach((button) => {
  button.addEventListener("click", closeFallbackConfirmSheet);
});

fallbackConfirmDisableButton?.addEventListener("click", confirmDisableFallback);

renderBenefitsCardLockState();
renderBenefitsCardSecurityState();
readFallbackState();
renderFallbackState();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (fallbackConfirmOverlay?.classList.contains("is-open")) {
      closeFallbackConfirmSheet();
      return;
    }
    if (cardSuccessOverlay?.classList.contains("is-open")) {
      closeCardSuccessSheet();
      return;
    }
    if (cardPinOverlay?.classList.contains("is-open")) {
      closeCardPinOverlay();
      return;
    }
    if (cardStatusOverlay?.classList.contains("is-open")) {
      closeCardStatusSheet();
      return;
    }
    if (cardLockOverlay?.classList.contains("is-open")) {
      closeCardLockSheet();
      return;
    }
    if (trackActivationOverlay?.classList.contains("is-open")) {
      closeTrackActivationSheet();
      return;
    }
    if (trackCardOverlay?.classList.contains("is-open")) {
      closeTrackCardOverlay();
      return;
    }
    if (fallbackOverlay?.classList.contains("is-open")) {
      closeFallbackOverlay();
      return;
    }
    closeCardOverlay();
    closeWalletOverlay();
    closeMerchantDirectory();
    closeManageCardsOverlay();
    closeClaimsAssistant();
    closeUpiSetupFlow();
  }
});

function syncPersonaToApp(payload) {
  const activePersona = window.localStorage.getItem("eb-claims:active-persona") || "returning";
  const persona = payload || personaDefinitions[activePersona] || personaDefinitions.returning;
  const isNewUser = !persona.hasTransactions;
  const financialState = personaFinancialState[activePersona] || personaFinancialState.returning;
  const name = persona.name;
  const upperName = name.toUpperCase();
  const initials = persona.initials;
  const upiHandle = `${name.toLowerCase().replace(/\s+/g, ".")}@pluspay`;
  const access = persona.access;

  document.body.classList.toggle(
    "is-product-locked",
    !(access.products.ebPlus && access.products.plusPay),
  );
  document.body.classList.toggle("is-no-upi", !access.upiEnabled);
  document.body.classList.toggle("is-lens-disabled", !access.products.ebPlus);
  document.body.classList.toggle("is-pluspay-disabled", !access.products.plusPay);
  applyMode(access.defaultProduct === "pluspay");
  applyUpiCreatedState(
    access.upiEnabled && (persona.hasUpiId || readUpiCreatedState()),
  );

  document.querySelectorAll("[data-no-upi-detail]").forEach((node) => {
    node.dataset.upiDetail ||= node.dataset.walletDetail || "";
    node.dataset.upiActions ||= node.dataset.walletActions || "";
    node.dataset.upiCta ||= node.dataset.walletCta || "";
    node.dataset.walletDetail = access.upiEnabled
      ? node.dataset.upiDetail
      : node.dataset.noUpiDetail;
    node.dataset.walletActions = access.upiEnabled
      ? node.dataset.upiActions
      : node.dataset.noUpiActions;
    node.dataset.walletCta = access.upiEnabled
      ? node.dataset.upiCta
      : node.dataset.noUpiCta;
  });

  // 1. Avatar button
  const avatarBtn = document.querySelector("[data-profile-open]");
  if (avatarBtn) avatarBtn.textContent = initials;

  // 2. Physical / virtual card details and overlay names
  document.querySelectorAll(".overlay-card-name, [data-manage-preview-holder]").forEach((el) => {
    el.textContent = upperName;
  });
  document.querySelectorAll(".card-details-meta strong, .card-details-row strong, .virtual-card-front strong, .virtual-card-back strong, .manage-cards-card strong").forEach((el) => {
    if (el.textContent === "Vishal Sharma" || el.textContent === "Aarav Patel" || el.textContent === "VISHAL SHARMA" || el.textContent === "AARAV PATEL") {
      el.textContent = el.textContent === el.textContent.toUpperCase() ? upperName : name;
    }
  });

  // 3. PlusPay handle data attributes
  document.querySelectorAll("[data-pluspay-text]").forEach((node) => {
    if (node.dataset.pluspayText && node.dataset.pluspayText.includes("@pluspay")) {
      node.dataset.pluspayText = upiHandle;
      if (document.body.classList.contains("is-pluspay")) {
        node.textContent = upiHandle;
      }
    }
  });

  // 4. Update manageWalletState
  if (typeof manageWalletState !== "undefined") {
    Object.keys(manageWalletState).forEach((key) => {
      if (manageWalletState[key].card) {
        manageWalletState[key].card.holder = upperName;
      }
      manageWalletState[key].balance = financialState.wallets[key].display;
      manageWalletState[key].limitUsed = financialState.limitUsed;
    });
    if (!access.upiEnabled && manageWalletState.misc) {
      manageWalletState.misc.accessCopy = "Claims, Card Payments, Approved Vendors";
    }
  }

  // 5. Update wallet chips on home screen
  Object.entries(financialState.wallets).forEach(([key, wallet]) => {
    const chip = document.querySelector(`.wallet-chip.${key}`);
    if (!chip) return;
    chip.setAttribute("data-wallet-balance", wallet.display);
    const amount = chip.querySelector("strong");
    if (amount) amount.textContent = wallet.display;
  });

  // 6. Gift points are excluded from the rupee balance shown on both cards.
  const totalBalance = ["meal", "fuel", "misc"].reduce(
    (sum, key) => sum + financialState.wallets[key].amount,
    0,
  );
  const totalBalanceDisplay = formatCurrency(totalBalance);
  if (currentWalletBalance) currentWalletBalance.textContent = totalBalanceDisplay;
  if (manageCurrentBalance) manageCurrentBalance.textContent = totalBalanceDisplay;
  renderManageWalletState();

  // 7. Transactions list visibility
  const txList = document.querySelector("[data-transaction-list]");
  if (txList) {
    const transactionItems = txList.querySelectorAll(":scope > .transaction-item");
    let emptyNotice = txList.querySelector("[data-no-tx-notice]");
    if (isNewUser) {
      transactionItems.forEach((item) => {
        item.hidden = true;
      });
      if (!emptyNotice) {
        emptyNotice = createEmptyTransactionState(
          "No transactions yet for your new account.",
        );
        emptyNotice.setAttribute("data-no-tx-notice", "true");
        txList.appendChild(emptyNotice);
      } else {
        emptyNotice.hidden = false;
      }
    } else {
      transactionItems.forEach((item) => {
        item.hidden = false;
      });
      if (emptyNotice) emptyNotice.hidden = true;
    }
  }

  const activeOverlayContent = walletOverlayContent[activeWalletTone];
  if (activeOverlayContent && walletOverlay?.classList.contains("is-open")) {
    renderWalletHistory();
  }
}

function syncWalletBalancesToApp(wallets) {
  if (!wallets || typeof wallets !== "object") return;
  const activePersona = window.localStorage.getItem("eb-claims:active-persona") || "returning";
  const financialState = personaFinancialState[activePersona] || personaFinancialState.returning;
  Object.keys(financialState.wallets).forEach((key) => {
    const next = wallets[key];
    if (!next || typeof next.amount !== "number" || typeof next.display !== "string") {
      return;
    }
    financialState.wallets[key] = {
      amount: Math.max(0, next.amount),
      display: next.display,
    };
    if (manageWalletState[key]) {
      manageWalletState[key].balance = next.display;
    }
    const chip = document.querySelector(`.wallet-chip.${key}`);
    if (chip) {
      chip.setAttribute("data-wallet-balance", next.display);
      const amount = chip.querySelector("strong");
      if (amount) amount.textContent = next.display;
    }
  });

  const totalBalance = ["meal", "fuel", "misc"].reduce(
    (sum, key) => sum + financialState.wallets[key].amount,
    0,
  );
  const totalBalanceDisplay = formatCurrency(totalBalance);
  if (currentWalletBalance) currentWalletBalance.textContent = totalBalanceDisplay;
  if (manageCurrentBalance) manageCurrentBalance.textContent = totalBalanceDisplay;
  renderManageWalletState();
}

applyMode(false);
applyUpiCreatedState(readUpiCreatedState());
syncPersonaToApp();
window.addEventListener("storage", (e) => {
  if (e.key === "eb-claims:active-persona" || e.key === null) {
    syncPersonaToApp();
  }
});
window.addEventListener("message", (e) => {
  if (e.data?.type === "employee-benefits:sync-persona") {
    syncPersonaToApp(e.data.persona);
  }
  if (e.data?.type === "employee-benefits:sync-transactions") {
    syncWalletBalancesToApp(e.data.wallets);
    renderSyncedTransactions(
      e.data.transactions,
      e.data.walletTransactions,
    );
  }
});
if (window.location.hash === "#claims") openClaimsAssistant();
