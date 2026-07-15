import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signature Maker",
  description:
    "Upload a photo of your signature and clean it up into crisp black ink on a plain white background — free, and it never leaves your browser.",
  alternates: { canonical: "/signature-maker" },
};

export default function SignatureMakerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
