import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './endpoints';
import type { CreateRequestInput } from './types';

export function useCreateRequest() {
  const api = useApi();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.createRequest(input),
  });
}

export function useRequestHistory() {
  const api = useApi();
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => api.listRequests(),
  });
}

export function useCurrentUser() {
  const api = useApi();
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.getCurrentUser(),
  });
}

export function useRequestStatus(requestId: string | undefined, enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: () => api.getRequest(requestId!),
    enabled: !!requestId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2500;
      return data.status === 'PROCESSING' ? 2500 : false;
    },
    refetchIntervalInBackground: true,
  });
}

export function usePreviewUrls(requestId: string | undefined, enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ['preview-urls', requestId],
    queryFn: () => api.getPreviewUrls(requestId!),
    enabled: !!requestId && enabled,
    retry: 1,
  });
}

export function useVariantSelection(requestId: string | undefined, enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ['variant-selection', requestId],
    queryFn: () => api.getVariantSelection(requestId!),
    enabled: !!requestId && enabled,
  });
}

export function useSaveVariantSelection(requestId: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variant: 'A' | 'B') => api.saveVariantSelection(requestId!, variant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variant-selection', requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
    },
  });
}
