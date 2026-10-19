import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { AuthProvider } from "@/context/AuthContext";
import ReactQueryProvider from "@/components/query-provider";
import Header from "@/components/Header";
import { I18nProvider } from "@/context/I18nContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionProvider } from "@/components/motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanso",
  description: "Your music collection manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased theme-light`}
          suppressHydrationWarning
        >
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <ReactQueryProvider>
                  <MotionProvider>
                    <Header />
                    <div className="app-content">{children}</div>
                  </MotionProvider>
                </ReactQueryProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
