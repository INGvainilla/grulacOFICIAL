/**
 * Componente Layout Principal (Root Layout).
 * Arquitectura PUDS: Envoltorio Estructural Base (Boundary/UI).
 * Define la estructura HTML maestra de la aplicación, inyectando la fuente
 * tipográfica y el sistema de notificaciones global (Toaster).
 */
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Configuración de tipografía estándar para la interfaz
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Metadatos globales (SEO y Pestaña del Navegador) definidos para el proyecto
export const metadata = {
  title: "GRULAC ERP - Sistema Integrado",
  description: "ERP Corporativo de GRULAC S.R.L. con trazabilidad SENASAG",
};

export default function RootLayout({ children }) {
  return (
    // Se establece el idioma a español (es) y se aplica el tema oscuro (dark) por defecto
    <html lang="es" className={`dark ${inter.variable} antialiased h-full`}>
      <body className="font-sans min-h-full flex flex-col">
        {/* Renderiza las vistas secundarias inyectadas */}
        {children}
        {/* Gestor global de notificaciones y alertas al usuario */}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
