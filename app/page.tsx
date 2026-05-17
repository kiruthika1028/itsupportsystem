import Link from "next/link";
import {
  Headphones,
  Shield,
  Zap,
  BarChart3,
  Users,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Headphones className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">IT Support Portal</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Enterprise IT Support
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Internal support that scales with your team
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Raise tickets, track progress, and resolve issues faster. Built for IT
            departments with role-based access, analytics, and real-time updates.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Employee Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Ticket, title: "Ticket Management", desc: "Create, assign, and track support tickets end-to-end." },
          { icon: Shield, title: "Role-Based Access", desc: "Admin, support engineer, and employee permissions." },
          { icon: Zap, title: "Real-Time Updates", desc: "Live notifications and SSE heartbeat streams." },
          { icon: BarChart3, title: "Analytics", desc: "Resolution metrics, trends, and department reports." },
          { icon: Users, title: "User Management", desc: "Manage team members, roles, and departments." },
          { icon: Headphones, title: "24/7 Support Flow", desc: "Comments, attachments, and email notifications." },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <f.icon className="h-10 w-10 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} IT Support Portal. Enterprise internal use.
      </footer>
    </div>
  );
}
