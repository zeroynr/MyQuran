"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Heart,
  Utensils,
  Moon,
  Building,
  Sparkles,
  Star,
} from "lucide-react";
import type { DailyPrayer } from "@/lib/types";

const CATEGORY_ICONS = {
  makan: Utensils,
  tidur: Moon,
  masjid: Building,
  umum: Heart,
} as const;

const CATEGORY_COLORS = {
  makan: "from-orange-500 to-red-500",
  tidur: "from-indigo-500 to-purple-500",
  masjid: "from-emerald-500 to-teal-500",
  umum: "from-pink-500 to-rose-500",
} as const;

export default function DailyPrayersPage() {
  const [prayers, setPrayers] = useState<DailyPrayer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPrayers = async () => {
      const { data, error } = await supabase
        .from("daily_prayers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPrayers(data);
      }
      setLoading(false);
    };

    fetchPrayers();
  }, [supabase]);

  const categories = [
    "all",
    ...new Set(prayers.map((prayer) => prayer.category)),
  ];

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch =
      prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prayer.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || prayer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Heart;
  };

  const getCategoryColor = (category: string) => {
    return (
      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
      "from-gray-500 to-gray-600"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-pink-900/20">
        <div className="flex justify-center items-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-pink-900/20">
      {/* Header Section */}
      <div className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
              <Sparkles className="w-4 h-4" />
              Koleksi Doa Terlengkap
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-slide-in">
              Doa Harian
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-slide-in delay-200">
              Koleksi doa-doa untuk aktivitas sehari-hari
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 mb-8">
        <div className="max-w-2xl mx-auto relative animate-slide-in">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari doa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-4 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 backdrop-blur-sm text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center animate-slide-in delay-200">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category === "all"
                    ? "Semua"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prayer Cards */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredPrayers.map((prayer, index) => {
            const Icon = getCategoryIcon(prayer.category);
            const colorGradient = getCategoryColor(prayer.category);

            return (
              <Card
                key={prayer.id}
                className="group hover:shadow-2xl transition-all duration-500 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm animate-slide-in overflow-hidden"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                          {prayer.title}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge
                      className={`bg-gradient-to-r ${colorGradient} text-white border-0 px-3 py-1`}
                    >
                      {prayer.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Arabic Text - Made Much Larger */}
                  <div className="text-right bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-xl p-6 backdrop-blur-sm">
                    <p className="text-5xl md:text-6xl leading-loose font-arabic text-purple-400 group-hover:text-purple-300 transition-colors duration-300 mb-4">
                      {prayer.arabic_text}
                    </p>
                  </div>

                  {/* Transliteration */}
                  {prayer.transliteration && (
                    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-purple-400" />
                        <p className="text-purple-300 font-semibold text-lg">
                          Transliterasi:
                        </p>
                      </div>
                      <p className="text-gray-100 italic text-lg leading-relaxed">
                        {prayer.transliteration}
                      </p>
                    </div>
                  )}

                  {/* Translation */}
                  <div
                    className={`bg-gradient-to-r ${colorGradient}/10 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-purple-400" />
                      <p className="text-purple-300 font-semibold text-lg">
                        Artinya:
                      </p>
                    </div>
                    <p className="text-white leading-relaxed text-lg">
                      {prayer.translation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredPrayers.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Tidak ada doa yang ditemukan</p>
                <p className="text-sm">
                  Coba ubah kata kunci pencarian atau kategori
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
