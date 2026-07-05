'use client';

import React, { useState, useEffect } from 'react';
import { ConnectionHealth } from '../types';
import { Activity, Wifi, WifiOff, RefreshCw, Cpu, Layers } from 'lucide-react';

interface HeaderProps {
  connectionHealth: ConnectionHealth;
}

export default function Header({ connectionHealth }: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    connected,
    port,
    packets_received,
    malformed_packets,
    reconnect_attempts,
    last_packet_received,
  } = connectionHealth;

  const lastPacketTimeFormatted = last_packet_received
    ? new Date(last_packet_received).toLocaleTimeString('en-US', { hour12: false })
    : 'N/A';

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-40 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Time Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              Smart Drainage Monitoring System
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
            Solar Water Pumping System Model
          </p>
        </div>

        {/* Live Date/Time Clock & Health Panel */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Running Clock Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex flex-col items-end shadow-sm">
            <span className="text-sm font-semibold text-gray-800 tabular-nums">
              {time || '00:00:00'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {date || 'Loading...'}
            </span>
          </div>

          {/* Connection Status Panel */}
          <div className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-xl p-1.5 shadow-sm">
            {/* Status indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                connected
                  ? 'bg-green-50 text-green-700 border border-green-200/50'
                  : 'bg-red-50 text-red-700 border border-red-200/50'
              }`}
            >
              {connected ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>CONNECTED</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                  <span>DISCONNECTED</span>
                </>
              )}
            </div>

            {/* Quick Metrics details */}
            <div className="hidden sm:flex items-center gap-4 px-3 text-[11px] text-gray-500 font-medium">
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-gray-400" />
                <span>Port: <span className="font-semibold text-gray-700">{port}</span></span>
              </div>
              
              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span>Packets: <span className="font-semibold text-gray-700">{packets_received}</span></span>
              </div>

              {malformed_packets > 0 && (
                <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                  <span>Malformed: <span className="font-bold">{malformed_packets}</span></span>
                </div>
              )}

              {reconnect_attempts > 0 && (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Retries: <span className="font-bold">{reconnect_attempts}</span></span>
                </div>
              )}

              {connected && (
                <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                  <Activity className="w-3.5 h-3.5 text-gray-400" />
                  <span>Last: <span className="font-semibold text-gray-700">{lastPacketTimeFormatted}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
