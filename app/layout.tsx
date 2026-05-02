import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ClinOS PADDI — SaaS Clínico",
  description: "Sistema SaaS profissional para clínica interdisciplinar"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
