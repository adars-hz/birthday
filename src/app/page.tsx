"use client";

import dynamic from "next/dynamic";

const ThreeSeasideHall = dynamic(() => import("@/components/ThreeSeasideHall"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#07080e] text-amber-200">
      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="font-cinzel text-sm tracking-widest uppercase">
        Loading 3D Seaside Hall & Ocean...
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black selection:bg-amber-400 selection:text-slate-950">
      <ThreeSeasideHall />
    </main>
  );
}
