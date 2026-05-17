"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/tickets/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import type { Ticket, User } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import {
  TICKET_STATUSES,
  STATUS_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { toast } from "sonner";
import { useTicketStream } from "@/hooks/useTicketStream";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isStaff } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [comment, setComment] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      if (data.success) setTicket(data.data.ticket);
    } catch {
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    if (isStaff) {
      api.get("/users?role=support").then((res) => {
        if (res.data.success) {
          api.get("/users").then((all) => {
            if (all.data.success) {
              const staff = all.data.data.users.filter(
                (u: User) => u.role === "support" || u.role === "admin"
              );
              setEngineers(staff);
            }
          });
        }
      });
    }
  }, [id, isStaff, load]);

  useTicketStream(load);

  const updateTicket = async (payload: Record<string, unknown>) => {
    try {
      const { data } = await api.put(`/tickets/${id}`, payload);
      if (data.success) {
        setTicket(data.data.ticket);
        toast.success("Ticket updated");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Update failed";
      toast.error(msg || "Update failed");
    }
  };

  const addComment = async (isInternal = false) => {
    const message = isInternal ? internalNote : comment;
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${id}/comments`, { message, isInternal });
      if (data.success) {
        setTicket(data.data.ticket);
        setComment("");
        setInternalNote("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  if (!ticket) {
    return <p className="text-center py-20 text-muted-foreground">Ticket not found</p>;
  }

  const creator =
    typeof ticket.createdBy === "object" ? ticket.createdBy : null;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <span>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(ticket.createdAt)} by {creator?.name || "Unknown"}
          </p>
        </span>
        <span className="flex gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </span>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
            {ticket.attachments?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {ticket.attachments.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted"
                    >
                      <Paperclip className="h-3 w-3" />
                      {url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <span className="text-muted-foreground">Category: </span>
              {CATEGORY_LABELS[ticket.category]}
            </p>
            {isStaff && (
              <>
                <fieldset className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={ticket.status}
                    onValueChange={(v) => updateTicket({ status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Assign to</Label>
                  <Select
                    value={
                      typeof ticket.assignedTo === "object" && ticket.assignedTo
                        ? ticket.assignedTo._id
                        : (ticket.assignedTo as string) || "unassigned"
                    }
                    onValueChange={(v) =>
                      updateTicket({ assignedTo: v === "unassigned" ? null : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {engineers.map((e) => (
                        <SelectItem key={e._id} value={e._id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Internal notes</Label>
                  <Textarea
                    value={internalNote || ticket.internalNotes || ""}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateTicket({ internalNotes: internalNote })}
                  >
                    Save notes
                  </Button>
                </fieldset>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-4">
            {ticket.comments?.map((c) => {
              const author = typeof c.userId === "object" ? c.userId : null;
              return (
                <li key={c._id} className="flex gap-3 rounded-lg border p-4">
                  <Avatar>
                    <AvatarImage src={author?.avatar} />
                    <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
                  </Avatar>
                  <article className="flex-1">
                    <p className="text-sm font-medium">
                      {author?.name || "User"}
                      {c.isInternal && (
                        <span className="ml-2 rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700">
                          Internal
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm">{c.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>

          <fieldset className="space-y-2">
            <Label>Add reply</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your message..."
              rows={3}
            />
            <Button onClick={() => addComment(false)} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post comment"}
            </Button>
          </fieldset>

          {isStaff && (
            <fieldset className="space-y-2 border-t pt-4">
              <Label>Internal comment (staff only)</Label>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
              />
              <Button variant="secondary" size="sm" onClick={() => addComment(true)} disabled={submitting}>
                Add internal comment
              </Button>
            </fieldset>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
