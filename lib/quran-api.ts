// Al-Quran API integration with multiple sources
const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_COM_API = "https://api.quran.com/api/v4";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  transliteration?: string;
  juz?: number;
  page?: number;
  manzil?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean;
  audio?: string;
}

interface SurahWithTranslation {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

// Get all surahs list
export async function getSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${QURAN_API_BASE}/surah`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return getStaticSurahs();
  }
}

// Clean translation text more aggressively
function cleanTranslationText(text: string): string {
  if (!text) return "Terjemahan tidak tersedia";

  let cleaned = text;

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // Remove footnote references in brackets [1], [2], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, "");

  // Remove standalone numbers that are footnote references (like "1", "2" at end of words)
  cleaned = cleaned.replace(/(\w+)\d+/g, "$1");

  // Remove numbers that appear after punctuation
  cleaned = cleaned.replace(/([.,;:])\d+/g, "$1");

  // Remove standalone digits that are clearly footnotes
  cleaned = cleaned.replace(/\s+\d+\s*([.,;:]|$)/g, "$1");

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ");

  // Trim whitespace
  cleaned = cleaned.trim();

  // Remove trailing commas or periods that might be left hanging
  cleaned = cleaned.replace(/[,.]$/, "");

  return cleaned || "Terjemahan tidak tersedia";
}

// Simple and reliable Bismillah detection and removal
function cleanBismillahFromAyah(text: string): string {
  if (!text) return text;

  // List of Bismillah variations to remove
  const bismillahPatterns = [
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", // With alif wasla
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", // Standard
    "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ", // Alternative
    "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", // Another variation
    "﷽", // Unicode Bismillah symbol
  ];

  let cleanedText = text.trim();

  // Remove any Bismillah pattern from the beginning
  for (const pattern of bismillahPatterns) {
    if (cleanedText.startsWith(pattern)) {
      cleanedText = cleanedText.substring(pattern.length).trim();
      console.log(`🧹 Removed Bismillah pattern: "${pattern}"`);
      console.log(`🧹 Remaining text: "${cleanedText}"`);
      break;
    }
  }

  return cleanedText;
}

// Get specific surah with Indonesian translation and transliteration
export async function getSurah(
  number: number
): Promise<SurahWithTranslation | null> {
  try {
    console.log(`Fetching surah ${number}...`);

    // Try Quran.com API first for better Bismillah handling (same as Code 1)
    const quranComResult = await getSurahFromQuranCom(number);
    if (quranComResult) {
      console.log("✅ Using Quran.com API data");
      return quranComResult;
    }

    // Fallback to AlQuran.cloud API with improved cleaning
    console.log("⚠️ Falling back to AlQuran.cloud API");
    const alQuranResult = await getSurahFromAlQuranCloud(number);
    if (alQuranResult) {
      return alQuranResult;
    }

    // Final fallback to static data
    return getStaticSurah(number);
  } catch (error) {
    console.error("Error fetching surah:", error);
    return getStaticSurah(number);
  }
}

// Get surah from Quran.com API (better Bismillah handling) - Priority 1
async function getSurahFromQuranCom(
  number: number
): Promise<SurahWithTranslation | null> {
  try {
    // Get surah info
    const surahResponse = await fetch(`${QURAN_COM_API}/chapters/${number}`);
    if (!surahResponse.ok) throw new Error("Failed to fetch surah info");

    const surahData = await surahResponse.json();
    const surahInfo = surahData.chapter;

    // Get verses with translations and transliteration
    const [versesResponse, transliterationResponse] = await Promise.all([
      fetch(
        `${QURAN_COM_API}/verses/by_chapter/${number}?language=id&fields=text_uthmani&translations=134&per_page=300`
      ),
      fetch(`${QURAN_API_BASE}/surah/${number}/en.transliteration`).catch(
        () => null
      ),
    ]);

    if (!versesResponse.ok) throw new Error("Failed to fetch verses");

    const versesData = await versesResponse.json();
    const verses = versesData.verses;

    // Get transliteration data if available
    const transliterationData = transliterationResponse?.ok
      ? await transliterationResponse.json()
      : null;

    console.log(`Quran.com API - Original verses count: ${verses.length}`);

    // Process verses using the cleaner functions from Code 2
    const processedAyahs: Ayah[] = verses.map((verse: any, index: number) => {
      const ayahNumber = index + 1;
      let arabicText = verse.text_uthmani;

      // Clean Bismillah from first ayah (except for Al-Fatihah and At-Tawbah)
      if (index === 0 && number !== 1 && number !== 9) {
        const originalText = arabicText;
        arabicText = cleanBismillahFromAyah(arabicText);

        if (originalText !== arabicText) {
          console.log(`🧹 Cleaned first ayah of surah ${number} (Quran.com)`);
          console.log(`🧹 Original: "${originalText}"`);
          console.log(`🧹 Cleaned: "${arabicText}"`);
        }
      }

      // Clean translation text using the improved function
      const rawTranslation =
        verse.translations?.[0]?.text || "Terjemahan tidak tersedia";
      const cleanTranslation = cleanTranslationText(rawTranslation);

      return {
        number: verse.id,
        numberInSurah: ayahNumber,
        text: arabicText,
        translation: cleanTranslation,
        transliteration: transliterationData?.data?.ayahs?.[index]?.text || "",
        juz: verse.juz_number,
        page: verse.page_number,
        audio: `https://everyayah.com/data/Alafasy_128kbps/${String(
          number
        ).padStart(3, "0")}${String(ayahNumber).padStart(3, "0")}.mp3`,
      };
    });

    console.log(`Quran.com API - Final ayahs count: ${processedAyahs.length}`);

    return {
      number: surahInfo.id,
      name: surahInfo.name_arabic,
      englishName: surahInfo.name_simple,
      englishNameTranslation: surahInfo.translated_name.name,
      revelationType:
        surahInfo.revelation_place === "makkah" ? "Meccan" : "Medinan",
      numberOfAyahs: processedAyahs.length,
      ayahs: processedAyahs,
    };
  } catch (error) {
    console.error("Quran.com API failed:", error);
    return null;
  }
}

// Get surah from AlQuran.cloud API (fallback) - Priority 2
async function getSurahFromAlQuranCloud(
  number: number
): Promise<SurahWithTranslation | null> {
  try {
    // Fetch Arabic text, Indonesian translation, and English transliteration
    const [arabicResponse, translationResponse, transliterationResponse] =
      await Promise.all([
        fetch(`${QURAN_API_BASE}/surah/${number}/quran-uthmani`),
        fetch(`${QURAN_API_BASE}/surah/${number}/id.indonesian`),
        fetch(`${QURAN_API_BASE}/surah/${number}/en.transliteration`),
      ]);

    if (!arabicResponse.ok || !translationResponse.ok) {
      throw new Error("Failed to fetch surah data");
    }

    const [arabicData, translationData, transliterationData] =
      await Promise.all([
        arabicResponse.json(),
        translationResponse.json(),
        transliterationResponse.ok ? transliterationResponse.json() : null,
      ]);

    if (!arabicData?.data || !translationData?.data) {
      throw new Error("Invalid response format");
    }

    console.log(
      `AlQuran.cloud API - Original ayahs count: ${arabicData.data.ayahs.length}`
    );

    const arabicAyahs = arabicData.data.ayahs;
    const translationAyahs = translationData.data.ayahs;
    const transliterationAyahs = transliterationData?.data?.ayahs || [];

    // Process ayahs and clean Bismillah from first ayah (except for Al-Fatihah and At-Tawbah)
    const combinedAyahs: Ayah[] = arabicAyahs.map(
      (ayah: any, index: number) => {
        const ayahNumber = index + 1;
        let arabicText = ayah.text;

        // Clean Bismillah from first ayah of surahs (except Al-Fatihah and At-Tawbah)
        if (index === 0 && number !== 1 && number !== 9) {
          const originalText = arabicText;
          arabicText = cleanBismillahFromAyah(arabicText);

          if (originalText !== arabicText) {
            console.log(
              `🧹 Cleaned first ayah of surah ${number} (AlQuran.cloud)`
            );
            console.log(`🧹 Original: "${originalText}"`);
            console.log(`🧹 Cleaned: "${arabicText}"`);
          }
        }

        // Clean translation text
        const rawTranslation =
          translationAyahs[index]?.text || "Terjemahan tidak tersedia";
        const cleanTranslation = cleanTranslationText(rawTranslation);

        return {
          number: ayah.number,
          numberInSurah: ayahNumber,
          text: arabicText,
          translation: cleanTranslation,
          transliteration: transliterationAyahs[index]?.text || "",
          juz: ayah.juz,
          page: ayah.page,
          manzil: ayah.manzil,
          ruku: ayah.ruku,
          hizbQuarter: ayah.hizbQuarter,
          sajda: ayah.sajda,
          audio: `https://everyayah.com/data/Alafasy_128kbps/${String(
            number
          ).padStart(3, "0")}${String(ayahNumber).padStart(3, "0")}.mp3`,
        };
      }
    );

    console.log(
      `AlQuran.cloud API - Final ayahs count: ${combinedAyahs.length}`
    );

    return {
      number: arabicData.data.number,
      name: arabicData.data.name,
      englishName: arabicData.data.englishName,
      englishNameTranslation: arabicData.data.englishNameTranslation,
      revelationType: arabicData.data.revelationType,
      numberOfAyahs: combinedAyahs.length,
      ayahs: combinedAyahs,
    };
  } catch (error) {
    console.error("AlQuran.cloud API failed:", error);
    throw error;
  }
}

// Prayer times API
export async function getPrayerTimes(city = "Jakarta") {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=2`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.data && data.data.timings) {
      return data.data.timings;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return {
      Fajr: "05:30",
      Dhuhr: "12:15",
      Asr: "15:30",
      Maghrib: "18:45",
      Isha: "20:00",
    };
  }
}

// Test API connectivity
export async function testQuranAPI() {
  try {
    console.log("Testing Quran APIs...");

    // Test Quran.com API
    const quranComResponse = await fetch(`${QURAN_COM_API}/chapters/1`);
    console.log("Quran.com API status:", quranComResponse.status);

    // Test AlQuran.cloud API
    const alQuranResponse = await fetch(`${QURAN_API_BASE}/surah/1`);
    console.log("AlQuran.cloud API status:", alQuranResponse.status);

    return {
      quranComAPI: quranComResponse.ok,
      alQuranAPI: alQuranResponse.ok,
    };
  } catch (error) {
    console.error("API test failed:", error);
    return {
      quranComAPI: false,
      alQuranAPI: false,
    };
  }
}

// Static fallback data
function getStaticSurahs(): Surah[] {
  return [
    {
      number: 1,
      name: "الفاتحة",
      englishName: "Al-Fatihah",
      englishNameTranslation: "Pembuka",
      revelationType: "Meccan",
      numberOfAyahs: 7,
    },
    {
      number: 2,
      name: "البقرة",
      englishName: "Al-Baqarah",
      englishNameTranslation: "Sapi Betina",
      revelationType: "Medinan",
      numberOfAyahs: 286,
    },
    {
      number: 36,
      name: "يس",
      englishName: "Ya-Sin",
      englishNameTranslation: "Ya Sin",
      revelationType: "Meccan",
      numberOfAyahs: 83,
    },
  ];
}

function getStaticSurah(number: number): SurahWithTranslation | null {
  const staticSurahs = getStaticSurahs();
  const surah = staticSurahs.find((s) => s.number === number);

  if (!surah) {
    return null;
  }

  if (number === 1) {
    return {
      ...surah,
      ayahs: [
        {
          number: 1,
          numberInSurah: 1,
          text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          translation: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
          transliteration: "Bismillahir rahmanir raheem",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        },
        {
          number: 2,
          numberInSurah: 2,
          text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          translation: "Segala puji bagi Allah, Tuhan seluruh alam.",
          transliteration: "Alhamdulillahi rabbil alameen",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
        },
        {
          number: 3,
          numberInSurah: 3,
          text: "الرَّحْمَٰنِ الرَّحِيمِ",
          translation: "Yang Maha Pengasih, Maha Penyayang.",
          transliteration: "Ar rahmanir raheem",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3",
        },
        {
          number: 4,
          numberInSurah: 4,
          text: "مَالِكِ يَوْمِ الدِّينِ",
          translation: "Pemilik hari pembalasan.",
          transliteration: "Maliki yawmid deen",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
        },
        {
          number: 5,
          numberInSurah: 5,
          text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
          translation:
            "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.",
          transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
        },
        {
          number: 6,
          numberInSurah: 6,
          text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
          translation: "Tunjukilah kami jalan yang lurus.",
          transliteration: "Ihdinash shiratal mustaqeem",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001006.mp3",
        },
        {
          number: 7,
          numberInSurah: 7,
          text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          translation:
            "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.",
          transliteration:
            "Shiratal lazeena an'amta alaihim ghairil maghdoobi alaihim wa lad daalleen",
          juz: 1,
          page: 1,
          audio: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
        },
      ],
    };
  }

  if (number === 2) {
    return {
      ...surah,
      ayahs: [
        {
          number: 1,
          numberInSurah: 1,
          text: "الم",
          translation: "Alif Lam Mim.",
          transliteration: "Alif Lam Mim",
          juz: 1,
          page: 2,
          audio: "https://everyayah.com/data/Alafasy_128kbps/002001.mp3",
        },
        {
          number: 2,
          numberInSurah: 2,
          text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
          translation:
            "Kitab (Al-Quran) ini tidak ada keraguan di dalamnya; petunjuk bagi orang-orang yang bertakwa.",
          transliteration: "Zalikal kitabu la raiba fih; hudan lil muttaqin",
          juz: 1,
          page: 2,
          audio: "https://everyayah.com/data/Alafasy_128kbps/002002.mp3",
        },
        {
          number: 3,
          numberInSurah: 3,
          text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
          translation:
            "(yaitu) mereka yang beriman kepada yang gaib, yang mendirikan shalat, dan menafkahkan sebahagian rezeki yang Kami anugerahkan kepada mereka.",
          transliteration:
            "Allazeena yu'minoona bil ghaibi wa yuqeemoonas salaata wa mimma razaqnaahum yunfiqoon",
          juz: 1,
          page: 2,
          audio: "https://everyayah.com/data/Alafasy_128kbps/002003.mp3",
        },
      ],
    };
  }

  return {
    ...surah,
    ayahs: Array.from({ length: Math.min(surah.numberOfAyahs, 3) }, (_, i) => ({
      number: i + 1,
      numberInSurah: i + 1,
      text: "النص العربي غير متوفر حاليا",
      translation:
        "Terjemahan tidak tersedia saat ini. Silakan coba lagi nanti.",
      transliteration: "Arabic text not available currently",
      juz: 1,
      page: 1,
      audio: `https://everyayah.com/data/Alafasy_128kbps/${String(
        number
      ).padStart(3, "0")}${String(i + 1).padStart(3, "0")}.mp3`,
    })),
  };
}
