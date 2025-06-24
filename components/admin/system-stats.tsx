"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Heart, Clock, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalBookmarks: number;
  totalFavorites: number;
  totalReadingHistory: number;
}

export function SystemStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalBookmarks: 0,
    totalFavorites: 0,
    totalReadingHistory: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    try {
      // Get user stats
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalAdmins } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      // Get content stats
      const { count: totalBookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true });

      const { count: totalFavorites } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true });

      const { count: totalReadingHistory } = await supabase
        .from("reading_history")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalBookmarks: totalBookmarks || 0,
        totalFavorites: totalFavorites || 0,
        totalReadingHistory: totalReadingHistory || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      description: `${stats.totalAdmins} admin`,
    },
    {
      title: "Bookmark",
      value: stats.totalBookmarks,
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      description: "Ayat tersimpan",
    },
    {
      title: "Favorit",
      value: stats.totalFavorites,
      icon: Heart,
      color: "from-red-500 to-pink-500",
      description: "Surah favorit",
    },
    {
      title: "Riwayat Baca",
      value: stats.totalReadingHistory,
      icon: Clock,
      color: "from-purple-500 to-violet-500",
      description: "Aktivitas baca",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs">{stat.description}</p>
              </div>
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">
                +12% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
