"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const employeeLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "My Tickets", icon: Ticket },
  { href: "/tickets/new", label: "New Ticket", icon: Ticket },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

const staffLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "All Tickets", icon: Ticket },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isStaff } = useAuth();
  const links = isStaff ? staffLinks : employeeLinks;

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Headphones className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold">IT Support</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
