'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, RefreshCw, AlertOctagon, Droplets } from 'lucide-react';

interface StatusPanelProps {
  latestState: {
    waterDetected: boolean;
    waterSensor: number;
    distance: number;
    waterLevel: number;
    status: 'NORMAL' | 'WARNING' | 'CHECKING' | 'BLOCKED';
    pumpRunning: boolean;
    relay: boolean;
  };
  connected: boolean;
}

export default function StatusPanel({ latestState, connected }: StatusPanelProps) {
  const { waterDetected, status } = latestState;

  // Resolve active status key
  const activeKey = !connected ? 'OFFLINE' : (!waterDetected ? 'DRY' : status);

  const statusRegistry = [
    {
      key: 'DRY',
      label: 'No Water Detected',
      color: 'zinc',
      badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      activeBadgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-300 ring-zinc-200',
      icon: Droplets,
      description: 'The drainage sump is dry. No active water accumulation detected.',
    },
    {
      key: 'NORMAL',
      label: 'Normal Operation',
      color: 'emerald',
      badgeClass: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
      activeBadgeClass: 'bg-emerald-500 text-white border-emerald-500 ring-emerald-100',
      icon: CheckCircle2,
      description: 'Water level is within safe operating margins. Flow is unrestricted.',
    },
    {
      key: 'CHECKING',
      label: 'Flow Checking',
      color: 'blue',
      badgeClass: 'bg-blue-50/50 text-blue-600 border-blue-100',
      activeBadgeClass: 'bg-blue-600 text-white border-blue-600 ring-blue-100',
      icon: RefreshCw,
      description: 'Water level is elevated. Diagnostics are checking for drainage movement.',
    },
    {
      key: 'WARNING',
      label: 'Critical Warning',
      color: 'amber',
      badgeClass: 'bg-amber-50/50 text-amber-600 border-amber-100',
      activeBadgeClass: 'bg-amber-500 text-white border-amber-500 ring-amber-100',
      icon: AlertTriangle,
      description: 'Level is high. Warning limits exceeded. Immediate manual monitoring advised.',
    },
    {
      key: 'BLOCKED',
      label: 'Drainage Blocked',
      color: 'rose',
      badgeClass: 'bg-rose-50/50 text-rose-600 border-rose-100',
      activeBadgeClass: 'bg-rose-600 text-white border-rose-600 ring-rose-100',
      icon: AlertOctagon,
      description: 'Water level latched high with no drainage detected. Blockage identified!',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-[20px] border border-zinc-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-5">
          System Status & Diagnostics
        </h3>

        {/* Diagnostic Registry List */}
        <div className="space-y-4">
          {statusRegistry.map((item) => {
            const isActive = activeKey === item.key;
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'border-zinc-200 bg-zinc-50/50 shadow-sm'
                    : 'border-zinc-100/50 bg-white opacity-40'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    isActive
                      ? item.key === 'DRY'
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        : item.key === 'NORMAL'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : item.key === 'CHECKING'
                        ? 'bg-blue-50 border-blue-100 text-blue-600'
                        : item.key === 'WARNING'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive && item.key === 'CHECKING' ? 'animate-spin' : ''}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-bold ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {item.label}
                    </h4>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ring-4 ${item.activeBadgeClass}`}
                      >
                        ACTIVE
                      </motion.span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
