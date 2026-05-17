"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(1),
  priority: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) setAttachments((a) => [...a, data.data.url]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await api.post("/tickets", { ...data, attachments });
      if (res.success) {
        toast.success("Ticket created");
        router.push(`/tickets/${res.data.ticket._id}`);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed to create ticket";
      toast.error(msg || "Failed to create ticket");
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Create Ticket</h1>
        <p className="text-muted-foreground">Describe your IT issue</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ticket details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <fieldset className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Brief summary" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </fieldset>

            <fieldset className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the issue in detail..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </fieldset>

            <section className="grid gap-4 sm:grid-cols-2">
              <fieldset className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
              <fieldset className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="medium" onValueChange={(v) => setValue("priority", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
            </section>

            <fieldset className="space-y-2">
              <Label>Attachments</Label>
              <Input type="file" accept="image/*,.pdf,.txt" onChange={handleFile} disabled={uploading} />
              {attachments.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {attachments.map((url) => (
                    <li key={url} className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs">
                      <Upload className="h-3 w-3" />
                      {url.split("/").pop()}
                      <button type="button" onClick={() => setAttachments((a) => a.filter((u) => u !== url))}>
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
