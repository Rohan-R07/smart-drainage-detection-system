import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardPayload } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchInitialStatus = async (): Promise<DashboardPayload> => {
  const response = await fetch(`${API_BASE}/api/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch initial status');
  }
  return response.json();
};

export const useInitialStatus = () => {
  return useQuery<DashboardPayload>({
    queryKey: ['systemStatus'],
    queryFn: fetchInitialStatus,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });
};

export const usePumpControl = () => {
  return useMutation({
    mutationFn: async (pump: boolean) => {
      const response = await fetch(`${API_BASE}/api/pump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pump }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to control pump');
      }
      return response.json();
    },
  });
};

export const useModeControl = () => {
  return useMutation({
    mutationFn: async (mode: 'AUTO' | 'MANUAL') => {
      const response = await fetch(`${API_BASE}/api/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update system mode');
      }
      return response.json();
    },
  });
};

export const useResetAlerts = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to reset system alerts');
      }
      return response.json();
    },
  });
};
