import { Badge } from "@/components/ui/badge";
import type { TicketStatus, TicketPriority } from "@/lib/constants";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";

const statusVariant: Record<TicketStatus, "default" | "warning" | "success" | "secondary"> = {
  open: "default",
  in_progress: "warning",
  resolved: "success",
  closed: "secondary",
};

const priorityVariant: Record<TicketPriority, "secondary" | "default" | "warning" | "danger"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "danger",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant={statusVariant[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant={priorityVariant[priority]}>{PRIORITY_LABELS[priority]}</Badge>
  );
}
