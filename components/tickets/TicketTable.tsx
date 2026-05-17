"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import type { Ticket } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketTableProps {
  tickets: Ticket[];
  loading?: boolean;
}

export function TicketTable({ tickets, loading }: TicketTableProps) {
  if (loading) {
    return (
      <>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </>
    );
  }

  if (!tickets.length) {
    return (
      <>
        <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No tickets found. Create your first support ticket.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Priority</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/tickets/${ticket._id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell capitalize">
                  {CATEGORY_LABELS[ticket.category]}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {formatDate(ticket.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
