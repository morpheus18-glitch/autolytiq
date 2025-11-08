import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface WidgetConfig {
  id: string;
  key: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: any;
}

interface DashboardLayout {
  columns: number;
  widgets: WidgetConfig[];
}

async function apiRequest(method: string, path: string, body?: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export function useDashboardLayout(role: string) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-layout', role],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/dashboard/layout?role=${role}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (layout: DashboardLayout) => {
      return apiRequest('PUT', '/api/dashboard/layout', { role, layout });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout', role] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/dashboard/layout?role=${role}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout', role] });
    },
  });

  return {
    layout: (data?.layout || { columns: 4, widgets: [] }) as DashboardLayout,
    isDefault: data?.isDefault ?? true,
    isLoading,
    error,
    updateLayout: updateMutation.mutate,
    resetLayout: resetMutation.mutate,
    isEditing,
    setIsEditing,
  };
}
