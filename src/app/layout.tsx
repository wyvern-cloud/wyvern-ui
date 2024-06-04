import type { Metadata, Viewport  } from "next";
import { Inter } from "next/font/google";
import "./wyvrn.css";
//
const inter = Inter({ subsets: ["latin"] });

 
export const viewport: Viewport = {
  //themeColor: 'black',
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
  title: "Wyvern",
  description: "Burninating the countryside!",
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
