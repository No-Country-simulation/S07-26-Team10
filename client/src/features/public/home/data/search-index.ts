export interface SearchItem {
  k: string;
  tKey: string;
  eKey: string;
  href: string;
}

export const searchIndex: SearchItem[] = [
  {
    k: "Chapter 01",
    tKey: "s.c1.t",
    eKey: "s.c1.e",
    href: "/report",
  },
  {
    k: "Chapter 02",
    tKey: "s.c2.t",
    eKey: "s.c2.e",
    href: "/#s03",
  },
  {
    k: "Chapter 03",
    tKey: "s.c3.t",
    eKey: "s.c3.e",
    href: "/report/taxonomy#FAC",
  },
  {
    k: "Chapter 04",
    tKey: "s.c4.t",
    eKey: "s.c4.e",
    href: "/report/taxonomy#IT",
  },
  {
    k: "Chapter 05",
    tKey: "s.c5.t",
    eKey: "s.c5.e",
    href: "/report/taxonomy#WKL",
  },
  {
    k: "FAC-01",
    tKey: "s.fac01.t",
    eKey: "s.fac01.e",
    href: "/report/taxonomy#FAC-01",
  },
  {
    k: "FAC-02",
    tKey: "s.fac02.t",
    eKey: "s.fac02.e",
    href: "/report/taxonomy#FAC-02",
  },
  {
    k: "IT-03",
    tKey: "s.it03.t",
    eKey: "s.it03.e",
    href: "/report/taxonomy#IT-03",
  },
  {
    k: "IT-05",
    tKey: "s.it05.t",
    eKey: "s.it05.e",
    href: "/report/taxonomy#IT-05",
  },
  {
    k: "WKL-02",
    tKey: "s.wkl02.t",
    eKey: "s.wkl02.e",
    href: "/report/taxonomy#WKL-02",
  },
  {
    k: "Figure 01",
    tKey: "s.fig01.t",
    eKey: "s.fig01.e",
    href: "/#s03",
  },
  {
    k: "Methodology",
    tKey: "s.meth.t",
    eKey: "s.meth.e",
    href: "/methodology",
  },
];
