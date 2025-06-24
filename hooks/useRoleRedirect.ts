// hooks/useRoleRedirect.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useRoleRedirect() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user profile to check role
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setIsLoading(false);
            return;
          }

          const userRole = profile?.role || "user";
          const currentPath = window.location.pathname;

          // Redirect logic based on role and current path
          if (userRole === "admin" && currentPath.startsWith("/dashboard")) {
            router.replace("/admin");
            return;
          }

          if (userRole === "user" && currentPath.startsWith("/admin")) {
            router.replace("/dashboard");
            return;
          }

          // If on auth page and already logged in, redirect to appropriate dashboard
          if (currentPath === "/auth") {
            if (userRole === "admin") {
              router.replace("/admin");
            } else {
              router.replace("/dashboard");
            }
            return;
          }
        }
      } catch (error) {
        console.error("Error in role redirect:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndRedirect();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);

        // Check role and redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const userRole = profile?.role || "user";

        if (userRole === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return { user, isLoading };
}
