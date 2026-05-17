"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TicketTable } from "@/components/tickets/TicketTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import type { DashboardStats, Activity, Ticket as TicketType } from "@/types";
import { formatDate } from "@/lib/utils";
import { useTicketStream } from "@/hooks/useTicketStream";
import { downloadAuthenticatedFile } from "@/lib/tab-session";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isStaff } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/tickets?limit=5"),
      ]);
      if (statsRes.data.success) {
        setStats(statsRes.data.data.stats);
        setActivities(statsRes.data.data.recentActivities || []);
      }
      if (ticketsRes.data.success) setRecentTickets(ticketsRes.data.data.tickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useTicketStream(load);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </span>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tickets" value={loading ? "—" : (stats?.total ?? 0)} icon={Ticket} />
        <StatCard title="Open" value={loading ? "—" : (stats?.open ?? 0)} icon={AlertCircle} />
        <StatCard title="Pending" value={loading ? "—" : (stats?.pending ?? 0)} icon={Clock} />
        <StatCard title="Closed" value={loading ? "—" : (stats?.closed ?? 0)} icon={CheckCircle} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tickets">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TicketTable tickets={recentTickets} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {activities.length === 0 && (
                <li className="text-sm text-muted-foreground">No recent activity</li>
              )}
              {activities.map((a) => (
                <li key={a._id} className="text-sm">
                  <p className="font-medium capitalize">
                    {typeof a.userId === "object" ? a.userId.name : "User"}{" "}
                    <span className="font-normal text-muted-foreground">{a.action.replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/analytics">View Analytics</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/users">Manage Users</Link>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await downloadAuthenticatedFile(
                    "/api/export/pdf",
                    "tickets-report.pdf"
                  );
                } catch {
                  toast.error("PDF export failed");
                }
              }}
            >
              Export PDF Report
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
