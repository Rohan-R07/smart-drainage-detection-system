'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SystemEvent {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface EventTimelineProps {
  events: SystemEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const getEventMeta = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100',
          dotClass: 'bg-emerald-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          colorClass: 'text-amber-500 bg-amber-50 border-amber-100',
          dotClass: 'bg-amber-500',
        };
      case 'error':
        return {
          icon: AlertOctagon,
          colorClass: 'text-rose-500 bg-rose-50 border-rose-100',
          dotClass: 'bg-rose-500',
        };
      default:
        return {
          icon: Info,
          colorClass: 'text-blue-500 bg-blue-50 border-blue-100',
          dotClass: 'bg-blue-500',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-[20px] border border-zinc-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between min-h-[400px]"
    >
      <div>
        <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-5">
          Live Activity Feed
        </h3>

        {/* Scrollable Timeline */}
        <div className="max-h-[290px] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2 border border-dashed border-zinc-100 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-zinc-300 animate-pulse" />
              <span className="text-xs font-semibold">No registered events yet</span>
            </div>
          ) : (
            <div className="relative border-l border-zinc-100 ml-3 pl-6 space-y-5 py-2">
              {events.map((item, idx) => {
                const meta = getEventMeta(item.type);
                const Icon = meta.icon;

                // Format time
                const timeStr = new Date(item.timestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={idx} className="relative flex flex-col items-start gap-1">
                    {/* Timeline Node Icon Overlay */}
                    <div
                      className={`absolute -left-[37px] top-0 p-1 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${meta.colorClass}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-[10px] font-mono font-bold text-zinc-400 tabular-nums">
                      {timeStr}
                    </span>
                    <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
