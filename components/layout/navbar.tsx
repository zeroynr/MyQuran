"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Clock,
  Heart,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  User,
  Home,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

const navigation = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Al-Quran", href: "/quran", icon: BookOpen },
  { name: "Jadwal Sholat", href: "/prayer-times", icon: Clock },
  { name: "Doa Harian", href: "/daily-prayers", icon: Heart },
];

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      } else {
        // Fetch profile when user logs in
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Background blur overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
            : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-700/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300">
                  MyQuran
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Platform Islami</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        active
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg"
                          : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm"></div>
                      )}
                      <Icon
                        className={`h-4 w-4 relative z-10 ${
                          active ? "text-emerald-600" : ""
                        }`}
                      />
                      <span className="relative z-10 font-medium">
                        {item.name}
                      </span>
                      {active && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu / Auth Button */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 transform hover:scale-110"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-emerald-500/20">
                        <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold">
                          {profile?.full_name?.charAt(0) ||
                            user.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.role === "admin" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm">
                              {profile?.full_name?.charAt(0) ||
                                user.email?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {profile?.full_name || "User"}
                            </p>
                            <p className="text-xs leading-none text-gray-500 dark:text-gray-400 mt-1">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {profile?.role === "admin" && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full">
                            <Sparkles className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              Admin
                            </span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                      >
                        <User className="mr-3 h-4 w-4 text-emerald-600" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                        >
                          <Settings className="mr-3 h-4 w-4 text-orange-600" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6">
                    <User className="mr-2 h-4 w-4" />
                    Masuk
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="md:hidden p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl animate-slide-in">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {user && (
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 mt-4">
                  <div className="flex items-center space-x-3 mb-4 px-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        {profile?.full_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                    >
                      <User className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-900 dark:text-white">
                        Dashboard
                      </span>
                    </Link>
                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-900 dark:text-white">
                          Admin Panel
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
