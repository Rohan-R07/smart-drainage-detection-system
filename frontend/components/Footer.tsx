'use client';

import React from 'react';
import { Cpu, Terminal, Compass, Layers } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-200/80 px-6 py-8 mt-12 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Project Name and Copyright */}
        <div className="flex flex-col gap-1 items-center md:items-start">
          <p className="text-sm font-bold text-gray-800 tracking-tight text-center md:text-left">
            Development of Solar Water Pumping System Model for Smart Drainage
          </p>
          <p className="text-xs text-gray-400 font-semibold">
            &copy; {currentYear} Sump Drainage Sump Saturated Monitoring. All rights reserved.
          </p>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold tracking-wide uppercase">
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg text-gray-600 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            <span>Arduino UNO</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg text-gray-600 shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            <span>Flask / pySerial</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg text-gray-600 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-gray-400" />
            <span>Socket.IO / WS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg text-gray-600 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>Next.js 15 AppRouter</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
