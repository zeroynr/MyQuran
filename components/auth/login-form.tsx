"use client";

import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // If profile doesn't exist, create it
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || "",
              role: "user",
            });

          if (createError) {
            console.error("Profile creation error:", createError);
          }
        }

        const userRole = profile?.role || "user";
        const userName = profile?.full_name || "User";

        toast.success(`Selamat datang kembali, ${userName}!`);

        // Redirect based on role
        if (userRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal masuk. Periksa email dan password Anda.";
      console.error("Sign in error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Pendaftaran berhasil!");

        // If user is immediately confirmed
        if (data.session) {
          toast.success("Login otomatis berhasil!");
          router.push("/dashboard");
          router.refresh();
        } else {
          toast.success("Silakan cek email untuk verifikasi, lalu login.");
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mendaftar. Silakan coba lagi.";
      console.error("Sign up error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success(
        "Email reset password telah dikirim. Silakan cek inbox Anda."
      );
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengirim email reset password.";
      console.error("Password reset error:", error);
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
        <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-md space-y-8">
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Masukkan email Anda untuk menerima link reset password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Mengirim..." : "Kirim Email Reset"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-gray-300"
                    onClick={() => setShowResetForm(false)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-8 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Al-Quran Digital
                </h1>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Platform Islami</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Auth Card */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl shadow-2xl animate-slide-in delay-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-gray-300">
                Masuk atau daftar untuk mengakses fitur lengkap Al-Quran Digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border-slate-600">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-300"
                  >
                    Masuk
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-300"
                  >
                    Daftar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-password"
                        className="text-gray-300"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                          required
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
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={loading}
                    >
                      {loading ? "Memproses..." : "Masuk"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-gray-300"
                      onClick={() => setShowResetForm(true)}
                    >
                      Lupa Password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-fullname"
                        className="text-gray-300"
                      >
                        Nama Lengkap
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signup-fullname"
                          type="text"
                          placeholder="Nama lengkap Anda"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-gray-300"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signup-password"
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
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={loading}
                    >
                      {loading ? "Memproses..." : "Daftar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Dengan mendaftar, Anda akan mendapatkan akses ke fitur
                  favorit, riwayat bacaan, dan bookmark ayat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center animate-fade-in delay-400">
            <Link
              href="/"
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
