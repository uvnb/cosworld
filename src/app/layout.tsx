import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"


const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CosWorld | Nền tảng kết nối cộng đồng Cosplay P2P tại Việt Nam",
  description: "Cho thuê đồ, makeup, photographer, event cosplay. Nền tảng an toàn, chống bùng cọc 100%.",
};

import { Providers } from "@/components/Providers"
import { TopBar } from "@/components/layout/TopBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased bg-slate-50/70 text-slate-900 font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TopBar />
          {children}
          
          {/* Global Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-6">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center text-sm font-medium text-slate-500">
              CosWorld Platform © 2026 CosWorld — Nền tảng kết nối cộng đồng Cosplay P2P tại Việt Nam.
            </div>
          </footer>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
