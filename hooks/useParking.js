import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../lib/api';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => apiService.getZones(),
  });
}

export function useSlots(zoneId) {
  return useQuery({
    queryKey: ['slots', zoneId],
    queryFn: () => apiService.getSlots(zoneId),
    refetchInterval: 3000,
  })
};


export function useStatistics(zoneId) {
  return useQuery({
    queryKey: ['statistics', zoneId],
    queryFn: async () => {
      const response = await apiService.getStatistics(zoneId);
      return response;
    },
    keepPreviousData: true, 
  });
}

export function useActiveSession(userId) {
  return useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => apiService.getActiveSession(userId),
  });
}

export function useReserveSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.reserveSlot(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.refetchQueries({ queryKey: ['slots'] });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.postSessionActive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.endSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useTrafficFlow(filters) {
  return useQuery({
    queryKey: ['trafficFlow', filters],
    queryFn: () => apiService.getTrafficFlow(filters),
    enabled: !!filters,
  });
}

export function useRecentActivity(filters = {}) {
  return useQuery({
    queryKey: ['recentActivity', filters],
    queryFn: () => apiService.getRecentActivity(filters),
    refetchInterval: 5000,
  });
}

export function useSessionHistory(filters = {}) {
  return useQuery({
    queryKey: ['sessionHistory', filters],
    queryFn: () => apiService.getSessionHistory(filters),
  });
}