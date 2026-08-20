"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function BackToTop() {
  const t = useTranslations("Common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const farEnough = window.scrollY > window.innerHeight * 1.1;
      const continueReading = document.getElementById("cont");
      const collides =
        continueReading && !continueReading.classList.contains("hide");
      setVisible(farEnough && !collides);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="totop on"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="totop-t">{t("backToTop")}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}