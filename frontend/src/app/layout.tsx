import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "কৃষি সহায় | KrishiSahay - আপনার ফসলের ডিজিটাল বন্ধু",
  description: "AI-এর শক্তিতে পান আবহাওয়ার পূর্বাভাস, পোকার আক্রমণ থেকে সুরক্ষা, এবং ফসলের সেরা দাম। বাংলাদেশের কৃষকদের জন্য স্মার্ট কৃষি সমাধান।",
  keywords: "কৃষি, কৃষক, AI, স্মার্ট কৃষি, বাংলাদেশ, ফসল, সেচ, পোকামাকড়, বাজার দর",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansBengali.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}