'use client';

import React from 'react';
import { TelemetryState } from '../types';
import {
  Settings,
  ShieldCheck,
  ShieldAlert,
  Droplet,
  Ruler,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface StatusPanelProps {
  latestState: TelemetryState;
  connected: boolean;
}

export default function StatusPanel({ latestState, connected }: StatusPanelProps) {
  const { waterDetected, waterLevel, distance, status, pumpRunning: pump, relay } = latestState;
  const mode = 'MANUAL';

  // Status Badge configurations
  const getSystemStatusHeader = () => {
    if (!connected) {
      return {
        label: 'OFFLINE',
        colorClass: 'bg-gray-100 text-gray-600 border-gray-200',
        desc: 'Establishing connection to serial port...',
        icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
      };
    }
    switch (status.toUpperCase()) {
      case 'NORMAL':
        return {
          label: 'SYSTEM HEALTHY',
          colorClass: 'bg-green-50 text-green-700 border-green-200/60',
          desc: 'All parameters normal. Sump tank clear.',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        };
      case 'WARNING':
        return {
          label: 'ALERT ACTIVE',
          colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200/60',
          desc: 'Water level has exceeded warning threshold.',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        };
      case 'CHECKING':
        return {
          label: 'SCANNING',
          colorClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
          desc: 'Performing diagnostic verification checks...',
          icon: <Settings className="w-5 h-5 text-blue-600 animate-spin" />,
        };
      case 'BLOCKED':
        return {
          label: 'CRITICAL BLOCKAGE',
          colorClass: 'bg-red-50 text-red-700 border-red-200/60 animate-pulse',
          desc: 'Drain blockage detected. Discharge pipeline restricted.',
          icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
        };
      default:
        return {
          label: 'CHECKING',
          colorClass: 'bg-gray-50 text-gray-600 border-gray-200',
          desc: 'Reading parameters...',
          icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
        };
    }
  };

  const headerStatus = getSystemStatusHeader();

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Big System State Card */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${headerStatus.colorClass}`}>
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-black/5">
            {headerStatus.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                SYSTEM CONDITION
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-black/5">
                {mode} MODE
              </span>
            </div>
            <h3 className="text-xl font-black mt-1 tracking-tight">
              {headerStatus.label}
            </h3>
            <p className="text-xs mt-1 font-medium opacity-80">
              {headerStatus.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 2x3 Grid of parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
        {/* Pump Status Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Centrifugal Pump
            </span>
            <Settings
              className={`w-4 h-4 text-gray-400 ${
                connected && pump ? 'text-blue-500 animate-spin' : ''
              }`}
              style={{ animationDuration: '3s' }}
            />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-800 tracking-tight">
              {connected && pump ? 'RUNNING' : 'IDLE'}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected && pump ? 'bg-blue-500 animate-ping' : 'bg-gray-300'
                }`}
              />
              <span className="text-[10px] text-gray-500 font-semibold uppercase">
                {connected && pump ? 'Discharging Sump' : 'Pump Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Solar Relay Status */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Solar Pump Relay
            </span>
            <Sliders className={`w-4 h-4 ${connected && relay ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-800 tracking-tight">
              {connected && relay ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1.5">
              {connected && relay ? 'Circuit Loop Closed' : 'Circuit Loop Open'}
            </p>
          </div>
        </div>

        {/* Blockage Status Card */}
        <div
          className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all duration-300 ${
            connected && status === 'BLOCKED'
              ? 'bg-red-50/50 border-red-200 animate-pulse'
              : 'bg-white border-gray-200/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Pipeline Blockage
            </span>
            {connected && status === 'BLOCKED' ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black tracking-tight ${
                connected && status === 'BLOCKED' ? 'text-red-700' : 'text-gray-800'
              }`}
            >
              {connected && status === 'BLOCKED' ? 'BLOCKED' : 'CLEAR'}
            </span>
            <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1.5">
              {connected && status === 'BLOCKED' ? 'Pipe Flow Restricted' : 'Pipe Flow Unrestricted'}
            </p>
          </div>
        </div>

        {/* Water Detection Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Sump Saturation
            </span>
            <Droplet
              className={`w-4 h-4 ${
                connected && waterDetected ? 'text-red-500 fill-red-500/20' : 'text-gray-400'
              }`}
            />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-800 tracking-tight">
              {connected && waterDetected ? 'WET' : 'DRY'}
            </span>
            <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1.5">
              {connected && waterDetected ? 'Sensor Water Detected' : 'No Water Contacted'}
            </p>
          </div>
        </div>

        {/* Distance Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Ultrasound Distance
            </span>
            <Ruler className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-gray-800 tracking-tight">
                {connected ? distance.toFixed(2) : '--'}
              </span>
              <span className="text-xs text-gray-500 font-bold ml-1">meters</span>
            </div>
            <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1.5">
              HC-SR04 Transducer Readout
            </p>
          </div>
        </div>

        {/* Water Level Percentage with Mini Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
              Sump Fill Capacity
            </span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-black text-gray-800 tracking-tight">
                {connected ? waterLevel : '--'}%
              </span>
              <span className="text-[9px] text-gray-400 font-bold">MAX CAPACITY</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/20">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  waterLevel <= 60
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : waterLevel <= 80
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: connected ? `${waterLevel}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
