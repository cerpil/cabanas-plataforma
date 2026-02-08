import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SchemaOrg from "@/components/SchemaOrg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cabanas na Mata | Refúgio e Hospedagem na Serra da Moeda",
  description: "Descubra o refúgio perfeito em Minas Gerais. Cabanas exclusivas com vista para a Serra da Moeda, conforto moderno e imersão total na natureza.",
  keywords: ["cabanas serra da moeda", "hospedagem minas gerais", "chalés românticos", "aluguel temporada serra da moeda", "cabanas na mata", "pousada serra da moeda"],
  authors: [{ name: "Cabanas na Mata" }],
  openGraph: {
    title: "Cabanas na Mata | Refúgio na Serra da Moeda",
    description: "Cabanas exclusivas integradas à natureza. O destino ideal para desconectar e relaxar.",
    url: "https://www.cabanasnamata.com.br",
    siteName: "Cabanas na Mata",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabanas na Mata | Refúgio na Serra da Moeda",
    description: "Experiência única de hospedagem integrada à natureza em Minas Gerais.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <SchemaOrg />
        {children}
        <a 
          href="https://instagram.com/cabanasnamata" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
          title="Siga-nos no Instagram"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-stone-900 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            @cabanasnamata
          </span>
        </a>
      </body>
    </html>
  );
}
