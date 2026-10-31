import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import ReactQueryProvider from "@/components/query-provider";
import Header from "@/components/Header";
import FriendRequestNotifier from "@/components/FriendRequestNotifier";
import { ToastProvider } from "@/components/ToastProvider";
import { I18nProvider } from "@/context/I18nContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionProvider } from "@/components/motion";
import ViewTransitionGuard from "@/components/ViewTransitionGuard";
import MobileViewport from "@/components/MobileViewport";
import GuestSessionGuard from "@/components/GuestSessionGuard";
import SessionGuard from "@/components/SessionGuard";

const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("kanso-theme") || localStorage.getItem("collectify-theme");
    var light = saved === "light";
    document.body.classList.toggle("theme-light", light);
    document.body.classList.toggle("theme-dark", !light);
  } catch (_) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kanso.",
  description: "Your music collection manager",
  applicationName: "kanso.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "kanso.",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

// `viewport-fit=cover` deja que la app pinte también bajo el notch y el
// indicador de inicio; las franjas se compensan con `env(safe-area-inset-*)`.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101b14",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased theme-dark`}
          suppressHydrationWarning
        >
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <ViewTransitionGuard />
          <MobileViewport />
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <GuestSessionGuard />
                <ProfileProvider>
                  <ReactQueryProvider>
                    <MotionProvider>
                      <ToastProvider>
                        <Header />
                        <FriendRequestNotifier />
                        <div className="app-content">
                          <SessionGuard>{children}</SessionGuard>
                        </div>
                      </ToastProvider>
                    </MotionProvider>
                  </ReactQueryProvider>
                </ProfileProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
