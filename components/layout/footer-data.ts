import { BookOpen } from "lucide-react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const footerData = {
  brand: {
    name: "Al-Quran Digital",
    tagline: "Platform Islami Terlengkap",
    description:
      "Platform digital untuk membaca Al-Quran, melihat jadwal sholat, dan mengakses doa-doa harian. Dilengkapi dengan fitur favorit dan riwayat bacaan.",
    logo: BookOpen,
  },
  quotes: [
    {
      text: "Dan Kami turunkan dari Al-Quran suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman",
      reference: "QS. Al-Isra: 82",
    },
    {
      text: "Dan sesungguhnya telah Kami mudahkan Al-Quran untuk pelajaran, maka adakah orang yang mengambil pelajaran?",
      reference: "QS. Al-Qamar: 17",
    },
    {
      text: "Kitab ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa",
      reference: "QS. Al-Baqarah: 2",
    },
    {
      text: "Dan barangsiapa yang berpegang teguh kepada Allah, maka sesungguhnya ia telah diberi petunjuk kepada jalan yang lurus",
      reference: "QS. Ali Imran: 101",
    },
    {
      text: "Dan ingatlah, hanya dengan mengingat Allah-lah hati menjadi tenteram",
      reference: "QS. Ar-Ra'd: 28",
    },
    {
      text: "Dan Kami jadikan dari mereka itu pemimpin-pemimpin yang memberi petunjuk dengan perintah Kami ketika mereka sabar",
      reference: "QS. As-Sajdah: 24",
    },
  ],
  links: {
    main: [
      { label: "Beranda", href: "/" },
      { label: "Baca Al-Quran", href: "/quran" },
      { label: "Jadwal Sholat", href: "/prayer-times" },
      { label: "Doa Harian", href: "/daily-prayers" },
    ],
    features: [
      { label: "Surah Favorit", href: "/favorites" },
      { label: "Riwayat Bacaan", href: "/history" },
      { label: "Bookmark", href: "/bookmarks" },
      { label: "Pencarian", href: "/search" },
    ],
    support: [
      { label: "Bantuan", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Kontak", href: "/contact" },
      { label: "Kebijakan Privasi", href: "/privacy" },
    ],
  },
  contact: {
    social: [
      { name: "Facebook", href: "#", icon: Facebook },
      { name: "Twitter", href: "#", icon: Twitter },
      { name: "Instagram", href: "#", icon: Instagram },
      { name: "YouTube", href: "#", icon: Youtube },
    ],
  },
  copyright: {
    year: new Date().getFullYear(),
    text: "MyQuran. All rights reserved.",
    creator: {
      message: "Dibuat oleh",
      name: "Muhammad Ridho Ardiansyah",
    },
  },
};
