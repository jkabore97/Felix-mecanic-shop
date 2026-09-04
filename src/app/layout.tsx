import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Felix Mécanic — Pièces auto, moto & vélo au Burkina Faso",
    template: "%s · Felix Mécanic",
  },
  description:
    "La vitrine en ligne de pièces mécaniques au Burkina Faso : voitures, motos, vélos et tricycles. Achetez, vendez, faites-vous livrer.",
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col pb-20 md:pb-0">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav user={user} />
      </body>
    </html>
  );
}
