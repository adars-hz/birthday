import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Birthday! ✨ A Special Birthday Gift Just For You",
  description: "An interactive modern birthday wishes gift experience with 3D gift unboxing, cinematic memory video reel, blowable candle birthday cake, and heartfelt blessings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#07080e] text-[#f8fafc] font-sans antialiased overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
