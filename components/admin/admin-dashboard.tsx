"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  Sparkles,
  BookOpen,
  BarChart3,
  UserPlus,
  FileText,
} from "lucide-react";
import { UserManagement } from "./user-management";
import { ContentManagement } from "./content-management";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { SystemStats } from "./system-stats";

interface AdminDashboardProps {
  user: User;
  profile: Profile;
}

export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-red-900/20">
      {/* Header */}
      <div className="relative py-12 px-4 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Panel Administrator
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl">
                Kelola sistem Al-Quran Digital dengan kontrol penuh
              </p>
            </div>
            <div className="hidden md:block">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {profile.full_name || "Administrator"}
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      Admin
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/40 border-slate-700/50 backdrop-blur-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-orange-500"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-orange-500"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-orange-500"
              >
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <SystemStats />
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Kelola Pengguna
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Atur role dan akses pengguna
                    </p>
                    <Button
                      onClick={() => setActiveTab("users")}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kelola User
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Konten
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Kelola konten Al-Quran
                    </p>
                    <Button
                      onClick={() => setActiveTab("content")}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Kelola Konten
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="content">
              <ContentManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
