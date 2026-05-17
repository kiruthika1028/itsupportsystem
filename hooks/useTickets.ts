"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Ticket, Pagination } from "@/types";

interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

export function useTickets(filters: TicketFilters = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      const { data } = await api.get(`/tickets?${params}`);
      if (data.success) {
        setTickets(data.data.tickets);
        setPagination(data.data.pagination);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed to load tickets";
      setError(message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status, filters.category, filters.priority, filters.search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, pagination, loading, error, refetch: fetchTickets };
}
