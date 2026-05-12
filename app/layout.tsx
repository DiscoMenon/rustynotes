import type { Metadata } from "next";
import { Cinzel, Lora } from "next/font/google";
import "@/styles/globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rustynotes",
  description: "Notes with a parchment rust aesthetic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${cinzel.variable} ${lora.className}`}>
        {children}
      </body>
    </html>
  );
}
