import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, Folder, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Boshqaruv paneli — Vazifa" }] }),
  component: Dashboard,
});

type Profile = { full_name: string | null };

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0, sections: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { count: total }, { count: done }, { count: pending }, { count: sectionsCount }] =
        await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
          supabase.from("sections").select("*", { count: "exact", head: true }).eq("is_active", true),
        ]);
      setProfile(prof);
      setStats({
        total: total ?? 0,
        done: done ?? 0,
        pending: pending ?? 0,
        sections: sectionsCount ?? 0,
      });
    })();
  }, []);

  return (
    <AppShell
      title="Boshqaruv paneli"
      actions={
        <Button asChild size="sm">
          <Link to="/sections">
            <Plus className="size-4" /> Bo'limlar
          </Link>
        </Button>
      }
    >
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Assalomu alaykum, {profile?.full_name ?? "Foydalanuvchi"} 👋
        </h2>
        <p className="mt-2 text-muted-foreground">Bugungi vazifalaringizning umumiy ko'rinishi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ListTodo className="size-5" />} label="Jami vazifalar" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="size-5 text-success" />} label="Bajarilgan" value={stats.done} />
        <StatCard icon={<Clock className="size-5 text-warning" />} label="Kutilmoqda" value={stats.pending} />
        <StatCard icon={<Folder className="size-5 text-accent" />} label="Bo'limlar" value={stats.sections} />
      </div>

      <Card className="mt-8 glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display">Keyingi qadamlar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            2-bosqich tugadi: <strong className="text-foreground">bo'limlar boshqaruvi (CRUD)</strong> qo'shildi va 7 ta standart bo'lim seed qilindi.
            Keyingi 3-bosqichda <strong className="text-foreground">3 ta vazifa turi</strong> (kunlik / muddatli / bir martalik) joriy etiladi.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="glass border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
