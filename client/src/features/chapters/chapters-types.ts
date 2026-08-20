/**
 * Types and interfaces for the Chapters / Sections domain.
 */

export interface PublicSection {
  id: string;
  report_version_id: string;
  title: string;
  slug: string;
  content: string;
  display_order: number;
}

export interface ChapterItem {
  id: string;
  num: string;
  displayOrder: number;
  title: string;
  slug: string;
  time: string;
  href: string;
  content?: string;
  reportVersionId?: string;
}

export interface SectionNavigation {
  prev?: {
    slug: string;
    title: string;
    num: string;
  };
  next?: {
    slug: string;
    title: string;
    num: string;
  };
}

export interface ChapterDetailData {
  section: PublicSection;
  navigation: SectionNavigation;
  allSections: PublicSection[];
}
