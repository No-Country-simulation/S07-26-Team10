"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useTranslations } from "next-intl";
import { ExternalLink, BookOpen, FileCode, Sparkles } from "lucide-react";

export function HomeCard() {
  const t = useTranslations("HomePage");

  return (
    <Card className="w-full shadow-lg border">
      <CardHeader className="space-y-4 text-center sm:text-left">
        <div className="flex items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Sparkles className="size-3.5" /> {t("badge")}
            </Badge>
            <LanguageToggle />
          </div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("titleStart")}
          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">
            src/app/page.tsx
          </code>
          {t("titleEnd")}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          nativeButton={false}
          className="flex-1 justify-start h-11"
          render={
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <FileCode className="size-4 mr-2" />
          {t("templates")}
          <ExternalLink className="size-3 ml-auto opacity-50" />
        </Button>

        <Button
          variant="outline"
          nativeButton={false}
          className="flex-1 justify-start h-11"
          render={
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <BookOpen className="size-4 mr-2" />
          {t("learningCenter")}
          <ExternalLink className="size-3 ml-auto opacity-50" />
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          nativeButton={false}
          className="w-full sm:w-auto flex-1 h-11"
          render={
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <Image
            className="dark:invert mr-2"
            src="/vercel.svg"
            alt="Vercel logomark"
            width={14}
            height={14}
          />
          {t("deployNow")}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          className="w-full sm:w-auto flex-1 h-11"
          render={
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <BookOpen className="size-4 mr-2" />
          {t("documentation")}
        </Button>
      </CardFooter>
    </Card>
  );
}
