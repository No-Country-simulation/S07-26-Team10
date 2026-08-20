import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getChapterDetail,
  getPublicSectionBySlug,
} from "@/features/chapters/chapters-queries";
import {
  ChapterDetail,
  ChapterDetailSkeleton,
} from "@/features/chapters/components/chapter-detail";

interface ChapterPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await getPublicSectionBySlug(slug);

  if (!section) {
    return {
      title: "Capítulo no encontrado | PhysaFlow Research",
      description: "El capítulo solicitado no se encuentra disponible.",
    };
  }

  return {
    title: `${section.title} | PhysaFlow Stranded Capacity Index`,
    description:
      section.content.slice(0, 160).replace(/\n+/g, " ") ||
      `Detalle del capítulo ${section.title} en el reporte PhysaFlow.`,
  };
}

async function ChapterContent({ slug }: { slug: string }) {
  const data = await getChapterDetail(slug);

  if (!data || !data.section) {
    notFound();
  }

  return <ChapterDetail data={data} />;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ChapterDetailSkeleton />}>
      <ChapterContent slug={slug} />
    </Suspense>
  );
}
