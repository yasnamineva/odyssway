"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Site header/footer, left out of /embed/* pages that render inside other sites' iframes. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/embed")) return null;
  return <>{children}</>;
}
