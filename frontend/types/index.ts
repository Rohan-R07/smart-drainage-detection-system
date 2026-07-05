export interface TelemetryState {
  timestamp: string;
  waterDetected: boolean;
  waterSensor: number;
  distance: number;
  waterLevel: number;
  status: 'NORMAL' | 'WARNING' | 'CHECKING' | 'BLOCKED';
  pumpRunning: boolean;
  relay: boolean;
}

export interface ConnectionHealth {
  connected: boolean;
  port: string;
  baud_rate: number;
  packets_received: number;
  packets_dropped: number;
  malformed_packets: number;
  reconnect_attempts: number;
  last_packet_received: string | null;
  last_successful_command: string | null;
  last_command_status: 'NONE' | 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface SystemEvent {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface DashboardPayload {
  latest_state: TelemetryState;
  connection_health?: ConnectionHealth;
  connection?: ConnectionHealth;
  history: TelemetryState[];
  events: SystemEvent[];
}
