import { redirect } from "next/navigation";
import { getPublicSections } from "@/features/chapters/chapters-queries";

export default async function ChapterIndexPage() {
  const sections = await getPublicSections();
  if (sections.length > 0 && sections[0].slug) {
    redirect(`/chapter/${sections[0].slug}`);
  }
  redirect("/#s02");
}
