export const ROLES = ["admin", "support", "employee"] as const;
export type Role = (typeof ROLES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_CATEGORIES = [
  "hardware",
  "software",
  "network",
  "security",
  "account_access",
  "database",
  "cloud",
  "other",
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "IT",
  "Executive",
  "Other",
] as const;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  hardware: "Hardware",
  software: "Software",
  network: "Network",
  security: "Security",
  account_access: "Account Access",
  database: "Database",
  cloud: "Cloud",
  other: "Other",
};
