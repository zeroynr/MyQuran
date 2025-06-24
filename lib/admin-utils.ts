import { createClient } from "@/lib/supabase/client";

export async function createAdminAccount(
  email: string,
  name = "Administrator"
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("create_admin_account", {
      admin_email: email,
      admin_name: name,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creating admin account:", error);
    throw error;
  }
}

export async function getAllProfiles() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "user" | "admin"
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}
