"use client";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>RPIC — Gestion des pièces</title>
        <meta name="description" content="Retour des Pièces Incidentées et Comex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: "DM Sans, sans-serif", fontSize: "14px" },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
