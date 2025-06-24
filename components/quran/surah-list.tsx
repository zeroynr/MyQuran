"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSurahs } from "@/lib/quran-api";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, BookOpen, MapPin, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Surah, Favorite } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "meccan" | "medinan">(
    "all"
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surahsData = await getSurahs();
        setSurahs(surahsData);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: favoritesData } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id);
          setFavorites(favoritesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data Al-Quran");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const toggleFavorite = async (surah: Surah) => {
    if (!user) {
      toast.error("Login diperlukan untuk menambah favorit");
      return;
    }

    const isFavorite = favorites.some(
      (fav) => fav.surah_number === surah.number
    );

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("surah_number", surah.number);

        if (!error) {
          setFavorites(
            favorites.filter((fav) => fav.surah_number !== surah.number)
          );
          toast.success(`${surah.englishName} dihapus dari favorit`);
        }
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          surah_number: surah.number,
          surah_name: surah.englishName,
        });

        if (!error) {
          const newFavorite: Favorite = {
            id: Date.now().toString(),
            user_id: user.id,
            surah_number: surah.number,
            surah_name: surah.englishName,
            created_at: new Date().toISOString(),
          };
          setFavorites([...favorites, newFavorite]);
          toast.success(`${surah.englishName} ditambahkan ke favorit`);
        }
      }
    } catch (error) {
      toast.error("Gagal mengubah favorit");
    }
  };

  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch =
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.name.includes(searchTerm) ||
      surah.englishNameTranslation
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "meccan" &&
        surah.revelationType.toLowerCase() === "meccan") ||
      (filterType === "medinan" &&
        surah.revelationType.toLowerCase() === "medinan");

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
        <div className="flex justify-center items-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500/30"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-emerald-500 absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
              <Sparkles className="w-5 h-5" />
              Al-Quran Digital
            </div>

            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6 animate-slide-in">
              Al-Quran
            </h1>
            <p className="text-2xl text-gray-300 mb-12 animate-slide-in delay-200 max-w-3xl mx-auto leading-relaxed">
              Baca Al-Quran lengkap 114 surah dengan terjemahan bahasa Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Search and Filter */}
          <div className="space-y-6 animate-slide-in">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                placeholder="Cari surah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 py-6 text-xl bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20 backdrop-blur-sm rounded-2xl shadow-xl"
              />
            </div>

            <div className="flex justify-center gap-4">
              {[
                { key: "all", label: "Semua", icon: BookOpen },
                { key: "meccan", label: "Makkiyah", icon: MapPin },
                { key: "medinan", label: "Madaniyah", icon: Star },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    filterType === key
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Surah Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-in delay-200">
            {filteredSurahs.map((surah, index) => {
              const isFavorite = favorites.some(
                (fav) => fav.surah_number === surah.number
              );

              return (
                <Card
                  key={surah.number}
                  className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6">
                          <span className="text-white font-bold text-lg">
                            {surah.number}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                            {surah.englishName}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {surah.englishNameTranslation}
                          </p>
                        </div>
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(surah)}
                          className="p-2 hover:bg-red-500/20 transition-colors duration-300"
                        >
                          <Heart
                            className={`h-5 w-5 transition-all duration-300 ${
                              isFavorite
                                ? "fill-red-500 text-red-500 scale-110"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          />
                        </Button>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-4xl font-arabic text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                        {surah.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge
                          className={`${
                            surah.revelationType.toLowerCase() === "meccan"
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          } border`}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {surah.revelationType === "Meccan"
                            ? "Makkiyah"
                            : "Madaniyah"}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <BookOpen className="w-4 h-4" />
                          <span>{surah.numberOfAyahs} ayat</span>
                        </div>
                      </div>

                      <Link href={`/quran/${surah.number}`}>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Baca
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSurahs.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-gray-400 mb-6">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-2xl font-semibold mb-2">
                  Tidak ada surah yang ditemukan
                </p>
                <p className="text-lg">
                  Coba ubah kata kunci pencarian atau filter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
