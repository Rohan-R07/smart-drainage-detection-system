'use client';

import React, { useState, useEffect } from 'react';
import { ConnectionHealth } from '../types';
import { Wifi, WifiOff, Calendar, Clock, Database } from 'lucide-react';

interface HeaderProps {
  connectionHealth: ConnectionHealth | null;
}

export default function Header({ connectionHealth }: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = connectionHealth?.connected ?? false;
  const activePort = connectionHealth?.port ?? 'N/A';

  return (
    <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-40 px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title Block */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
              Smart Drainage Monitoring System
            </h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium mt-0.5">
            Real-time Municipal Drainage Monitoring
          </p>
        </div>

        {/* Live Date/Time Clock & Connection Badges */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Running Clock Cards */}
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-zinc-600 shadow-sm text-xs font-medium">
            <div className="flex items-center gap-1.5 border-r border-zinc-200 pr-3">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{date || 'Loading...'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-zinc-800 font-semibold">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{time || '00:00:00'}</span>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-xl p-1 shadow-sm">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>CONNECTED</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>OFFLINE</span>
                </>
              )}
            </div>
            
            {isConnected && (
              <span className="text-[11px] font-semibold text-zinc-400 px-2 flex items-center gap-1">
                <Database className="w-3 h-3 text-zinc-300" />
                {activePort}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
