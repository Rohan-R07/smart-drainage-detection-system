'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity } from 'lucide-react';
import { TelemetryState } from '../types';

interface DrainageVisualizationProps {
  latestState: TelemetryState;
  connected: boolean;
}

export default function DrainageVisualization({ latestState, connected }: DrainageVisualizationProps) {
  const { waterLevel, waterDetected, distance, status, pumpRunning: pump, relay } = latestState;

  // Calculate the height of water inside the SVG tank
  const maxWaterHeight = 160; // Max height of water inside the 200px tall tank
  const waterHeight = (waterLevel / 100) * maxWaterHeight;
  const waterY = 230 - waterHeight; // Tank bottom is at y=230

  // Determine pipe status colors
  const isBlocked = status === 'BLOCKED';
  
  let pipeStroke = 'stroke-gray-300';
  if (isBlocked) {
    pipeStroke = 'stroke-red-500 blockage-glow';
  } else if (pump) {
    pipeStroke = 'stroke-blue-400';
  } else if (relay) {
    pipeStroke = 'stroke-blue-300';
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">System Flow Visualization</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isBlocked && (
            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full animate-bounce">
              <ShieldAlert className="w-3.5 h-3.5" />
              BLOCKAGE DETECTED
            </span>
          )}
          {pump && (
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
              PUMP DISCHARGING
            </span>
          )}
        </div>
      </div>

      {/* SVG centerpiece container */}
      <div className="flex-1 flex items-center justify-center min-h-[260px] bg-gray-50/50 rounded-xl border border-gray-100 p-4 overflow-hidden">
        <svg viewBox="0 0 800 280" className="w-full max-w-3xl h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Gradients */}
          <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="tankBgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* DRAIN PIPE SYSTEM (BACKGROUND) */}
          {/* Main pipe path: Starts at bottom-right of tank, goes right, hits pump, goes down, goes right to outlet */}
          <path
            d="M 180 210 H 350 V 250 H 680"
            fill="none"
            className={`${pipeStroke} transition-all duration-500`}
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Inner pipe hollow core */}
          <path
            d="M 180 210 H 350 V 250 H 680"
            fill="none"
            stroke="#f9fafb"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ACTIVE WATER FLOW IN PIPES */}
          {connected && (pump || relay) && !isBlocked && (
            <path
              d="M 180 210 H 350 V 250 H 680"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={pump ? 'pipe-flow-fast' : 'pipe-flow'}
            />
          )}

          {/* BLOCKAGE GLOW OVERLAY */}
          {isBlocked && (
            <path
              d="M 390 250 H 520"
              fill="none"
              stroke="#ef4444"
              strokeWidth="16"
              strokeLinecap="round"
              filter="url(#glow)"
              className="blockage-glow opacity-80"
            />
          )}

          {/* WATER TANK STRUCTURE */}
          {/* Tank Base */}
          <rect x="40" y="50" width="140" height="190" rx="8" fill="url(#tankBgGrad)" stroke="#d1d5db" strokeWidth="3" />
          {/* Tank Labels */}
          <text x="110" y="40" textAnchor="middle" className="fill-gray-400 font-bold text-[10px] tracking-widest">DRAINAGE SUMP TANK</text>
          
          {/* Level Markers */}
          <line x1="180" y1="70" x2="170" y2="70" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="162" y="73" textAnchor="end" className="fill-gray-400 text-[8px] font-semibold">100%</text>
          
          <line x1="180" y1="110" x2="170" y2="110" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="162" y="113" textAnchor="end" className="fill-gray-400 text-[8px] font-semibold">75%</text>

          <line x1="180" y1="150" x2="170" y2="150" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="162" y="153" textAnchor="end" className="fill-gray-400 text-[8px] font-semibold">50%</text>

          <line x1="180" y1="190" x2="170" y2="190" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="162" y="193" textAnchor="end" className="fill-gray-400 text-[8px] font-semibold">25%</text>

          {/* ACTIVE WATER LEVEL VOLUME */}
          {connected && waterLevel > 0 && (
            <g>
              {/* Clipped water rect to keep corners tidy */}
              <clipPath id="tankWaterClip">
                <rect x="42.5" y="52.5" width="135" height="185" rx="6" />
              </clipPath>
              <g clipPath="url(#tankWaterClip)">
                {/* Water Sump Liquid */}
                <motion.rect
                  x="42.5"
                  y={waterY}
                  width="135"
                  height={waterHeight}
                  fill="url(#waterGradient)"
                  animate={{ y: waterY, height: waterHeight }}
                  transition={{ type: 'spring', damping: 15 }}
                />
                
                {/* Sloshing Wave Shape Overlay */}
                <motion.path
                  d="M0 0 Q 30 -5, 60 0 T 120 0 T 180 0 V 40 H 0 Z"
                  fill="#60a5fa"
                  opacity="0.3"
                  className="wave-animation"
                  style={{
                    originX: 0.5,
                    originY: 0.5,
                    x: 42.5,
                    y: waterY - 5,
                  }}
                />
              </g>
            </g>
          )}

          {/* ULTRASONIC SENSOR AT TANK CEILING */}
          <rect x="80" y="51" width="60" height="12" rx="2" fill="#374151" />
          <circle cx="95" cy="65" r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />
          <circle cx="125" cy="65" r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />
          <text x="110" y="47" textAnchor="middle" className="fill-gray-500 font-bold text-[8px]">HC-SR04</text>

          {/* WATER FLOW EXIT AT PIPE END */}
          {connected && (pump || relay) && !isBlocked && (
            <g transform="translate(680, 250)">
              {/* Droplets of water shooting out */}
              <motion.circle
                cx="15" cy="0" r="3" fill="#3b82f6"
                animate={{ cx: [15, 45], cy: [0, 25], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeOut" }}
              />
              <motion.circle
                cx="20" cy="5" r="2.5" fill="#60a5fa"
                animate={{ cx: [20, 55], cy: [5, 40], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "easeOut", delay: 0.2 }}
              />
              <motion.circle
                cx="12" cy="-5" r="3.5" fill="#2563eb"
                animate={{ cx: [12, 50], cy: [-5, 15], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeOut", delay: 0.4 }}
              />
            </g>
          )}

          {/* PUMP MODULE */}
          <g transform="translate(350, 210)">
            {/* Pump Housing */}
            <circle cx="0" cy="0" r="28" fill="#ffffff" stroke={pump ? '#3b82f6' : '#9ca3af'} strokeWidth="4" />
            <circle cx="0" cy="0" r="24" fill="#f3f4f6" />
            
            {/* Rotating Pump Blades */}
            <motion.g
              animate={connected && pump ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <line x1="-18" y1="0" x2="18" y2="0" stroke={pump ? '#2563eb' : '#6b7280'} strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke={pump ? '#2563eb' : '#6b7280'} strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="0" r="6" fill="#374151" />
            </motion.g>
            <text x="0" y="38" textAnchor="middle" className="fill-gray-600 font-bold text-[9px] tracking-wide">PUMP</text>
          </g>

          {/* OUTLET VALVE / FLANGE */}
          <rect x="670" y="235" width="10" height="30" rx="2" fill="#4b5563" />
          <text x="675" y="227" textAnchor="middle" className="fill-gray-500 font-bold text-[9px]">OUTLET</text>

          {/* SENSOR READING HUD */}
          {connected ? (
            <g transform="translate(260, 50)">
              <rect x="0" y="0" width="180" height="60" rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
              
              <text x="12" y="18" className="fill-gray-400 font-semibold text-[8px] tracking-wider">LIVE SENSOR SUMMARY</text>
              
              <text x="12" y="34" className="fill-gray-800 font-bold text-[11px]">Water Sump Level: {waterLevel}%</text>
              <text x="12" y="48" className="fill-gray-800 font-bold text-[11px]">Distance Head: {distance.toFixed(1)} m</text>
              
              <circle cx="160" cy="36" r="6" fill={waterDetected ? '#ef4444' : '#10b981'} />
              <text x="160" y="49" textAnchor="middle" className="fill-gray-500 text-[6px] font-bold">WET</text>
            </g>
          ) : (
            <g transform="translate(260, 50)">
              <rect x="0" y="0" width="180" height="60" rx="8" fill="#fef2f2" stroke="#fee2e2" strokeWidth="1.5" />
              <text x="90" y="28" textAnchor="middle" className="fill-red-500 font-bold text-[10px] tracking-wide">ARDUINO OFFLINE</text>
              <text x="90" y="42" textAnchor="middle" className="fill-red-400 text-[8px] font-semibold">Verify Serial Cable / Port Connection</text>
            </g>
          )}
        </svg>
      </div>

      {/* Quick Visual Glossary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
          <span>Sump Saturated Water</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-3.5 h-3.5 border-t border-b border-gray-300 bg-white" />
          <span>PVC Drain Pipeline</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center font-bold text-[8px] text-gray-500">P</div>
          <span>Centrifugal Pump</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-3.5 h-3.5 bg-red-500 rounded-sm animate-pulse" />
          <span>Pipe Blockage Active</span>
        </div>
      </div>
    </div>
  );
}
