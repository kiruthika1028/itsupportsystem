import type { Role, TicketCategory, TicketPriority, TicketStatus } from "@/lib/constants";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  userId: User | string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: string[];
  createdBy: User | string;
  assignedTo?: User | string;
  comments: Comment[];
  internalNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  pending: number;
}

export interface Activity {
  _id: string;
  userId: User;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
