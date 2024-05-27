import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./wyvrn.css";
//
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wyvern",
  description: "Burninating the countryside!",
	viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script src="/pwa-script.js" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
