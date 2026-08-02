import { AppIcon } from "@/components/shared/AppIcon";
import type { PolicyListIconId } from "@/features/policy/constants";
import { CATEGORY_ICONS } from "@/lib/ui/assets";

export function PolicyListIcon({
  id,
  size = 24,
}: {
  id: PolicyListIconId;
  tone?: string;
  size?: number;
}) {
  return <AppIcon src={CATEGORY_ICONS[id]} size={size} alt="" />;
}
