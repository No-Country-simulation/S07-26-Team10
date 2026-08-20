export interface FunnelStep {
  id: string;
  width: string;
  color: string;
  delay: string;
  value: string;
  key: boolean;
  tKey: string;
}

export const funnelSteps: FunnelStep[] = [
  {
    id: "01",
    width: "100%",
    color: "#08090A",
    delay: "0s",
    value: "100%",
    key: false,
    tKey: "steps.01",
  },
  {
    id: "02",
    width: "92%",
    color: "#2B2C2D",
    delay: ".09s",
    value: "92%",
    key: false,
    tKey: "steps.02",
  },
  {
    id: "03",
    width: "84%",
    color: "#565758",
    delay: ".18s",
    value: "84%",
    key: false,
    tKey: "steps.03",
  },
  {
    id: "04",
    width: "71%",
    color: "#787878",
    delay: ".27s",
    value: "71%",
    key: false,
    tKey: "steps.04",
  },
  {
    id: "05",
    width: "60%",
    color: "#A3A3A3",
    delay: ".36s",
    value: "60%",
    key: false,
    tKey: "steps.05",
  },
  {
    id: "06",
    width: "48%",
    color: "#0A7A45",
    delay: ".45s",
    value: "48%",
    key: true,
    tKey: "steps.06",
  },
  {
    id: "07",
    width: "37%",
    color: "#00603A",
    delay: ".54s",
    value: "37%",
    key: true,
    tKey: "steps.07",
  },
];

export const lossSources = [
  { labelKey: "facility", count: "7", href: "/report/taxonomy#FAC" },
  { labelKey: "it", count: "6", href: "/report/taxonomy#IT" },
  {
    labelKey: "workload",
    count: "5",
    href: "/report/taxonomy#WKL",
  },
];
