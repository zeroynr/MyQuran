import SurahReader from "@/components/quran/surah-reader";

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function SurahPage({ params }: PageProps) {
  const { number } = await params;
  const surahNumber = Number.parseInt(number);

  return (
    <div className="container mx-auto px-4 py-8">
      <SurahReader surahNumber={surahNumber} />
    </div>
  );
}
