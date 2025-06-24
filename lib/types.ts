// Update file existing - tambah interface yang diperlukan

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  surah_number: number;
  surah_name: string;
  created_at: string;
}

export interface DailyPrayer {
  id: string;
  title: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  category: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  surah_number: number;
  surah_name: string;
  ayah_number?: number;
  last_read_at: string;
}

export interface BookmarkAyah {
  id: string;
  user_id: string;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  ayah_text: string;
  note?: string;
  created_at: string;
}
