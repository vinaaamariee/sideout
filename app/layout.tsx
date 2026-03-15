import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SideOut — Live e-Scoresheet & Analytics",
  description: "Real-time volleyball scoring, player statistics, and match analytics",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} dark`}>
      <body className="bg-themed text-themed font-display antialiased transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
