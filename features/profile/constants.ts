export const PROFILE_USER = {
  name: "Vishal Sharma",
  initials: "V",
  memberSince: "UPI Member since January 2022",
} as const;

export type ProfileMenuId = "profile" | "autopay" | "collect" | "logout";

export type ProfileMenuItem = {
  id: ProfileMenuId;
  title: string;
  subtitle?: string;
  iconBg: string;
  showChevron: boolean;
};

/** Icon tile backgrounds use existing surface/status soft tokens (via Tailwind classes). */
export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  {
    id: "profile",
    title: "Profile",
    subtitle: "Manage your profile information",
    iconBg: "bg-success-tint",
    showChevron: true,
  },
  {
    id: "autopay",
    title: "AutoPay",
    subtitle: "Manage recurring payments",
    iconBg: "bg-surface-tint-strong",
    showChevron: true,
  },
  {
    id: "collect",
    title: "Collect Requests",
    subtitle: "Manage incoming payment requests",
    iconBg: "bg-warning-tint",
    showChevron: true,
  },
  {
    id: "logout",
    title: "Logout",
    iconBg: "bg-surface-muted",
    showChevron: false,
  },
];
