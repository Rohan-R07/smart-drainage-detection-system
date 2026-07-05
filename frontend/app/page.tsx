'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardPayload } from '../types';
import { Droplet, Fan, Ruler, AlertCircle, WifiOff, AlertTriangle, Power, RefreshCw, X } from 'lucide-react';
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [blockageDismissed, setBlockageDismissed] = useState<boolean>(false);

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
    const interval = setInterval(fetchData, 1000); // Poll every 1 second

    return () => clearInterval(interval);
  }, []);

  const latestState = data?.latest_state;
  const connectionHealth = data?.connection || data?.connection_health || null;
  const history = data?.history || [];
  const events = data?.events || [];

  const isBlocked = latestState?.status === 'BLOCKED';

  // Automatically reset the blockage dismissed flag once the blockage clears
  useEffect(() => {
    if (!isBlocked) {
      setBlockageDismissed(false);
    }
  }, [isBlocked]);

  const handlePumpControl = async (cmd: 'PUMP_ON' | 'PUMP_OFF') => {
    if (!isConnected || actionLoading) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: cmd }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! Status: ${response.status}`);
      }

      // Refresh data immediately
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Sparkline history data points (last 10 Level reads)
  const sparklineData = history.slice(-10).map((item) => ({
    waterLevel: item.waterLevel,
  }));

  // Loading skeleton screen
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
  const isWaterDetected = latestState?.waterDetected ?? false;

  // Circular ring properties
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (waterLevel / 100) * circumference;

  // Stagger variants for the dashboard elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-zinc-50/40 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-800 relative">
      
      {/* Sticky Warning Bar (displays only when blockage is active) */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-rose-600 text-white text-center font-bold text-xs py-3 px-4 flex items-center justify-center gap-2 z-30 relative shadow-md"
          >
            <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
            <span>⚠ BLOCKAGE DETECTED — Drainage inspection required.</span>
          </motion.div>
        )}
      </AnimatePresence>

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

        {actionError && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-semibold text-rose-700 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Command Dispatch Failed: {actionError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isWaterDetected ? (
            /* DRY EMPTY STATE PANEL */
            <motion.div
              key="dry-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex items-center justify-center py-12"
            >
              {/* Apple-style premium dry state illustration */}
              <div className="bg-white rounded-[24px] border border-zinc-100 p-16 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col items-center justify-center text-center max-w-md w-full min-h-[400px]">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-full bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-500 text-5xl mb-6 shadow-sm"
                >
                  💧
                </motion.div>
                <h2 className="text-xl font-black text-zinc-800 tracking-tight">No Water Detected</h2>
                <p className="text-sm text-zinc-400 font-semibold mt-3 leading-relaxed">
                  The drainage is currently dry.
                  <br />
                  Waiting for water to be detected...
                </p>
              </div>
            </motion.div>
          ) : (
            /* WATER TELEMETRY PRESENT DASHBOARD PANEL */
            <motion.div
              key="wet-state"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex flex-col gap-6"
            >
              {/* First Row: 4 Stat Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Card 1: Water Level */}
                <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="text-blue-500">💧</span> Water Level
                    </span>
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
                  <div className="h-6 w-full mt-2">
                    {sparklineData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                          <Area type="monotone" dataKey="waterLevel" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Card 2: Distance */}
                <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]">
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
                </div>

                {/* Card 3: Water Detection */}
                <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]">
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
                </div>

                {/* Card 4: Pump Status */}
                <div className="bg-white rounded-[20px] border border-zinc-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[120px]">
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
                </div>

              </motion.div>

              {/* Second Row: Core Analytics Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RealtimeCharts history={history} />
                </div>
                <div className="lg:col-span-1">
                  <WaterGauge waterLevel={waterLevel} connected={isConnected} />
                </div>
              </motion.div>

              {/* Third Row: Diagnostics & Control Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {latestState && (
                  <>
                    <StatusPanel latestState={latestState} connected={isConnected} />
                    <ControlPanel latestState={latestState} connected={isConnected} onSuccess={fetchData} />
                  </>
                )}
              </motion.div>

              {/* Fourth Row: Live Activity Timeline */}
              <motion.div variants={itemVariants} className="w-full">
                <EventTimeline events={events} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Blockage Alert Overlay Modal (Highest Priority) */}
      <AnimatePresence>
        {isBlocked && !blockageDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-gradient-to-br from-rose-500 to-rose-600 border border-rose-400 text-white rounded-[24px] p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              {/* Absoluted close dismiss node */}
              <button
                onClick={() => setBlockageDismissed(true)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/90"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Warning Blinking Icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl mb-4"
                >
                  🚨
                </motion.div>

                <h2 className="text-2xl font-black tracking-tight">BLOCKAGE DETECTED</h2>
                <p className="text-xs font-semibold text-rose-100 mt-2 leading-relaxed max-w-xs">
                  Possible drainage blockage has been detected. Immediate inspection is recommended.
                </p>

                {/* Diagnostics block */}
                <div className="grid grid-cols-2 gap-4 w-full bg-white/10 border border-white/10 rounded-xl p-4 my-6 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider block">
                      Water Level
                    </span>
                    <span className="text-xl font-black">{waterLevel}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider block">
                      Pump Status
                    </span>
                    <span className="text-xl font-black">
                      {latestState?.pumpRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>

                {/* Pump control override CTA inside modal */}
                <div className="flex flex-col gap-3 w-full">
                  {latestState?.pumpRunning ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePumpControl('PUMP_OFF')}
                      disabled={actionLoading}
                      className="w-full py-3.5 bg-white text-rose-600 font-bold rounded-xl text-sm shadow-md hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                      <span>STOP PUMP</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePumpControl('PUMP_ON')}
                      disabled={actionLoading}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md border border-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                      <span>START PUMP</span>
                    </motion.button>
                  )}

                  <button
                    onClick={() => setBlockageDismissed(true)}
                    className="text-xs font-semibold text-rose-100 hover:text-white transition-all underline underline-offset-4 decoration-rose-300 hover:decoration-white mt-1"
                  >
                    Dismiss Warning
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
