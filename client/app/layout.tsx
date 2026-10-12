import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://whatsapp-api-gateway.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MsgNexa API — Messaging APIs · AI Agents · RAG · Webhooks · Automation",
  description:
    "Connect. Automate. Scale. Empower your business with automated WhatsApp stock inquiries, prescription orders, AI agents, RAG, and Anti-Ban safe pacing.",
  applicationName: "MsgNexa",
  keywords: [
    "MsgNexa",
    "MsgNexa API",
    "WhatsApp Gateway",
    "WhatsApp API",
    "AI Agents",
    "RAG",
    "Webhooks",
    "Automation",
    "Anti-Ban",
  ],
  openGraph: {
    title: "MsgNexa API — Messaging APIs · AI Agents · RAG · Webhooks · Automation",
    description:
      "Connect. Automate. Scale. Empower your business with automated WhatsApp stock inquiries, prescription orders, AI agents, RAG, and Anti-Ban safe pacing.",
    url: siteUrl,
    siteName: "MsgNexa",
    images: [
      {
        url: "/MsgNexa_OG.png",
        width: 1200,
        height: 630,
        alt: "MsgNexa API — Messaging APIs · AI Agents · RAG · Webhooks · Automation",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MsgNexa API — Messaging APIs · AI Agents · RAG · Webhooks · Automation",
    description:
      "Connect. Automate. Scale. Empower your business with automated WhatsApp stock inquiries, prescription orders, AI agents, RAG, and Anti-Ban safe pacing.",
    images: ["/MsgNexa_OG.png"],
  },
  icons: {
    icon: [{ url: "/MsgNexa.png", type: "image/png" }],
    shortcut: "/MsgNexa.png",
    apple: "/MsgNexa.png",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/MsgNexa.png" type="image/png" />
        <meta property="og:image" content="https://whatsapp-api-gateway.vercel.app/MsgNexa_OG.png" />
        <meta property="og:image:secure_url" content="https://whatsapp-api-gateway.vercel.app/MsgNexa_OG.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="MsgNexa API — Messaging APIs · AI Agents · RAG · Webhooks · Automation" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://whatsapp-api-gateway.vercel.app/MsgNexa_OG.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">{children}</body>
    </html>
  );
}
