'use client';

import React, { useState, useEffect } from 'react';
import { DashboardPayload } from '../types';

export default function TerminalDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
    const interval = setInterval(fetchData, 1000); // Poll every 1 second

    return () => clearInterval(interval);
  }, []);

  const handlePumpControl = async (cmd: 'PUMP_ON' | 'PUMP_OFF') => {
    try {
      setActionError(null);
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

      // Update UI immediately by triggering telemetry fetch
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px', background: '#09090b', color: '#a1a1aa', minHeight: '100-screen' }}>
        Loading telemetry from Flask backend...
      </div>
    );
  }

  const latestState = data?.latest_state;
  const connectionHealth = data?.connection || data?.connection_health;
  const events = data?.events || [];

  // 1. Water Level calculations
  const waterLevel = latestState?.waterLevel ?? 0;
  const totalBlocks = 22;
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((waterLevel / 100) * totalBlocks)));
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  // 2. Status logic mapping
  const getStatusDisplay = (status: string | undefined) => {
    const s = String(status || '').toUpperCase();
    if (s === 'BLOCKED') {
      return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Blocked</span>;
    } else if (s === 'WARNING') {
      return <span style={{ color: '#eab308', fontWeight: 'bold' }}>🟡 Warning</span>;
    } else if (s === 'CHECKING') {
      return <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Checking</span>;
    }
    return <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🟢 Normal</span>;
  };

  // 3. Water Present mapping
  const isWaterPresent = latestState?.waterDetected ?? false;
  const waterPresenceDisplay = isWaterPresent ? (
    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>💧 Water Present</span>
  ) : (
    <span style={{ color: '#71717a' }}>❌ Dry</span>
  );

  // 4. Drainage Condition Display
  const isBlocked = latestState?.status === 'BLOCKED';
  const conditionDisplay = isBlocked ? (
    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Blockage Identified</span>
  ) : (
    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🟢 Clear</span>
  );

  // 5. Events list
  const recentEvents = events.slice(0, 5).map((evt, idx) => (
    <div key={idx} style={{ margin: '4px 0', color: '#e4e4e7' }}>
      • {evt.message}
    </div>
  ));

  return (
    <div style={{
      background: '#09090b',
      color: '#f4f4f5',
      fontFamily: 'monospace',
      minHeight: '100vh',
      padding: '40px 20px',
      fontSize: '14px',
      lineHeight: '1.6'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid #27272a', padding: '25px', borderRadius: '4px', background: '#18181b' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div>-------------------------------------------------------</div>
          <div style={{ fontWeight: 'bold', letterSpacing: '1px' }}>SMART DRAINAGE MONITORING SYSTEM</div>
          <div>-------------------------------------------------------</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {connectionHealth?.connected ? (
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🟢 Connected</span>
          ) : (
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Disconnected</span>
          )}
        </div>

        {error && (
          <div style={{ color: '#eab308', border: '1px solid #eab308', padding: '8px', marginBottom: '20px' }}>
            Warning: Lost connection to API gateway.
          </div>
        )}

        {actionError && (
          <div style={{ color: '#ef4444', border: '1px solid #ef4444', padding: '8px', marginBottom: '20px' }}>
            Action Failed: {actionError}
          </div>
        )}

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>Water Level</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0', paddingLeft: '8px' }}>
            {waterLevel} %
          </div>
          <div style={{ letterSpacing: '2px', fontSize: '16px', color: '#3b82f6' }}>
            {progressBar}
          </div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>System Status</div>
          <div>{getStatusDisplay(latestState?.status)}</div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>Water Detection</div>
          <div>{waterPresenceDisplay}</div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>Current Distance</div>
          <div style={{ fontWeight: 'bold' }}>{(latestState?.distance ?? 0).toFixed(1)} cm</div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>Drainage Condition</div>
          <div>{conditionDisplay}</div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>Pump</div>
          <div style={{ margin: '8px 0', fontSize: '16px' }}>
            {latestState?.pumpRunning ? (
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🟢 ON</span>
            ) : (
              <span style={{ color: '#71717a' }}>⚪ OFF</span>
            )}
          </div>
          
          <div style={{ marginTop: '15px' }}>
            {latestState?.pumpRunning ? (
              <button
                onClick={() => handlePumpControl('PUMP_OFF')}
                disabled={!connectionHealth?.connected}
                style={{
                  background: 'none',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 16px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: connectionHealth?.connected ? 'pointer' : 'not-allowed',
                  opacity: connectionHealth?.connected ? 1 : 0.5,
                  borderRadius: '3px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { if (connectionHealth?.connected) { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#ef4444'; }}
              >
                [ STOP PUMP ]
              </button>
            ) : (
              <button
                onClick={() => handlePumpControl('PUMP_ON')}
                disabled={!connectionHealth?.connected}
                style={{
                  background: 'none',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  padding: '8px 16px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: connectionHealth?.connected ? 'pointer' : 'not-allowed',
                  opacity: connectionHealth?.connected ? 1 : 0.5,
                  borderRadius: '3px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { if (connectionHealth?.connected) { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#22c55e'; }}
              >
                [ START PUMP ]
              </button>
            )}
          </div>
        </div>

        <div>────────────────────────────────────────────</div>

        <div style={{ margin: '15px 0' }}>
          <div style={{ color: '#a1a1aa', marginBottom: '8px' }}>Recent Events</div>
          {recentEvents.length > 0 ? recentEvents : <div style={{ color: '#71717a' }}>• No events logged yet</div>}
        </div>

      </div>
    </div>
  );
}
