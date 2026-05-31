import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RPIC API",
  description: "Retour des Pièces Incidentées et Comex — Backend API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
