"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if we have the necessary tokens
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Set the session
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams, supabase.auth]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password berhasil diubah!");
      router.push("/auth");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Al-Quran Digital
              </h1>
            </Link>
          </div>

          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password Baru
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Konfirmasi Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Ubah Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              href="/auth"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
