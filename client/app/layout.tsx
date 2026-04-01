import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buddy Script - Social Network",
  description: "Connect and share with friends on Buddy Script",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '2429522708-un4a9g02gf92t2vvm7jmikjdtahog90t.apps.googleusercontent.com';
  
  return (
    <html lang="en">
      <body className={poppins.className}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </AuthProvider>
        </GoogleOAuthProvider>
        <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
