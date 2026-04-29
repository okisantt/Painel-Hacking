import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel Hacking Etico",
  description: "Roadmap interativo e minimalista para aprendizado de hacking etico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
