"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "lucide-react";

export function DebugAuth() {
  const [user, setUser] = useState<unknown>(null);
  const [profile, setProfile] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        setProfile(profileData);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div className="text-white">Loading auth debug...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 space-y-2 z-50">
      <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <User className="w-4 h-4" />
            Auth Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong className="text-blue-400">User:</strong>
            <pre className="text-gray-300 bg-slate-900 p-1 rounded mt-1 overflow-x-auto">
              {user &&
              typeof user === "object" &&
              "id" in user &&
              "email" in user
                ? JSON.stringify({ id: user.id, email: user.email }, null, 2)
                : "Not logged in"}
            </pre>
          </div>
          <div>
            <strong className="text-green-400">Profile:</strong>
            <pre className="text-gray-300 bg-slate-900 p-1 rounded mt-1 overflow-x-auto">
              {profile ? JSON.stringify(profile, null, 2) : "No profile"}
            </pre>
          </div>
          <Button size="sm" onClick={checkAuth} className="w-full">
            Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
