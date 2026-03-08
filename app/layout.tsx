import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "UX Designs",
  description: "Component library with live previews and prompts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      />
      <body className="bg-[#0a0a0b] text-[#f2f2f7] font-sans antialiased min-h-screen">
        {children}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
