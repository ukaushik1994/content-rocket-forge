import React from 'react';

export function PageBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-futuristic-grid bg-grid opacity-10" />

      {/* Gradient beams */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[480px] rotate-12 bg-gradient-to-r from-primary/30 via-primary/5 to-transparent blur-3xl opacity-50 animate-gradient-shift" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1000px] h-[420px] -rotate-12 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-3xl opacity-40 animate-gradient-shift" />

      {/* Radial glows */}
      <div className="absolute top-24 left-1/5 w-80 h-80 rounded-full bg-primary/15 blur-3xl opacity-50 animate-float" />
      <div className="absolute bottom-20 right-1/5 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-foreground/5 blur-3xl opacity-40 animate-float" style={{ animationDelay: '0.8s' }} />

      {/* Orbs */}
      <div className="absolute top-28 right-28 w-24 h-24 rounded-full border border-white/10 bg-card/40 backdrop-blur-xl shadow-neon animate-float" />
      <div className="absolute bottom-32 left-32 w-16 h-16 rounded-full border border-white/10 bg-card/40 backdrop-blur-xl animate-float" style={{ animationDuration: '8s' }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/70" />
    </div>
  );
}
