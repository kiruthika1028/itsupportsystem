"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (!user || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${user._id}`, { password });
      toast.success("Password updated");
      setPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Preferences and security</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </fieldset>
          <Button onClick={changePassword} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
