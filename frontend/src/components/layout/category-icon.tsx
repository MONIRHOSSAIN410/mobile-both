import {
  Cable,
  Cpu,
  Headphones,
  Phone,
  Smartphone,
  Tablet,
  Watch,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  phone: Phone,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  cable: Cable,
  cpu: Cpu,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Smartphone;
  return <Icon className={className} />;
}
