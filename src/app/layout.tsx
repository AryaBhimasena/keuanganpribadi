import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/mobile-frame.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Finance",
  description: "Personal Finance App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f5f7fb]">
        <div className="app-wrapper">
          <div className="mobile-frame">
            <main className="page-content">{children}</main>
          <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}