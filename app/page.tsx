import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Heart, Users, Sparkles, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
              <Sparkles className="w-4 h-4" />
              Platform Islami Terlengkap
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-slide-in">
              MyQuran
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-in delay-200">
              Platform digital untuk membaca Al-Quran, melihat jadwal sholat,
              dan mengakses doa-doa harian. Dilengkapi dengan fitur favorit dan
              riwayat bacaan untuk pengalaman yang lebih personal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in delay-300">
              <Link href="/quran">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Mulai Membaca Al-Quran
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/20 transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Masuk / Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 px-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Akses Cepat
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Mulai perjalanan spiritual Anda sekarang
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                href: "/quran",
                icon: BookOpen,
                title: "Baca Al-Quran",
                description: "Mulai membaca Al-Quran dari surah mana pun",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                href: "/prayer-times",
                icon: Clock,
                title: "Jadwal Sholat",
                description: "Cek waktu sholat untuk lokasi Anda",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                href: "/daily-prayers",
                icon: Heart,
                title: "Doa Harian",
                description: "Pelajari doa-doa untuk aktivitas sehari-hari",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((item, index) => (
              <Link key={index} href={item.href}>
                <Card
                  className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12`}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fitur Utama
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Jelajahi berbagai fitur yang membantu ibadah harian Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Al-Quran Digital",
                description:
                  "Baca Al-Quran lengkap 30 Juz dengan teks Arab yang jelas",
                gradient: "from-emerald-500 to-teal-500",
                bgGradient: "from-emerald-50 to-teal-50",
                darkBgGradient: "from-emerald-900/20 to-teal-900/20",
                delay: "delay-100",
              },
              {
                icon: Clock,
                title: "Jadwal Sholat",
                description:
                  "Lihat jadwal sholat akurat berdasarkan lokasi Anda",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50",
                darkBgGradient: "from-blue-900/20 to-cyan-900/20",
                delay: "delay-200",
              },
              {
                icon: Heart,
                title: "Doa Harian",
                description:
                  "Koleksi doa-doa harian dengan teks Arab, transliterasi, dan terjemahan",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50",
                darkBgGradient: "from-purple-900/20 to-pink-900/20",
                delay: "delay-300",
              },
              {
                icon: Star,
                title: "Fitur Personal",
                description:
                  "Simpan surah favorit dan lacak riwayat bacaan Anda",
                gradient: "from-orange-500 to-red-500",
                bgGradient: "from-orange-50 to-red-50",
                darkBgGradient: "from-orange-900/20 to-red-900/20",
                delay: "delay-400",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br ${feature.bgGradient} dark:${feature.darkBgGradient} border-0 animate-slide-in ${feature.delay}`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
