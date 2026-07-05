'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryState } from '../types';
import { AreaChart as ChartIcon, Eye } from 'lucide-react';

interface RealtimeChartsProps {
  history: TelemetryState[];
  connected: boolean;
}

export default function RealtimeCharts({ history, connected }: RealtimeChartsProps) {
  const [activeTab, setActiveTab] = useState<'level' | 'distance'>('level');

  // Format data for Recharts
  const chartData = history.map((item) => {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col h-full">
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">Historical Telemetry</h2>
        </div>

        {/* Apple-style Segmented Control */}
        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/40 select-none">
          <button
            onClick={() => setActiveTab('level')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'level'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Water Level (%)
          </button>
          <button
            onClick={() => setActiveTab('distance')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'distance'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sump Distance (m)
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[260px] relative">
        {!connected && chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/20 rounded-xl border border-dashed border-gray-200 text-center p-6">
            <Eye className="w-8 h-8 text-gray-300 animate-pulse mb-2" />
            <p className="text-sm font-semibold text-gray-500">Waiting for live data feed...</p>
            <p className="text-xs text-gray-400 mt-0.5">Please connect the Arduino UNO to populate history.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'level' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  style={{ fontSize: '10px', fill: '#9ca3af', fontWeight: 500 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  style={{ fontSize: '10px', fill: '#9ca3af', fontWeight: 500 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200/80 p-3 rounded-xl shadow-xl flex flex-col gap-0.5 select-none">
                          <span className="text-[10px] text-gray-400 font-bold tracking-wider">{payload[0].payload.time}</span>
                          <span className="text-sm font-black text-blue-600">
                            Level: {payload[0].value}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLevel)"
                  isAnimationActive={false} // Disable to avoid chart lag during rapid socket refreshes
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  style={{ fontSize: '10px', fill: '#9ca3af', fontWeight: 500 }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  style={{ fontSize: '10px', fill: '#9ca3af', fontWeight: 500 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200/80 p-3 rounded-xl shadow-xl flex flex-col gap-0.5 select-none">
                          <span className="text-[10px] text-gray-400 font-bold tracking-wider">{payload[0].payload.time}</span>
                          <span className="text-sm font-black text-indigo-600">
                            Distance: {payload[0].value} m
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
        <span>History window: 40s</span>
        <span>Updates: Instant (WS)</span>
      </div>
    </div>
  );
}
