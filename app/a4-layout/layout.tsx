import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "A4 Sheet Layout",
  description:
    "Arrange photos, signatures, and scanned documents on an A4 sheet, then export as a PDF or image — free, and it never leaves your browser.",
  alternates: { canonical: "/a4-layout" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "A4 Sheet Layout",
  url: `${siteConfig.url}/a4-layout`,
  description: metadata.description,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function A4LayoutRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
