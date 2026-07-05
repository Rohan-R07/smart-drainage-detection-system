'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Power, RefreshCw, AlertCircle } from 'lucide-react';

interface ControlPanelProps {
  latestState: {
    pumpRunning: boolean;
    relay: boolean;
  };
  connected: boolean;
  onSuccess: () => void;
}

export default function ControlPanel({ latestState, connected, onSuccess }: ControlPanelProps) {
  const { pumpRunning, relay } = latestState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePumpControl = async (cmd: 'PUMP_ON' | 'PUMP_OFF' | 'RESET') => {
    if (!connected || loading) return;
    setLoading(true);
    setError(null);

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

      // Immediately trigger parent fetch to update UI
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-[20px] border border-zinc-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-5">
          Pump Control
        </h3>

        {/* State readout boxes */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Pump Card */}
          <div className="bg-zinc-50 border border-zinc-100/50 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Pump Status
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {pumpRunning ? (
                <>
                  <span className="text-emerald-500 text-xs">🟢</span>
                  <span className="text-sm font-bold text-zinc-800">Running</span>
                </>
              ) : (
                <>
                  <span className="text-zinc-400 text-xs">⚪</span>
                  <span className="text-sm font-semibold text-zinc-500">Stopped</span>
                </>
              )}
            </div>
          </div>

          {/* Relay Card */}
          <div className="bg-zinc-50 border border-zinc-100/50 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Relay Switch
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {relay ? (
                <>
                  <span className="text-emerald-500 text-xs">🟢</span>
                  <span className="text-sm font-bold text-zinc-800">Active</span>
                </>
              ) : (
                <>
                  <span className="text-zinc-400 text-xs">⚪</span>
                  <span className="text-sm font-semibold text-zinc-500">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div>
        {/* Toggle Button */}
        {pumpRunning ? (
          <motion.button
            whileHover={connected ? { scale: 1.02 } : {}}
            whileTap={connected ? { scale: 0.98 } : {}}
            onClick={() => handlePumpControl('PUMP_OFF')}
            disabled={!connected || loading}
            className={`w-full py-4 px-6 rounded-xl border font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all ${
              connected
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-rose-200/50'
                : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>STOP PUMP</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={connected ? { scale: 1.02 } : {}}
            whileTap={connected ? { scale: 0.98 } : {}}
            onClick={() => handlePumpControl('PUMP_ON')}
            disabled={!connected || loading}
            className={`w-full py-4 px-6 rounded-xl border font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all ${
              connected
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-emerald-200/50'
                : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>START PUMP</span>
          </motion.button>
        )}

        {/* Small reset command link for ease of diagnostics */}
        {connected && (
          <button
            onClick={() => handlePumpControl('RESET')}
            disabled={loading}
            className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-all mt-4 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-400"
          >
            Reset Active Warning States
          </button>
        )}
      </div>
    </motion.div>
  );
}
