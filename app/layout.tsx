import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter with Vietnamese subset so diacritics (e.g. Mì Quảng) render correctly.
// variable wires the font into the --font-inter CSS custom property used by @theme.
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "What To Eat — Da Nang Dinner Wheel",
  description: "Spin to pick tonight's dinner from 40 Da Nang dishes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
