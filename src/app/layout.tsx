import type { Metadata } from "next";
import { Inter, Space_Grotesk, Noto_Sans_Sinhala } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sinhala",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vardhel | Your Vision, Our Framework",
    template: "%s | Vardhel",
  },
  description:
    "Custom software solutions, flagship products, and end-to-end social media marketing & business growth partner in Sri Lanka.",
  icons: {
    icon: "/SVG/iconlogo.svg",
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
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansSinhala.variable}`}
    >
      <body className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased selection:bg-orange-600 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
