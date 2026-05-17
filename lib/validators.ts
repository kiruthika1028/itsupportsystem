import { z } from "zod";
import {
  DEPARTMENTS,
  ROLES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "./constants";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  department: z.enum(DEPARTMENTS as unknown as [string, ...string[]]),
  role: z.enum(ROLES).optional().default("employee"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ticketCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  attachments: z.array(z.string()).optional(),
});

export const ticketUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  assignedTo: z.string().nullable().optional(),
  internalNotes: z.string().max(2000).optional(),
  attachments: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  message: z.string().min(1).max(2000),
  isInternal: z.boolean().optional().default(false),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(ROLES).optional(),
  department: z.enum(DEPARTMENTS as unknown as [string, ...string[]]).optional(),
  avatar: z.string().url().optional().nullable(),
  password: z.string().min(8).max(128).optional(),
});
