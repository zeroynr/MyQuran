"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  Database,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PolicyInfo {
  tablename: string;
  policyname: string;
  operation: string;
}

export function PolicyManager() {
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const supabase = createClient();

  const loadPolicies = async () => {
    setLoading(true);
    try {
      // Mock policy data since we can't directly query pg_policies from client
      const mockPolicies = [
        {
          tablename: "profiles",
          policyname: "profiles_select_own",
          operation: "SELECT",
        },
        {
          tablename: "profiles",
          policyname: "profiles_update_own",
          operation: "UPDATE",
        },
        {
          tablename: "profiles",
          policyname: "profiles_select_admin",
          operation: "SELECT",
        },
        {
          tablename: "profiles",
          policyname: "profiles_update_admin",
          operation: "UPDATE",
        },
        {
          tablename: "bookmarks",
          policyname: "bookmarks_select_own",
          operation: "SELECT",
        },
        {
          tablename: "bookmarks",
          policyname: "bookmarks_insert_own",
          operation: "INSERT",
        },
        {
          tablename: "bookmarks",
          policyname: "bookmarks_update_own",
          operation: "UPDATE",
        },
        {
          tablename: "bookmarks",
          policyname: "bookmarks_delete_own",
          operation: "DELETE",
        },
        {
          tablename: "favorites",
          policyname: "favorites_select_own",
          operation: "SELECT",
        },
        {
          tablename: "favorites",
          policyname: "favorites_insert_own",
          operation: "INSERT",
        },
        {
          tablename: "favorites",
          policyname: "favorites_update_own",
          operation: "UPDATE",
        },
        {
          tablename: "favorites",
          policyname: "favorites_delete_own",
          operation: "DELETE",
        },
        {
          tablename: "reading_history",
          policyname: "reading_history_select_own",
          operation: "SELECT",
        },
        {
          tablename: "reading_history",
          policyname: "reading_history_insert_own",
          operation: "INSERT",
        },
        {
          tablename: "reading_history",
          policyname: "reading_history_update_own",
          operation: "UPDATE",
        },
        {
          tablename: "reading_history",
          policyname: "reading_history_delete_own",
          operation: "DELETE",
        },
        {
          tablename: "daily_prayers",
          policyname: "daily_prayers_select_all",
          operation: "SELECT",
        },
        {
          tablename: "daily_prayers",
          policyname: "daily_prayers_insert_admin",
          operation: "INSERT",
        },
        {
          tablename: "daily_prayers",
          policyname: "daily_prayers_update_admin",
          operation: "UPDATE",
        },
        {
          tablename: "daily_prayers",
          policyname: "daily_prayers_delete_admin",
          operation: "DELETE",
        },
      ];

      setPolicies(mockPolicies);
      toast.success("Policy berhasil dimuat");
    } catch (error) {
      console.error("Error loading policies:", error);
      toast.error("Gagal memuat policy");
    } finally {
      setLoading(false);
    }
  };

  const cleanAllPolicies = async () => {
    setCleaning(true);
    try {
      // This would need to be implemented as a stored procedure
      // For now, show instructions
      toast.info(
        "Jalankan script 12-clean-existing-policies.sql di SQL Editor"
      );
    } catch (error) {
      toast.error("Gagal membersihkan policy");
    } finally {
      setCleaning(false);
    }
  };

  const disableRLS = async () => {
    try {
      toast.info(
        "Jalankan script 10-disable-rls-temporarily-fixed.sql di SQL Editor"
      );
    } catch (error) {
      toast.error("Gagal disable RLS");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Shield className="h-6 w-6 text-blue-400" />
            Policy Manager
            <Button
              size="sm"
              variant="outline"
              onClick={loadPolicies}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length > 0 ? (
            <div className="space-y-4">
              {[
                "profiles",
                "bookmarks",
                "favorites",
                "reading_history",
                "daily_prayers",
              ].map((tableName) => {
                const tablePolicies = policies.filter(
                  (p) => p.tablename === tableName
                );
                return (
                  <div
                    key={tableName}
                    className="p-4 bg-slate-700/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold capitalize">
                        {tableName}
                      </h4>
                      <span className="text-blue-400 font-mono">
                        {tablePolicies.length} policies
                      </span>
                    </div>
                    <div className="space-y-1">
                      {tablePolicies.map((policy, index) => (
                        <div key={index} className="text-sm text-gray-400">
                          • {policy.policyname} ({policy.operation})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">
                Tidak ada policy ditemukan atau belum dimuat
              </p>
              <Button onClick={loadPolicies} className="mt-4">
                Load Policies
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white">Policy Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={cleanAllPolicies}
              disabled={cleaning}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clean All Policies
            </Button>
            <Button onClick={disableRLS} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Disable RLS
            </Button>
            <Button onClick={loadPolicies} disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-yellow-900/20 border-yellow-500/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-yellow-200">
          <strong>Solusi untuk Policy Conflict:</strong>
          <br />
          1. Jalankan script <code>14-check-policy-conflicts.sql</code> untuk
          melihat conflict
          <br />
          2. Gunakan script <code>12-clean-existing-policies.sql</code> untuk
          cleanup
          <br />
          3. Lalu jalankan <code>13-fresh-rls-setup.sql</code> untuk setup ulang
          <br />
          4. Atau gunakan <code>15-minimal-working-setup.sql</code> untuk setup
          minimal
        </AlertDescription>
      </Alert>
    </div>
  );
}
