export interface ChapterItem {
  num: string;
  titleKey: string;
  ns: "nav" | "home";
  time: string;
  href: string;
}

export const chapters: ChapterItem[] = [
  { num: "01", titleKey: "definition", ns: "nav", time: "11 min", href: "/report" },
  {
    num: "02",
    titleKey: "theCapacityFunnel",
    ns: "home",
    time: "9 min",
    href: "/#s03",
  },
  {
    num: "03",
    titleKey: "facilityLayer",
    ns: "home",
    time: "14 min",
    href: "/report/taxonomy#FAC",
  },
  {
    num: "04",
    titleKey: "itLayer",
    ns: "home",
    time: "13 min",
    href: "/report/taxonomy#IT",
  },
  {
    num: "05",
    titleKey: "workloadAndOperationsLayer",
    ns: "home",
    time: "12 min",
    href: "/report/taxonomy#WKL",
  },
  {
    num: "06",
    titleKey: "measurementApproach",
    ns: "home",
    time: "10 min",
    href: "/methodology",
  },
  {
    num: "07",
    titleKey: "whatThisIndexDoesNotClaim",
    ns: "home",
    time: "7 min",
    href: "/methodology",
  },
  {
    num: "08",
    titleKey: "references",
    ns: "nav",
    time: "4 min",
    href: "/report/references",
  },
];
