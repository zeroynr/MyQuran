"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  Settings,
  UserPlus,
  Edit,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const supabase = createClient();

  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin"
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Role berhasil diubah menjadi ${newRole}`);
      fetchProfiles();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal mengubah role pengguna");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);

    try {
      const { data, error } = await supabase.rpc("make_user_admin", {
        user_email: newAdminEmail,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Admin berhasil dibuat!");
        setNewAdminEmail("");
        setNewAdminName("");
        fetchProfiles();
      } else {
        toast.error(data?.message || "Gagal membuat admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Gagal membuat admin account");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingUser.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("Data pengguna berhasil diperbarui");
      setEditingUser(null);
      fetchProfiles();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Gagal memperbarui data pengguna");
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <Users className="h-8 w-8 text-orange-400" />
            Manajemen Pengguna
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Badge variant="outline" className="text-gray-300">
              Total: {profiles.length} pengguna
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Create Admin Form */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Shield className="h-6 w-6 text-red-400" />
            Buat Admin Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateAdmin}
            className="grid md:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-gray-300">
                Email (harus sudah terdaftar)
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-name" className="text-gray-300">
                Nama Admin
              </Label>
              <Input
                id="admin-name"
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Super Administrator"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={creatingAdmin}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {creatingAdmin ? "Memproses..." : "Buat Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <UserCheck className="h-6 w-6 text-green-400" />
            Daftar Pengguna ({filteredProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProfiles.length === 0 ? (
              <Alert className="bg-yellow-900/20 border-yellow-500/50">
                <AlertDescription className="text-yellow-200">
                  {searchTerm
                    ? "Tidak ada pengguna yang sesuai dengan pencarian."
                    : "Belum ada pengguna terdaftar."}
                </AlertDescription>
              </Alert>
            ) : (
              filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      {profile.role === "admin" ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {profile.full_name || "Nama tidak diset"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Bergabung:{" "}
                        {new Date(profile.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        profile.role === "admin"
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      }
                    >
                      {profile.role === "admin" ? "Admin" : "User"}
                    </Badge>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(profile)}
                          className="border-slate-600 text-gray-300 hover:bg-slate-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Edit Pengguna
                          </DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Ubah informasi pengguna di bawah ini.
                          </DialogDescription>
                        </DialogHeader>
                        {editingUser && (
                          <form
                            onSubmit={handleUpdateUser}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Nama Lengkap
                              </Label>
                              <Input
                                value={editingUser.full_name || ""}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    full_name: e.target.value,
                                  })
                                }
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-300">Email</Label>
                              <Input
                                value={editingUser.email || ""}
                                disabled
                                className="bg-slate-700/30 border-slate-600 text-gray-400"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Simpan
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                className="border-slate-600"
                              >
                                Batal
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleRoleChange(
                          profile.id,
                          profile.role === "admin" ? "user" : "admin"
                        )
                      }
                      className="border-slate-600 text-gray-300 hover:bg-slate-600"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {profile.role === "admin"
                        ? "Jadikan User"
                        : "Jadikan Admin"}
                    </Button>
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
