import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminDashboard user={user} profile={profile} />;
}
