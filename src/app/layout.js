import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/components/mil";
import { SocketProvider } from "@/lib/SocketContext";

export const metadata = {
  title: "DatumOS | BIM Operations Command",
  description: "ISO 19650 Compliant BIM Management Platform — Datum Studios Engineering Consultancy",
  keywords: "BIM, ISO 19650, Engineering, Coordination, DatumOS",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Military Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="antialiased"
        style={{
          background: "#0a0e14",
          color: "#f0f2f5",
          fontFamily: "'Rajdhani', 'Inter', sans-serif",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* Global grid overlay — futuristic scanline background */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(107,142,35,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(107,142,35,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {/* Radial vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {/* App content */}
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
          <AuthProvider><SocketProvider><ToastProvider>{children}</ToastProvider></SocketProvider></AuthProvider>
        </div>
      </body>
    </html>
  );
}