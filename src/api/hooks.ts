import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './endpoints';
import type { CreateRequestInput, CreateRevisionInput, PublishRevisionInput } from './types';

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

export function useDownloadRevision(requestId: string | undefined) {
  const api = useApi();
  return useMutation({
    mutationFn: (revisionId: string) => api.getRevisionDownloadUrl(requestId!, revisionId),
  });
}

export function useRevisions(requestId: string | undefined, enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ['revisions', requestId],
    queryFn: () => api.listRevisions(requestId!),
    enabled: !!requestId && enabled,
  });
}

export function useCreateRevision(requestId: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRevisionInput) => api.createRevision(requestId!, input),
    onSuccess: (revision) => {
      queryClient.setQueryData(['revision', requestId, revision.revision_id], revision);
      queryClient.invalidateQueries({ queryKey: ['revisions', requestId] });
    },
  });
}

export function useRevisionStatus(
  requestId: string | undefined,
  revisionId: string | undefined,
  enabled = true,
) {
  const api = useApi();
  return useQuery({
    queryKey: ['revision', requestId, revisionId],
    queryFn: () => api.getRevision(requestId!, revisionId!),
    enabled: !!requestId && !!revisionId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return !status || status === 'QUEUED' || status === 'PROCESSING' ? 2500 : false;
    },
    refetchIntervalInBackground: true,
  });
}

export function useRevisionPreviewUrl(
  requestId: string | undefined,
  revisionId: string | undefined,
  enabled = true,
) {
  const api = useApi();
  return useQuery({
    queryKey: ['revision-preview', requestId, revisionId],
    queryFn: () => api.getRevisionPreviewUrl(requestId!, revisionId!),
    enabled: !!requestId && !!revisionId && enabled,
    retry: 1,
  });
}

export function useHosting(requestId: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ['hosting', requestId],
    queryFn: () => api.getHosting(requestId!),
    enabled: !!requestId,
    refetchInterval: (query) =>
      query.state.data?.hosting_status === 'PUBLISHING' ? 2500 : false,
    refetchIntervalInBackground: true,
  });
}

export function usePublishRevision(requestId: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      revisionId,
      input,
    }: {
      revisionId: string;
      input: PublishRevisionInput;
    }) => api.publishRevision(requestId!, revisionId, input),
    onSuccess: (hosting) => {
      queryClient.setQueryData(['hosting', requestId], hosting);
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
    },
  });
}
