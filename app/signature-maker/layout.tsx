import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Signature Maker",
  description:
    "Upload a photo of your signature and clean it up into crisp black ink on a plain white background — free, and it never leaves your browser.",
  alternates: { canonical: "/signature-maker" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signature Maker",
  url: `${siteConfig.url}/signature-maker`,
  description: metadata.description,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function SignatureMakerLayout({ children }: { children: React.ReactNode }) {
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
