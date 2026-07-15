import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A4 Sheet Layout",
  description:
    "Arrange photos, signatures, and scanned documents on an A4 sheet, then export as a PDF or image — free, and it never leaves your browser.",
  alternates: { canonical: "/a4-layout" },
};

export default function A4LayoutRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
