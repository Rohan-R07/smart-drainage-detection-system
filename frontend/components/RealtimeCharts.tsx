'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, BarChart2 } from 'lucide-react';

interface TelemetryState {
  timestamp: string;
  waterDetected: boolean;
  waterSensor: number;
  distance: number;
  waterLevel: number;
  status: 'NORMAL' | 'WARNING' | 'CHECKING' | 'BLOCKED';
  pumpRunning: boolean;
  relay: boolean;
}

interface RealtimeChartsProps {
  history: TelemetryState[];
}

export default function RealtimeCharts({ history }: RealtimeChartsProps) {
  const [metric, setMetric] = useState<'level' | 'distance'>('level');

  // Format data for Recharts, taking last 50 readings
  const chartData = history.slice(-50).map((item) => {
    try {
      const timeObj = new Date(item.timestamp);
      const timeFormatted = timeObj.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return {
        time: timeFormatted,
        waterLevel: item.waterLevel,
        distance: Number(item.distance.toFixed(2)),
      };
    } catch {
      return {
        time: '00:00:00',
        waterLevel: item.waterLevel,
        distance: item.distance,
      };
    }
  });

  const isLevel = metric === 'level';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-[20px] border border-zinc-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between min-h-[400px]"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-800">Telemetry History</h3>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
              Live updates every 1.0s
            </p>
          </div>
        </div>

        {/* Chart Toggle Switches */}
        <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setMetric('level')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isLevel
                ? 'bg-white text-blue-600 border border-zinc-200/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Water Level (%)
          </button>
          <button
            onClick={() => setMetric('distance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isLevel
                ? 'bg-white text-blue-600 border border-zinc-200/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Distance (cm)
          </button>
        </div>
      </div>

      {/* Chart Visualizer */}
      <div className="flex-1 w-full h-[280px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-zinc-100 rounded-xl text-zinc-400 gap-2">
            <BarChart2 className="w-8 h-8 text-zinc-300 animate-pulse" />
            <span className="text-xs font-semibold">Waiting for telemetry packets...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={isLevel ? [0, 100] : ['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
                labelStyle={{ color: '#71717a' }}
              />
              <Area
                type="monotone"
                dataKey={isLevel ? 'waterLevel' : 'distance'}
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
                name={isLevel ? 'Water Level (%)' : 'Distance (cm)'}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
