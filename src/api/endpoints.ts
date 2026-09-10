import { useApiClient } from './client';
import type {
  CreateRequestInput,
  CreateRequestResponse,
  CurrentUserResponse,
  PreviewUrlsResponse,
  RequestState,
  RequestListResponse,
  VariantSelectionResponse,
  UserInitializationResponse,
  CreateRevisionInput,
  LandingPageRevision,
  RevisionListResponse,
  RevisionDownloadUrlResponse,
  RevisionPreviewUrlResponse,
  LandingPageHostingResponse,
  PublishRevisionInput,
} from './types';

export function useApi() {
  const { authorizedFetch } = useApiClient();

  return {
    initializeCurrentUser: () =>
      authorizedFetch<UserInitializationResponse>('/api/v1/users/me/initialize', {
        method: 'POST',
      }),

    getCurrentUser: () =>
      authorizedFetch<CurrentUserResponse>('/api/v1/users', { method: 'GET' }),

    createRequest: (input: CreateRequestInput) =>
      authorizedFetch<CreateRequestResponse>('/api/v1/requests', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    listRequests: () =>
      authorizedFetch<RequestListResponse>('/api/v1/requests', { method: 'GET' }),

    getRequest: (requestId: string) =>
      authorizedFetch<RequestState>(`/api/v1/requests/${requestId}`, { method: 'GET' }),

    getPreviewUrls: (requestId: string) =>
      authorizedFetch<PreviewUrlsResponse>(`/api/v1/requests/${requestId}/preview-urls`, {
        method: 'GET',
      }),

    getVariantSelection: (requestId: string) =>
      authorizedFetch<VariantSelectionResponse>(
        `/api/v1/requests/${requestId}/variant-selection`,
        { method: 'GET' },
      ),

    saveVariantSelection: (requestId: string, selectedVariant: 'A' | 'B') =>
      authorizedFetch<VariantSelectionResponse>(
        `/api/v1/requests/${requestId}/variant-selection`,
        {
          method: 'POST',
          body: JSON.stringify({ selected_variant: selectedVariant }),
        },
      ),

    createRevision: (requestId: string, input: CreateRevisionInput) =>
      authorizedFetch<LandingPageRevision>(`/api/v1/requests/${requestId}/revisions`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    listRevisions: (requestId: string) =>
      authorizedFetch<RevisionListResponse>(`/api/v1/requests/${requestId}/revisions`, {
        method: 'GET',
      }),

    getRevision: (requestId: string, revisionId: string) =>
      authorizedFetch<LandingPageRevision>(
        `/api/v1/requests/${requestId}/revisions/${revisionId}`,
        { method: 'GET' },
      ),

    getRevisionPreviewUrl: (requestId: string, revisionId: string) =>
      authorizedFetch<RevisionPreviewUrlResponse>(
        `/api/v1/requests/${requestId}/revisions/${revisionId}/preview-url`,
        { method: 'GET' },
      ),

    getRevisionDownloadUrl: (requestId: string, revisionId: string) =>
      authorizedFetch<RevisionDownloadUrlResponse>(
        `/api/v1/requests/${requestId}/revisions/${revisionId}/download`,
        { method: 'GET' },
      ),

    getHosting: (requestId: string) =>
      authorizedFetch<LandingPageHostingResponse>(
        `/api/v1/requests/${requestId}/hosting`,
        { method: 'GET' },
      ),

    unpublish: (requestId: string) =>
      authorizedFetch<LandingPageHostingResponse>(
        `/api/v1/requests/${requestId}/hosting`,
        { method: 'DELETE' },
      ),

    publishRevision: (
      requestId: string,
      revisionId: string,
      input: PublishRevisionInput,
    ) =>
      authorizedFetch<LandingPageHostingResponse>(
        `/api/v1/requests/${requestId}/revisions/${revisionId}/publish`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      ),
  };
}
