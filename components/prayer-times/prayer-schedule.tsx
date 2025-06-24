"use client";

import { useState, useEffect } from "react";
import { getPrayerTimes } from "@/lib/quran-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Star,
  Navigation,
  Calendar,
  Timer,
  Sparkles,
} from "lucide-react";

interface Prayer {
  name: string;
  time: string;
  key: string;
  tomorrow?: boolean;
}

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_ICONS = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
} as const;

const PRAYER_COLORS = {
  Fajr: "from-blue-500 to-indigo-500",
  Dhuhr: "from-yellow-500 to-orange-500",
  Asr: "from-orange-500 to-red-500",
  Maghrib: "from-red-500 to-pink-500",
  Isha: "from-purple-500 to-indigo-500",
} as const;

export default function PrayerTimesPage() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [city, setCity] = useState("Jakarta");
  const [inputCity, setInputCity] = useState("Jakarta");
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      const times = await getPrayerTimes(city);
      setPrayerTimes(times);
      setLoading(false);
    };

    fetchPrayerTimes();
  }, [city]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCityChange = () => {
    setCity(inputCity);
  };

  const prayerNames = {
    Fajr: "Subuh",
    Dhuhr: "Dzuhur",
    Asr: "Ashar",
    Maghrib: "Maghrib",
    Isha: "Isya",
  };

  const getNextPrayer = (): Prayer | null => {
    if (!prayerTimes) return null;

    const now = currentTime;
    const today = now.toDateString();

    const prayers: Prayer[] = [
      { name: "Subuh", time: prayerTimes.Fajr, key: "Fajr" },
      { name: "Dzuhur", time: prayerTimes.Dhuhr, key: "Dhuhr" },
      { name: "Ashar", time: prayerTimes.Asr, key: "Asr" },
      { name: "Maghrib", time: prayerTimes.Maghrib, key: "Maghrib" },
      { name: "Isya", time: prayerTimes.Isha, key: "Isha" },
    ];

    for (const prayer of prayers) {
      const prayerTime = new Date(`${today} ${prayer.time}`);
      if (prayerTime > now) {
        return prayer;
      }
    }

    return {
      name: "Subuh",
      time: prayerTimes.Fajr,
      key: "Fajr",
      tomorrow: true,
    };
  };

  const nextPrayer = getNextPrayer();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/20">
        <div className="flex justify-center items-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500/30"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-500 absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/20">
      {/* Header Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
              <Timer className="w-5 h-5" />
              Jadwal Sholat Akurat
            </div>

            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-slide-in">
              Jadwal Sholat
            </h1>
            <p className="text-2xl text-gray-300 mb-12 animate-slide-in delay-200 max-w-3xl mx-auto leading-relaxed">
              Dapatkan jadwal sholat yang akurat untuk kota Anda
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Location Input Card */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span>Pilih Lokasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Navigation className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Masukkan nama kota..."
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCityChange()}
                    className="pl-12 py-4 text-lg bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleCityChange}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Cari
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Time & Date */}
          <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-100">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Waktu Sekarang - {city}
                </h2>
              </div>
              <p className="text-gray-300 text-lg mb-4">
                {currentTime.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-5xl font-mono text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text font-bold">
                {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </CardContent>
          </Card>

          {/* Next Prayer */}
          {nextPrayer && (
            <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-200">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white">
                    Sholat Selanjutnya
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">
                    {nextPrayer.name}
                  </h3>
                  <p className="text-6xl font-mono text-white font-bold">
                    {nextPrayer.time}
                  </p>
                  {nextPrayer?.tomorrow && (
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full">
                      <Moon className="w-4 h-4" />
                      <span className="font-medium">Besok</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prayer Times Grid */}
          {prayerTimes && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-slide-in delay-300">
              {Object.entries(prayerNames).map(([key, name], index) => {
                const Icon = PRAYER_ICONS[key as keyof typeof PRAYER_ICONS];
                const colorGradient =
                  PRAYER_COLORS[key as keyof typeof PRAYER_COLORS];
                const isNext = nextPrayer?.key === key;

                return (
                  <Card
                    key={key}
                    className={`group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden ${
                      isNext
                        ? "ring-2 ring-emerald-500/50 shadow-emerald-500/25"
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${colorGradient} rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-6`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>

                        <div>
                          <h3 className="font-bold text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">
                            {name}
                          </h3>
                          <p className="text-3xl font-mono text-transparent bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text font-bold">
                            {prayerTimes[key as keyof PrayerTimes]}
                          </p>
                        </div>

                        {isNext && (
                          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            <span>Selanjutnya</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
