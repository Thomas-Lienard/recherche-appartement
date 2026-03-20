import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, type ListingStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as ListingStatus] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <Badge variant="secondary" className={`${colors.bg} ${colors.text} border-0 font-medium`}>
      {status}
    </Badge>
  );
}
