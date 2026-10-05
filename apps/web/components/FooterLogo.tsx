"use client";

import Image from "next/image";
import logo from "../public/images/logo.png";

/**
 * The footer logo, as its own client module on purpose: rendering
 * next/image straight from the root layout (a Server Component) made Next
 * resolve its client code to the home page's chunk group, so every page
 * downloaded the home page's JavaScript — including the full data corpus.
 */
export default function FooterLogo({ alt }: { alt: string }) {
  return <Image src={logo} alt={alt} className="h-9 w-auto" sizes="160px" />;
}
