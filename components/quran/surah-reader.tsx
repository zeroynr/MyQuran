"use client";

import { useState, useEffect, useRef } from "react";
import { getSurah } from "@/lib/quran-api";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Heart,
  BookOpen,
  MapPin,
  Star,
  Copy,
  Share2,
  Play,
  Pause,
  Bookmark,
  Volume2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface SurahReaderProps {
  surahNumber: number;
}

export default function SurahReader({ surahNumber }: SurahReaderProps) {
  const [surah, setSurah] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surahData = await getSurah(surahNumber);
        setSurah(surahData);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Record reading history
        if (user && surahData) {
          await supabase.from("reading_history").upsert(
            {
              user_id: user.id,
              surah_number: surahData.number,
              surah_name: surahData.englishName,
              ayah_number: 1,
              last_read_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,surah_number",
            }
          );
        }
      } catch (error) {
        console.error("Error fetching surah:", error);
        toast.error("Gagal memuat surah");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [surahNumber, supabase]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const addToFavorites = async () => {
    if (!user || !surah) {
      toast.error("Login diperlukan untuk menambah favorit");
      return;
    }

    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        surah_number: surah.number,
        surah_name: surah.englishName,
      });

      if (!error) {
        toast.success(`${surah.englishName} ditambahkan ke favorit`);
      } else if (error.code === "23505") {
        toast.success(`${surah.englishName} sudah ada di favorit`);
      }
    } catch (error) {
      toast.error("Gagal menambah ke favorit");
    }
  };

  const addBookmark = async () => {
    if (!user || !selectedAyah) {
      toast.error("Login diperlukan untuk menambah bookmark");
      return;
    }

    try {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        surah_number: surah.number,
        surah_name: surah.englishName,
        ayah_number: selectedAyah.numberInSurah,
        ayah_text: selectedAyah.text,
        note: bookmarkNote.trim() || null,
      });

      if (!error) {
        toast.success(`Ayat ${selectedAyah.numberInSurah} ditandai`);
        setBookmarkDialogOpen(false);
        setBookmarkNote("");
        setSelectedAyah(null);
      } else if (error.code === "23505") {
        toast.success("Ayat sudah ditandai sebelumnya");
      }
    } catch (error) {
      toast.error("Gagal menambah bookmark");
    }
  };

  const playAyah = async (ayahNumber: number, audioUrl: string) => {
    try {
      console.log(`🎵 Playing ayah ${ayahNumber}`);

      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      // If clicking the same ayah that's playing, stop it
      if (playingAyah === ayahNumber) {
        setPlayingAyah(null);
        setAudioLoading(null);
        return;
      }

      setAudioLoading(ayahNumber);

      // Create new audio element
      const audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.src = audioUrl;

      // Handle successful loading
      const handleCanPlay = () => {
        console.log(`✅ Audio ready for ayah ${ayahNumber}`);
        setAudioLoading(null);
        setPlayingAyah(ayahNumber);
      };

      // Handle audio ended
      const handleEnded = () => {
        console.log(`🏁 Audio ended for ayah ${ayahNumber}`);
        setPlayingAyah(null);
        setAudioLoading(null);
      };

      // Handle audio error
      const handleError = (e: any) => {
        console.error("Audio error:", e);
        setPlayingAyah(null);
        setAudioLoading(null);
        toast.error("Gagal memutar audio");
      };

      // Add event listeners
      audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });

      // Load and play
      audio.load();

      try {
        await audio.play();
        console.log(`▶️ Successfully started playing ayah ${ayahNumber}`);
        audioRef.current = audio;
      } catch (playError) {
        console.error(`❌ Play failed for ayah ${ayahNumber}:`, playError);
        handleError(playError);
      }
    } catch (error) {
      console.error(`💥 Error in playAyah for ayah ${ayahNumber}:`, error);
      setPlayingAyah(null);
      setAudioLoading(null);
      toast.error("Gagal memutar audio");
    }
  };

  const copyAyah = (ayahText: string, ayahNumber: number) => {
    navigator.clipboard.writeText(ayahText);
    toast.success(`Ayat ${ayahNumber} disalin ke clipboard`);
  };

  const shareAyah = (ayahText: string, ayahNumber: number) => {
    if (navigator.share) {
      navigator.share({
        title: `${surah.englishName} - Ayat ${ayahNumber}`,
        text: ayahText,
      });
    } else {
      copyAyah(ayahText, ayahNumber);
    }
  };

  const openBookmarkDialog = (ayah: any) => {
    if (!user) {
      toast.error("Login diperlukan untuk menambah bookmark");
      return;
    }
    setSelectedAyah(ayah);
    setBookmarkDialogOpen(true);
  };

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

  if (!surah) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 opacity-50" />
          </div>
          <p className="text-2xl font-semibold text-white mb-4">
            Surah tidak ditemukan
          </p>
          <Link href="/quran">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Surah
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between animate-slide-in">
            <Link href="/quran">
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            {user && (
              <Button
                onClick={addToFavorites}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                <Heart className="h-4 w-4 mr-2" />
                Tambah ke Favorit
              </Button>
            )}
          </div>

          {/* Surah Header */}
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-in delay-100">
            <CardContent className="text-center pb-8 pt-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Surah ke-{surah.number}
                </div>

                <div>
                  <p className="text-6xl md:text-7xl font-arabic text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text mb-4">
                    {surah.name}
                  </p>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {surah.englishName}
                  </h1>
                  <p className="text-xl text-gray-300 mb-4">
                    {surah.englishNameTranslation}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge
                    className={`${
                      surah.revelationType?.toLowerCase() === "meccan"
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    } border px-4 py-2 text-sm`}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {surah.revelationType === "Meccan"
                      ? "Makkiyah"
                      : "Madaniyah"}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border px-4 py-2 text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    {surah.numberOfAyahs} Ayat
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ayahs */}
          <div className="space-y-6 animate-slide-in delay-200">
            {surah.ayahs?.map((ayah: any, index: number) => (
              <Card
                key={ayah.number}
                className="group hover:shadow-2xl transition-all duration-500 bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Ayah Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">
                          {ayah.numberInSurah}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyAyah(ayah.text, ayah.numberInSurah)
                          }
                          className="text-gray-400 hover:text-white hover:bg-slate-700/50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            shareAyah(ayah.text, ayah.numberInSurah)
                          }
                          className="text-gray-400 hover:text-white hover:bg-slate-700/50"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Arabic Text - Right Aligned (RTL) */}
                    <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-2xl p-8 backdrop-blur-sm">
                      <p
                        className="text-5xl md:text-6xl leading-loose font-arabic text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text group-hover:from-emerald-200 group-hover:via-teal-200 group-hover:to-cyan-200 transition-all duration-500 drop-shadow-2xl text-right"
                        dir="rtl"
                        style={{ fontFamily: "Amiri, serif" }}
                      >
                        {ayah.text}
                      </p>
                    </div>

                    {/* Transliteration */}
                    {ayah.transliteration && (
                      <div className="bg-slate-700/30 rounded-2xl p-6 backdrop-blur-sm border border-slate-600/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-purple-300 font-semibold">
                            Transliterasi:
                          </p>
                        </div>
                        <p className="text-gray-100 italic text-lg leading-relaxed pl-11">
                          {ayah.transliteration}
                        </p>
                      </div>
                    )}

                    {/* Indonesian Translation */}
                    <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-2xl p-6 backdrop-blur-sm border border-emerald-500/30 shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-emerald-300 font-semibold">
                          Artinya:
                        </p>
                      </div>
                      <p className="text-white leading-relaxed text-lg pl-11">
                        {ayah.translation || "Terjemahan tidak tersedia"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAyah(ayah.numberInSurah, ayah.audio)}
                        disabled={audioLoading === ayah.numberInSurah}
                        className={`${
                          playingAyah === ayah.numberInSurah
                            ? "text-emerald-400 bg-emerald-500/20"
                            : audioLoading === ayah.numberInSurah
                            ? "text-yellow-400 bg-yellow-500/20"
                            : "text-emerald-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                        } transition-all duration-200`}
                      >
                        {audioLoading === ayah.numberInSurah ? (
                          <Volume2 className="w-4 h-4 mr-1 animate-pulse" />
                        ) : playingAyah === ayah.numberInSurah ? (
                          <Pause className="w-4 h-4 mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        {audioLoading === ayah.numberInSurah
                          ? "Loading..."
                          : playingAyah === ayah.numberInSurah
                          ? "Berhenti"
                          : "Putar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAyah(ayah.text, ayah.numberInSurah)}
                        className="text-gray-300 hover:text-white hover:bg-slate-700/50"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Salin
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBookmarkDialog(ayah)}
                        className="text-gray-300 hover:text-white hover:bg-slate-700/50"
                      >
                        <Bookmark className="w-4 h-4 mr-1" />
                        Tandai
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareAyah(ayah.text, ayah.numberInSurah)}
                        className="text-emerald-300 hover:text-emerald-400 hover:bg-emerald-500/10 ml-auto"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!surah.ayahs || surah.ayahs.length === 0) && (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-gray-400 mb-6">
                <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-2xl font-semibold mb-2">
                  Ayat tidak tersedia
                </p>
                <p className="text-lg">Silakan coba lagi nanti</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bookmark Dialog */}
      <Dialog open={bookmarkDialogOpen} onOpenChange={setBookmarkDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-400" />
              Tandai Ayat {selectedAyah?.numberInSurah}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">
                Ayat yang akan ditandai:
              </p>
              <p className="text-emerald-300 font-arabic text-lg" dir="rtl">
                {selectedAyah?.text}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Catatan (opsional):
              </label>
              <Textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Tambahkan catatan untuk ayat ini..."
                className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={addBookmark}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tandai Ayat
              </Button>
              <Button
                variant="outline"
                onClick={() => setBookmarkDialogOpen(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
