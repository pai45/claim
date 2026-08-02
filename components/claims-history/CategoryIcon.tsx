import { AppIcon } from "@/components/shared/AppIcon";
import { CATEGORY_ICONS, type CategoryIconId } from "@/lib/ui/assets";

type CategoryIconProps = {
  icon: CategoryIconId;
  color?: string;
  size?: number;
};

export function CategoryIcon({ icon, size = 24 }: CategoryIconProps) {
  return <AppIcon src={CATEGORY_ICONS[icon]} size={size} alt="" />;
}
