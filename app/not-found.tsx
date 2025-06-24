import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl p-8 text-center max-w-md w-full relative">
        <CardContent className="space-y-6">
          {/* 404 Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl font-bold text-white">404</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl"></div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-gray-300 text-lg">
              Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah
              dipindahkan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200">
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Button>
            </Link>
            <Link href="/quran" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Al-Quran
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">
              Atau coba cari apa yang Anda butuhkan:
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Search className="w-4 h-4" />
              <span>Fitur pencarian segera hadir</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
