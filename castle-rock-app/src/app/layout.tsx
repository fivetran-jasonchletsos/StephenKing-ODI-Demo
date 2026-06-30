import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Rozha_One, Special_Elite, Crimson_Pro } from "next/font/google";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import Script from "next/script";
import "./globals.css";

const rozha = Rozha_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-rozha",
  display: "swap",
});
const elite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-special-elite",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Castle Rock Archive — The Stephen King Universe",
  description:
    "Every novel. Every adaptation. Every cameo. Every recurring character. Built on Fivetran + Snowflake + dbt + Iceberg + dbt-wizard run-time agents.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0807",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rozha.variable} ${elite.variable} ${mono.variable} ${crimson.variable}`}>
      <body className="pulp min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1">{children}</div>
        <Footer />
        <Script src="/feedback-widget.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
