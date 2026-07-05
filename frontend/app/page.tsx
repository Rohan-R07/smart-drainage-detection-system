'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardPayload } from '../types';
import { Droplet, Fan, Ruler, AlertCircle, WifiOff } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

import Header from '../components/Header';
import WaterGauge from '../components/WaterGauge';
import StatusPanel from '../components/StatusPanel';
import ControlPanel from '../components/ControlPanel';
import RealtimeCharts from '../components/RealtimeCharts';
import EventTimeline from '../components/EventTimeline';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/status');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const json: DashboardPayload = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial load
    const interval = setInterval(fetchData, 1000); // Poll every 1s

    return () => clearInterval(interval);
  }, []);

  const latestState = data?.latest_state;
  const connectionHealth = data?.connection || data?.connection_health || null;
  const history = data?.history || [];
  const events = data?.events || [];

  // Prepare sparkline history (last 10 points)
  const sparklineData = history.slice(-10).map((item) => ({
    waterLevel: item.waterLevel,
  }));

  // Loading skeleton state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans p-6 space-y-6">
        <div className="h-16 w-full bg-zinc-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-1 h-[350px] bg-zinc-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isConnected = connectionHealth?.connected ?? false;
  const waterLevel = latestState?.waterLevel ?? 0;
  const distanceValue = latestState?.distance ?? 0;

  // Circular ring properties
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (waterLevel / 100) * circumference;

  return (
    <div className="min-h-screen bg-zinc-50/40 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-800 relative">
      {/* Header Panel */}
      <Header connectionHealth={connectionHealth} />

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Error Notification Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-semibold text-rose-700 shadow-sm animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Connection Warning: Lost contact with Flask API. Trying to reconnect...</span>
          </div>
        )}

        {/* First Row: 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Card 1: Water Level */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-blue-500">💧</span> Water Level
              </span>
              {/* Circular ring indicator */}
              <svg className="w-8 h-8 transform -rotate-90">
                <circle cx="16" cy="16" r={radius} className="stroke-zinc-100" strokeWidth="2.5" fill="transparent" />
                <motion.circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-blue-500"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
            </div>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-black text-zinc-800 tracking-tight">{waterLevel}</span>
              <span className="text-sm font-bold text-zinc-400 ml-0.5">%</span>
            </div>
            {/* Sparkline Visual */}
            <div className="h-6 w-full mt-2">
              {sparklineData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <Area type="monotone" dataKey="waterLevel" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Card 2: Distance */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-zinc-400" /> Sensor Distance
              </span>
            </div>
            <div className="flex items-baseline mt-4">
              <span className="text-3xl font-black text-zinc-800 tracking-tight">
                {distanceValue.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-zinc-400 ml-0.5">cm</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold mt-2 uppercase tracking-wide">
              Ultrasonic Depth Reading
            </div>
          </motion.div>

          {/* Card 3: Water Detection */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-blue-500">🚰</span> Water Detection
              </span>
              <motion.div
                animate={latestState?.waterDetected ? { y: [0, -3, 0], scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-blue-500"
              >
                <Droplet className="w-5 h-5 fill-current" />
              </motion.div>
            </div>
            <div className="flex items-baseline mt-4">
              <span className="text-3xl font-black text-zinc-800 tracking-tight">
                {latestState?.waterDetected ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold mt-2 uppercase tracking-wide">
              Inlet Plate Contact
            </div>
          </motion.div>

          {/* Card 4: Pump Status */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-amber-500">⚡</span> Pump Status
              </span>
              <motion.div
                animate={latestState?.pumpRunning ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className={latestState?.pumpRunning ? 'text-emerald-500' : 'text-zinc-300'}
              >
                <Fan className="w-5 h-5" />
              </motion.div>
            </div>
            <div className="flex items-baseline mt-4">
              <span className="text-3xl font-black text-zinc-800 tracking-tight">
                {latestState?.pumpRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold mt-2 uppercase tracking-wide">
              Motor Actuator
            </div>
          </motion.div>

        </div>

        {/* Second Row: Core Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealtimeCharts history={history} />
          </div>
          <div className="lg:col-span-1">
            <WaterGauge waterLevel={waterLevel} connected={isConnected} />
          </div>
        </div>

        {/* Third Row: Diagnostics & Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {latestState && (
            <>
              <StatusPanel latestState={latestState} connected={isConnected} />
              <ControlPanel latestState={latestState} connected={isConnected} onSuccess={fetchData} />
            </>
          )}
        </div>

        {/* Fourth Row: Live Activity Timeline */}
        <div className="w-full">
          <EventTimeline events={events} />
        </div>

      </main>

      {/* Reconnection Overlay Cover Screen (Apple/Tesla style blur) */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-zinc-100 p-8 rounded-[24px] shadow-2xl flex flex-col items-center max-w-sm w-full"
            >
              <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 animate-bounce">
                <WifiOff className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">No Arduino Connected</h2>
              <p className="text-xs text-zinc-400 font-semibold mt-2 leading-relaxed">
                The Flask gateway is scanning COM ports to establish connection. Manual operations are locked.
              </p>
              <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden mt-6">
                <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
