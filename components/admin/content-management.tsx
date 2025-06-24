"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { DailyPrayer } from "@/lib/types";

export function ContentManagement() {
  const [prayers, setPrayers] = useState<DailyPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<DailyPrayer | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    arabic_text: "",
    transliteration: "",
    translation: "",
    category: "pagi",
  });

  const supabase = createClient();

  const categories = [
    { value: "pagi", label: "Doa Pagi" },
    { value: "sore", label: "Doa Sore" },
    { value: "makan", label: "Doa Makan" },
    { value: "tidur", label: "Doa Tidur" },
    { value: "perjalanan", label: "Doa Perjalanan" },
    { value: "umum", label: "Doa Umum" },
  ];

  const fetchPrayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("daily_prayers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error("Error fetching prayers:", error);
      toast.error("Gagal memuat doa harian");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.arabic_text || !formData.translation) {
      toast.error("Mohon lengkapi field yang wajib diisi");
      return;
    }

    try {
      if (editingPrayer) {
        // Update existing prayer
        const { error } = await supabase
          .from("daily_prayers")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPrayer.id);

        if (error) throw error;
        toast.success("Doa berhasil diperbarui");
      } else {
        // Create new prayer
        const { error } = await supabase.from("daily_prayers").insert([
          {
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        toast.success("Doa baru berhasil ditambahkan");
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        arabic_text: "",
        transliteration: "",
        translation: "",
        category: "pagi",
      });
      setIsAddDialogOpen(false);
      setEditingPrayer(null);
      fetchPrayers();
    } catch (error) {
      console.error("Error saving prayer:", error);
      toast.error("Gagal menyimpan doa");
    }
  };

  const handleEdit = (prayer: DailyPrayer) => {
    setFormData({
      title: prayer.title,
      arabic_text: prayer.arabic_text,
      transliteration: prayer.transliteration || "",
      translation: prayer.translation,
      category: prayer.category,
    });
    setEditingPrayer(prayer);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus doa ini?")) return;

    try {
      const { error } = await supabase
        .from("daily_prayers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Doa berhasil dihapus");
      fetchPrayers();
    } catch (error) {
      console.error("Error deleting prayer:", error);
      toast.error("Gagal menghapus doa");
    }
  };

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch =
      prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prayer.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || prayer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <BookOpen className="h-8 w-8 text-purple-400" />
            Manajemen Doa Harian
          </CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari doa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => {
                    setEditingPrayer(null);
                    setFormData({
                      title: "",
                      arabic_text: "",
                      transliteration: "",
                      translation: "",
                      category: "pagi",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Doa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingPrayer ? "Edit Doa" : "Tambah Doa Baru"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingPrayer
                      ? "Ubah informasi doa di bawah ini."
                      : "Tambahkan doa harian baru ke koleksi."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Judul Doa <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Contoh: Doa Sebelum Makan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Kategori <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Teks Arab <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      value={formData.arabic_text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          arabic_text: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white text-right"
                      placeholder="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Transliterasi</Label>
                    <Textarea
                      value={formData.transliteration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transliteration: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Bismillahir rahmanir rahiim"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Terjemahan <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      value={formData.translation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          translation: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {editingPrayer ? "Perbarui" : "Tambah"} Doa
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingPrayer(null);
                      }}
                      className="border-slate-600"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {prayers.length}
            </div>
            <div className="text-gray-400 text-sm">Total Doa</div>
          </CardContent>
        </Card>
        {categories.slice(0, 3).map((cat) => (
          <Card
            key={cat.value}
            className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {prayers.filter((p) => p.category === cat.value).length}
              </div>
              <div className="text-gray-400 text-sm">{cat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prayers List */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <FileText className="h-6 w-6 text-green-400" />
            Daftar Doa ({filteredPrayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrayers.length === 0 ? (
              <Alert className="bg-yellow-900/20 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-200">
                  {searchTerm || selectedCategory !== "all"
                    ? "Tidak ada doa yang sesuai dengan filter."
                    : "Belum ada doa yang ditambahkan. Klik tombol 'Tambah Doa' untuk memulai."}
                </AlertDescription>
              </Alert>
            ) : (
              filteredPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {prayer.title}
                        </h3>
                        <Badge
                          className={`${
                            prayer.category === "pagi"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : prayer.category === "sore"
                              ? "bg-orange-500/20 text-orange-300"
                              : prayer.category === "makan"
                              ? "bg-green-500/20 text-green-300"
                              : prayer.category === "tidur"
                              ? "bg-purple-500/20 text-purple-300"
                              : prayer.category === "perjalanan"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {
                            categories.find((c) => c.value === prayer.category)
                              ?.label
                          }
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(prayer.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        {prayer.created_by && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Admin
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prayer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(prayer.id)}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Teks Arab:</p>
                      <p className="text-white text-lg text-right leading-relaxed">
                        {prayer.arabic_text}
                      </p>
                    </div>
                    {prayer.transliteration && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Transliterasi:
                        </p>
                        <p className="text-gray-300 italic">
                          {prayer.transliteration}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Terjemahan:</p>
                      <p className="text-gray-200">{prayer.translation}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
