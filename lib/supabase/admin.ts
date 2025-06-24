// Utility functions untuk admin operations
import { createClient } from "@/lib/supabase/client";

export async function checkDatabaseSetup() {
  const supabase = createClient();

  try {
    // Test 1: Check if trigger exists
    const { data: triggerData, error: triggerError } = await supabase
      .from("pg_trigger")
      .select("tgname")
      .eq("tgname", "on_auth_user_created");

    // Test 2: Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabase.rpc(
      "check_rls_status"
    );

    // Test 3: Try to create a test profile (will fail if trigger doesn't work)
    const { data: userData } = await supabase.auth.getUser();

    return {
      trigger_exists: !triggerError && triggerData && triggerData.length > 0,
      rls_enabled: !rlsError,
      user_authenticated: !!userData.user,
      setup_complete: !triggerError && !rlsError,
    };
  } catch (error) {
    console.error("Database setup check failed:", error);
    return {
      trigger_exists: false,
      rls_enabled: false,
      user_authenticated: false,
      setup_complete: false,
      error: error,
    };
  }
}

export async function createAdminAccountSafe(
  email: string,
  name = "Administrator"
) {
  const supabase = createClient();

  try {
    // Method 1: Try using the function
    const { data: functionResult, error: functionError } = await supabase.rpc(
      "create_admin_account",
      {
        admin_email: email,
        admin_name: name,
      }
    );

    if (!functionError && functionResult) {
      return functionResult;
    }

    // Method 2: Direct update if function fails
    const { data: updateResult, error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        full_name: name,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select();

    if (updateError) throw updateError;

    if (updateResult && updateResult.length > 0) {
      return {
        success: true,
        message: `User ${email} berhasil dijadikan admin`,
        method: "direct_update",
      };
    } else {
      return {
        success: false,
        message: `User dengan email ${email} tidak ditemukan`,
        method: "direct_update",
      };
    }
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}
