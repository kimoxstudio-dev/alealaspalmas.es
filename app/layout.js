import "./globals.css";

export const metadata = {
  title: "Alea Las Palmas · Asociación Cultural",
  description:
    "Asociación cultural de juegos de rol, mesa, wargames y miniaturas en Las Palmas de Gran Canaria. Local 24/7, ludoteca abierta y 60+ eventos al año.",
  metadataBase: new URL("https://alealaspalmas.vercel.app"),
  openGraph: {
    title: "Alea Las Palmas · Tira, juega, repite.",
    description:
      "Local 24/7 para socios, ludoteca con +350 juegos y eventos durante todo el año en Las Palmas de Gran Canaria.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a12",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,700&family=Inter+Tight:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Caveat:wght@400;600;700&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
