import type { Metadata } from "next";
import { AboutChapter } from "@/components/report/about/AboutChapter";

export const metadata: Metadata = {
  title: "Acerca de PhysaFlow | PhysaFlow Research",
  description:
    "Conoce más sobre PhysaFlow y nuestra misión en infraestructura de IA.",
};

export default function AboutPage() {
  return <AboutChapter />;
}