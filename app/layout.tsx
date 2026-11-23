import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NoteWise AI — Turn complex notes into simple learning",
    template: "%s · NoteWise AI",
  },
  description:
    "Upload a PDF or PowerPoint and get structured short notes, simple explanations, real diagrams, a revision sheet and a downloadable presentation. Learn less complicated. Understand more.",
  applicationName: "NoteWise AI",
  keywords: [
    "AI study notes",
    "PDF summariser",
    "PPT generator",
    "student revision",
    "engineering notes",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0b0d17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[160px]" />
          <div className="absolute right-[-15%] top-[18%] h-[480px] w-[480px] rounded-full bg-cyan/12 blur-[170px]" />
          <div className="absolute bottom-[-25%] left-[35%] h-[520px] w-[520px] rounded-full bg-accent-deep/15 blur-[190px]" />
          <div className="absolute inset-0 grid-bg opacity-[0.35]" />
        </div>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
