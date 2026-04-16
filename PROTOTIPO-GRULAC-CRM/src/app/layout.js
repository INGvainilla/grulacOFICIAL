import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "GRULAC ERP - Sistema Integrado",
  description: "ERP Corporativo de GRULAC S.R.L. con trazabilidad SENASAG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`dark ${inter.variable} antialiased h-full`}>
      <body className="font-sans min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
