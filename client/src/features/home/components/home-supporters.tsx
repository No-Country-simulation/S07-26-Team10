"use client";

import { useTranslations } from "next-intl";

const SUPPORTERS = [
  {
    name: "DraperU Ventures",
    logo: "/images/supporter-draperu.png",
    alt: "DraperU Ventures",
  },
  {
    name: "Harvard Alumni Entrepreneurs",
    logo: "/images/supporter-harvard-alumni.png",
    alt: "Harvard Alumni Entrepreneurs",
  },
  {
    name: "AWS",
    logo: "/images/supporter-aws.png",
    alt: "AWS",
  },
  {
    name: "Biomimicry Institute",
    logo: null,
  },
  {
    name: "Harvard Innovation Labs",
    logo: "/images/supporter-harvard-labs.png",
    alt: "Harvard Innovation Labs",
  },
  {
    name: "J.P. Morgan Startup Banking",
    logo: "/images/supporter-jpmorgan.png",
    alt: "J.P. Morgan Startup Banking",
  },
  {
    name: "Ray of Hope Accelerator",
    logo: null,
  },
];

export function HomeSupporters() {
  const t = useTranslations("HomePage");

  return (
    <div className="sup">
      <div className="mqt" id="mqt">
        <div className="half">
          {SUPPORTERS.map((s) =>
            s.logo ? (
              <img key={s.name} src={s.logo} alt={s.alt} />
            ) : (
              <span key={s.name}>{s.name}</span>
            ),
          )}
        </div>
        <div className="half" aria-hidden="true">
          {SUPPORTERS.map((s) =>
            s.logo ? (
              <img key={s.name} src={s.logo} alt="" />
            ) : (
              <span key={s.name}>{s.name}</span>
            ),
          )}
        </div>
      </div>
      <p className="supn">{t("supportersNote")}</p>
    </div>
  );
}
