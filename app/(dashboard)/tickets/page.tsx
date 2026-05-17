"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketTable } from "@/components/tickets/TicketTable";
import { useTickets } from "@/hooks/useTickets";
import { useTicketStream } from "@/hooks/useTicketStream";
import {
  TICKET_STATUSES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  STATUS_LABELS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const { tickets, pagination, loading, refetch } = useTickets({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
  });

  useTicketStream(refetch);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Manage and track support requests</p>
        </span>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Link>
        </Button>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:flex-row lg:items-end">
        <fieldset className="flex-1 space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {TICKET_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {TICKET_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(v) => { setPriority(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
      </section>

      <TicketTable tickets={tickets} loading={loading} />

      {pagination && pagination.pages > 1 && (
        <nav className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </section>
  );
}
