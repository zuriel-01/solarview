import { SessionProvider } from "@/components/providers/SessionProvider";
import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolarView",
  description: "Monitor Your Solar Energy in Real-Time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${poppins.variable} antialiased font-sans`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
