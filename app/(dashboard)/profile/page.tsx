"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    },
  });

  const onSubmit = async (data: { name: string; email: string; avatar: string }) => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: res } = await api.put(`/users/${user._id}`, data);
      if (res.success) {
        await refreshUser();
        toast.success("Profile updated");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-lg">
              {user ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <span>
            <CardTitle>{user?.name}</CardTitle>
            <p className="text-sm capitalize text-muted-foreground">{user?.role}</p>
          </span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <fieldset className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
            </fieldset>
            <fieldset className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </fieldset>
            <fieldset className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" {...register("avatar")} placeholder="https://..." />
            </fieldset>
            <p className="text-sm text-muted-foreground">
              Department: <strong>{user?.department}</strong>
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
