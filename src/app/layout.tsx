import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ResumeAnalysisProvider } from "@/hooks/useResumeContext";
import GridOverlay from "@/components/background/GridOverlay";
import NoiseOverlay from "@/components/background/NoiseOverlay";
import Preloader from "@/components/ui/Preloader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elevate.ai — Career Intelligence Studio",
  description:
    "Upload your resume to reveal ATS gaps, skill signals, resume improvements, and career path matches. Powered by AI.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-ev-black text-ev-text font-body antialiased min-h-screen">
        <ResumeAnalysisProvider>
          <Preloader />
          <GridOverlay />
          <NoiseOverlay />
          <div className="relative z-10">{children}</div>
        </ResumeAnalysisProvider>
      </body>
    </html>
  );
}
