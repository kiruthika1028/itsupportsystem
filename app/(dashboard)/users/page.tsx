"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import type { User } from "@/types";
import { DEPARTMENTS, ROLES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "IT",
  });

  const load = () => {
    api.get("/users").then((res) => {
      if (res.data.success) setUsers(res.data.data.users);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async () => {
    try {
      const { data } = await api.post("/users", form);
      if (data.success) {
        toast.success("User created");
        setOpen(false);
        load();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed";
      toast.error(msg || "Failed");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      await api.put(`/users/${id}`, { role });
      toast.success("Role updated");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <span>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage team members and roles</p>
        </span>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createUser();
                }}
              >
                <fieldset className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </fieldset>
                <fieldset className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={form.department}
                    onValueChange={(v) => setForm({ ...form, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </fieldset>
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Department</th>
                  {isAdmin && <th className="pb-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3">
                      {isAdmin ? (
                        <Select
                          value={u.role}
                          onValueChange={(v) => updateRole(u._id, v)}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r} className="capitalize">
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="capitalize">
                          {u.role}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">{u.department}</td>
                    {isAdmin && (
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(u._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
