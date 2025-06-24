import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Footer } from "@/components/layout";
import Navbar from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyQuran  - Platform Islami Terlengkap",
  description:
    "Platform digital untuk membaca Al-Quran, melihat jadwal sholat, dan mengakses doa-doa harian. Dilengkapi dengan fitur favorit dan riwayat bacaan.",
  keywords:
    "Al-Quran, Islam, Jadwal Sholat, Doa Harian, Quran Digital, Islamic App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer - akan muncul di semua halaman */}
            <Footer />
          </div>

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
