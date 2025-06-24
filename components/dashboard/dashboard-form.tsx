"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Heart,
  History,
  Bookmark,
  User,
  Star,
  Clock,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type {
  Profile,
  Favorite,
  ReadingHistory,
  BookmarkAyah,
} from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);

          // Fetch favorites
          const { data: favoritesData } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setFavorites(favoritesData || []);

          // Fetch reading history
          const { data: historyData } = await supabase
            .from("reading_history")
            .select("*")
            .eq("user_id", user.id)
            .order("last_read_at", { ascending: false })
            .limit(10);
          setReadingHistory(historyData || []);

          // Fetch bookmarks
          const { data: bookmarksData } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setBookmarks(bookmarksData || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (!error) {
        setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
        toast.success("Favorit dihapus");
      }
    } catch {
      toast.error("Gagal menghapus favorit");
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (!error) {
        setBookmarks(
          bookmarks.filter((bookmark) => bookmark.id !== bookmarkId)
        );
        toast.success("Bookmark dihapus");
      }
    } catch {
      toast.error("Gagal menghapus bookmark");
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from("reading_history")
        .delete()
        .eq("user_id", user?.id);

      if (!error) {
        setReadingHistory([]);
        toast.success("Riwayat bacaan dihapus");
      }
    } catch {
      toast.error("Gagal menghapus riwayat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
        <div className="flex justify-center items-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500/30"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-emerald-500 absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20 flex items-center justify-center">
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl p-8 text-center">
          <CardContent>
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Akses Terbatas
            </h2>
            <p className="text-gray-300 mb-6">
              Silakan masuk untuk mengakses dashboard
            </p>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
                Masuk Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
              <Sparkles className="w-5 h-5" />
              Dashboard Pribadi
            </div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6 animate-slide-in">
              Selamat Datang, {profile?.full_name || "User"}
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-slide-in delay-200 max-w-2xl mx-auto leading-relaxed">
              Kelola aktivitas Al-Quran Anda dengan mudah
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Profile Card */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span>Profil Pengguna</span>
                {profile?.role === "admin" && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Nama Lengkap</p>
                <p className="text-white font-semibold">
                  {profile?.full_name || "Tidak diset"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">
                  {profile?.email || user.email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Bergabung Sejak</p>
                <p className="text-white font-semibold">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("id-ID")
                    : "Tidak diketahui"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 animate-slide-in delay-100">
            <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {favorites.length}
                </h3>
                <p className="text-emerald-300">Surah Favorit</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6 text-center">
                <History className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {readingHistory.length}
                </h3>
                <p className="text-blue-300">Riwayat Bacaan</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6 text-center">
                <Bookmark className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {bookmarks.length}
                </h3>
                <p className="text-purple-300">Bookmark Ayat</p>
              </CardContent>
            </Card>
          </div>

          {/* Favorites Section */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span>Surah Favorit</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="bg-slate-700/30 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {favorite.surah_number}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">
                            {favorite.surah_name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Ditambahkan{" "}
                            {new Date(favorite.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/quran/${favorite.surah_number}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFavorite(favorite.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">Belum ada surah favorit</p>
                  <Link href="/quran">
                    <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500">
                      Jelajahi Al-Quran
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reading History Section */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  <span>Riwayat Bacaan</span>
                </CardTitle>
                {readingHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Semua
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {readingHistory.length > 0 ? (
                <div className="space-y-3">
                  {readingHistory.map((history) => (
                    <div
                      key={history.id}
                      className="bg-slate-700/30 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {history.surah_number}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">
                            {history.surah_name}
                          </h4>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(history.last_read_at).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                      <Link href={`/quran/${history.surah_number}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Lanjutkan
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">Belum ada riwayat bacaan</p>
                  <Link href="/quran">
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                      Mulai Membaca
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookmarks Section */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <span>Bookmark Ayat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarks.length > 0 ? (
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="bg-slate-700/30 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {bookmark.surah_number}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {bookmark.surah_name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Ayat {bookmark.ayah_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/quran/${bookmark.surah_number}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBookmark(bookmark.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {bookmark.note && (
                        <div className="bg-slate-600/30 rounded-lg p-3">
                          <p className="text-gray-300 text-sm italic">
                            "{bookmark.note}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">Belum ada bookmark ayat</p>
                  <Link href="/quran">
                    <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500">
                      Mulai Bookmark
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
