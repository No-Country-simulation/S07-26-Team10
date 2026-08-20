"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NavigationHeader } from "@/components/navigation-header";

export function NavigationHeaderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const disableShrink = pathname.startsWith("/report") || pathname === "/methodology" || pathname === "/about";

  return (
    <>
      {React.Children.map(children, (child) => 
        React.isValidElement(child) && child.type === NavigationHeader 
          ? React.cloneElement(child, { disableShrink } as { disableShrink?: boolean })
          : child
      )}
    </>
  );
}