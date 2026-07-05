'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaterGaugeProps {
  waterLevel: number;
  connected: boolean;
}

export default function WaterGauge({ waterLevel, connected }: WaterGaugeProps) {
  // Determine color theme based on water level
  const getColors = (val: number) => {
    if (!connected) {
      return {
        fillClass: 'bg-zinc-400',
        borderClass: 'border-zinc-200',
        textClass: 'text-zinc-400',
        bgClass: 'bg-zinc-50/50',
        gradient: 'from-zinc-400 to-zinc-500',
      };
    }
    if (val <= 70) {
      return {
        fillClass: 'bg-emerald-500',
        borderClass: 'border-emerald-200',
        textClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50/30',
        gradient: 'from-emerald-400 to-emerald-500',
      };
    }
    if (val <= 90) {
      return {
        fillClass: 'bg-amber-500',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-600',
        bgClass: 'bg-amber-50/30',
        gradient: 'from-amber-400 to-amber-500',
      };
    }
    return {
      fillClass: 'bg-rose-500',
      borderClass: 'border-rose-200',
      textClass: 'text-rose-600',
      bgClass: 'bg-rose-50/30',
      gradient: 'from-rose-400 to-rose-500',
    };
  };

  const colors = getColors(waterLevel);
  const waveBottomOffset = connected ? `${waterLevel - 100}%` : '-100%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-[20px] border border-zinc-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center h-full min-h-[300px]"
    >
      <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-4">
        Water Tank Volume
      </h3>

      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Outer subtle shadow boundary */}
        <div className={`absolute inset-0 rounded-full border border-zinc-100/80 bg-zinc-50/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]`} />

        {/* Circular liquid container */}
        <div className="relative w-48 h-48 rounded-full bg-white shadow-inner overflow-hidden border border-zinc-100 flex items-center justify-center">
          {/* Wave 1 */}
          <div
            className={`absolute left-1/2 w-[220%] h-[220%] rounded-[42%] -translate-x-1/2 wave-animation transition-all duration-1000 ${colors.fillClass} opacity-85`}
            style={{ bottom: waveBottomOffset }}
          />

          {/* Wave 2 (layered volumetric opacity depth) */}
          <div
            className={`absolute left-1/2 w-[230%] h-[230%] rounded-[40%] -translate-x-1/2 wave-animation-slow transition-all duration-1000 ${colors.fillClass} opacity-40`}
            style={{ bottom: waveBottomOffset }}
          />

          {/* Digital Readout HUD (Z-Indexed above water waves) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
            {connected ? (
              <>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-zinc-900 tracking-tight">
                    {waterLevel}
                  </span>
                  <span className="text-xl font-bold text-zinc-400 ml-0.5">%</span>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mt-1">
                  Saturated
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-zinc-400 tracking-tight">
                  OFFLINE
                </span>
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase mt-1">
                  No Connection
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
