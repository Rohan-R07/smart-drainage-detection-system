'use client';

import React from 'react';
import { SystemEvent } from '../types';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Info, ListTodo } from 'lucide-react';

interface EventTimelineProps {
  events: SystemEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  // Select icon and colors based on event level
  const getEventStyle = (type: SystemEvent['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
          colorClass: 'bg-green-50 text-green-800 border-green-100',
          dotColor: 'bg-green-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />,
          colorClass: 'bg-yellow-50/50 text-yellow-800 border-yellow-100',
          dotColor: 'bg-yellow-500',
        };
      case 'error':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
          colorClass: 'bg-red-50 text-red-800 border-red-100',
          dotColor: 'bg-red-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-blue-500" />,
          colorClass: 'bg-blue-50/30 text-blue-800 border-blue-100/50',
          dotColor: 'bg-blue-500',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col h-[400px] sm:h-full">
      <div className="flex items-center gap-2 mb-6">
        <ListTodo className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">System Log Timeline</h2>
      </div>

      {/* Events Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-200">
        {events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <Clock className="w-8 h-8 text-gray-200 mb-2 animate-pulse" />
            <p className="text-xs font-semibold">No registered events yet</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Logs appear here as telemetry changes.</p>
          </div>
        ) : (
          events.map((ev, index) => {
            const style = getEventStyle(ev.type);
            const timeFormatted = new Date(ev.timestamp).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={index}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-300 ${style.colorClass}`}
              >
                {/* Status Icon */}
                <div className="p-1 bg-white rounded-md shadow-sm border border-black/5 mt-0.5">
                  {style.icon}
                </div>

                {/* Event Message and Time */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-normal break-words">
                    {ev.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-bold tracking-wide">
                    <Clock className="w-3 h-3 text-gray-300" />
                    <span className="tabular-nums">{timeFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
        <span>Capacity: Last 20 logs</span>
      </div>
    </div>
  );
}
