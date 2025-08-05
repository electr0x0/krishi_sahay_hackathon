'use client';

import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="bn">
      <body
        className={`${notoSansBengali.variable} antialiased font-sans`}
      >
        <AuthProvider>
          {!isDashboard && <Header />}
          <main className={!isDashboard ? "pt-16" : ""}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}