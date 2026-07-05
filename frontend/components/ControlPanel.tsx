'use client';

import React from 'react';
import { TelemetryState } from '../types';
import {
  usePumpControl,
  useModeControl,
  useResetAlerts,
} from '../lib/api';
import {
  Power,
  RotateCcw,
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  Lock,
} from 'lucide-react';

interface ControlPanelProps {
  latestState: TelemetryState;
  connected: boolean;
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}

export default function ControlPanel({
  latestState,
  connected,
}: ControlPanelProps) {
  const { pumpRunning: pump } = latestState;
  const mode = 'MANUAL' as 'AUTO' | 'MANUAL';

  // React Query mutations
  const pumpMutation = usePumpControl();
  const modeMutation = useModeControl();
  const resetMutation = useResetAlerts();

  const isAuto = mode === 'AUTO';

  const handleModeSwitch = async (targetMode: 'AUTO' | 'MANUAL') => {
    if (!connected) return;
    try {
      await modeMutation.mutateAsync(targetMode);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePumpToggle = async (targetState: boolean) => {
    if (!connected || isAuto) return;
    try {
      await pumpMutation.mutateAsync(targetState);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleResetAlerts = async () => {
    if (!connected) return;
    try {
      await resetMutation.mutateAsync();
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const isPending =
    pumpMutation.isPending ||
    modeMutation.isPending ||
    resetMutation.isPending;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Offline Overlay Mask */}
      {!connected && (
        <div className="absolute inset-0 bg-gray-50/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="p-3 bg-red-100/80 border border-red-200 text-red-600 rounded-full mb-3 shadow-sm animate-bounce">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Hardware Controls Locked</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
            Please connect the Arduino UNO over Serial to enable manual override controls.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">Sump Control Panel</h2>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            System Operation Mode
          </label>
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl border border-gray-200/50">
            <button
              onClick={() => handleModeSwitch('AUTO')}
              disabled={isPending}
              className={`py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                isAuto
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {modeMutation.isPending && modeMutation.variables === 'AUTO' ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Automatic (Auto)'
              )}
            </button>
            <button
              onClick={() => handleModeSwitch('MANUAL')}
              disabled={isPending}
              className={`py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                !isAuto
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {modeMutation.isPending && modeMutation.variables === 'MANUAL' ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Manual Override'
              )}
            </button>
          </div>
        </div>

        {/* Pump Control (Manual Override) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Centrifugal Pump Trigger
            </label>
            {isAuto && (
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded">
                Managed by Auto
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePumpToggle(true)}
              disabled={isAuto || pump || isPending}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all border ${
                pump && !isAuto
                  ? 'bg-blue-50 text-blue-600 border-blue-200/50 cursor-default'
                  : isAuto
                  ? 'bg-gray-50 border-gray-200/50 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-200 text-blue-600 hover:bg-blue-50/50 active:scale-[0.98]'
              }`}
            >
              {pumpMutation.isPending && pumpMutation.variables === true ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  <span>Pump ON</span>
                </>
              )}
            </button>

            <button
              onClick={() => handlePumpToggle(false)}
              disabled={isAuto || !pump || isPending}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all border ${
                !pump && !isAuto
                  ? 'bg-gray-50 text-gray-400 border-gray-200/50 cursor-default'
                  : isAuto
                  ? 'bg-gray-50 border-gray-200/50 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-200 text-red-600 hover:bg-red-50/50 active:scale-[0.98]'
              }`}
            >
              {pumpMutation.isPending && pumpMutation.variables === false ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  <span>Pump OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reset Alerts */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Diagnostics & Safety Reset
          </label>
          <button
            onClick={handleResetAlerts}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 active:scale-[0.98]"
          >
            {resetMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Reset Sump Alerts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Footer Info */}
      <div className="flex items-center gap-1.5 mt-6 pt-3 border-t border-gray-100 text-[9px] text-gray-400 font-bold uppercase select-none">
        <Cpu className="w-3 h-3 text-gray-300" />
        <span>Hardware Sync: Non-blocking Queue</span>
      </div>
    </div>
  );
}
