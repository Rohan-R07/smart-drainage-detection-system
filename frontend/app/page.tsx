'use client';

import React, { useState, useEffect } from 'react';
import { DashboardPayload } from '../types';

export default function DebugDashboard() {
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

      // Update the UI immediately by triggering a state fetch
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
        Loading telemetry from Flask backend...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
        <h3>Error Connecting to Backend</h3>
        <p>{error}</p>
        <p>Ensure Flask server is running at http://127.0.0.1:5000</p>
      </div>
    );
  }

  const latestState = data?.latest_state;
  const connectionHealth = data?.connection || data?.connection_health;
  const historyCount = data?.history?.length || 0;
  const eventsCount = data?.events?.length || 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
      <h1>Smart Drainage Debug Sump</h1>
      <p style={{ color: '#666' }}>Polling http://127.0.0.1:5000/api/status every 1s (No Socket.IO, No Framer Motion)</p>

      {error && (
        <div style={{ color: 'orange', border: '1px solid orange', padding: '10px', marginBottom: '20px' }}>
          Warning: Last poll failed - {error}
        </div>
      )}

      {actionError && (
        <div style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '20px' }}>
          Pump Action Error: {actionError}
        </div>
      )}

      <hr />

      <h2>Connection</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', borderColor: '#ddd' }}>
        <tbody>
          <tr>
            <td style={{ width: '40%' }}><strong>Connected:</strong></td>
            <td>{connectionHealth?.connected ? 'true' : 'false'}</td>
          </tr>
          <tr>
            <td><strong>Port:</strong></td>
            <td>{connectionHealth?.port}</td>
          </tr>
          <tr>
            <td><strong>Packets Received:</strong></td>
            <td>{connectionHealth?.packets_received}</td>
          </tr>
        </tbody>
      </table>

      <h2>Pump Control</h2>
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
          <strong>Pump Status:</strong>{' '}
          {latestState?.pumpRunning ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>🟢 Running</span>
          ) : (
            <span style={{ color: 'gray', fontWeight: 'bold' }}>⚪ Stopped</span>
          )}
        </p>
        
        {latestState?.pumpRunning ? (
          <button
            onClick={() => handlePumpControl('PUMP_OFF')}
            disabled={!connectionHealth?.connected}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: connectionHealth?.connected ? 'pointer' : 'not-allowed',
              opacity: connectionHealth?.connected ? 1 : 0.5,
              borderRadius: '4px',
            }}
          >
            STOP PUMP
          </button>
        ) : (
          <button
            onClick={() => handlePumpControl('PUMP_ON')}
            disabled={!connectionHealth?.connected}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: connectionHealth?.connected ? 'pointer' : 'not-allowed',
              opacity: connectionHealth?.connected ? 1 : 0.5,
              borderRadius: '4px',
            }}
          >
            START PUMP
          </button>
        )}
      </div>

      <h2>Latest State</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', borderColor: '#ddd' }}>
        <tbody>
          <tr>
            <td style={{ width: '40%' }}><strong>Water Detected:</strong></td>
            <td>{latestState?.waterDetected ? 'true' : 'false'}</td>
          </tr>
          <tr>
            <td><strong>Water Sensor Value:</strong></td>
            <td>{latestState?.waterSensor}</td>
          </tr>
          <tr>
            <td><strong>Distance:</strong></td>
            <td>{latestState?.distance}</td>
          </tr>
          <tr>
            <td><strong>Water Level:</strong></td>
            <td>{latestState?.waterLevel}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>{latestState?.status}</td>
          </tr>
          <tr>
            <td><strong>Pump Running:</strong></td>
            <td>{latestState?.pumpRunning ? 'true' : 'false'}</td>
          </tr>
          <tr>
            <td><strong>Relay:</strong></td>
            <td>{latestState?.relay ? 'true' : 'false'}</td>
          </tr>
          <tr>
            <td><strong>Timestamp:</strong></td>
            <td>{latestState?.timestamp}</td>
          </tr>
        </tbody>
      </table>

      <h2>Collections Count</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', borderColor: '#ddd' }}>
        <tbody>
          <tr>
            <td style={{ width: '40%' }}><strong>History Count:</strong></td>
            <td>{historyCount}</td>
          </tr>
          <tr>
            <td><strong>Events Count:</strong></td>
            <td>{eventsCount}</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Complete Raw JSON Response</h2>
      <pre style={{ background: '#eee', padding: '15px', borderRadius: '5px', overflowX: 'auto', fontSize: '11px', lineHeight: '1.4' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
