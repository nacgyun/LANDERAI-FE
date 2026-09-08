import { useAuth } from '@/lib/auth-context';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://nlhgsrcti7.execute-api.ap-northeast-2.amazonaws.com';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function humanizeError(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return '인증이 만료되었어요. 다시 로그인해 주세요.';
    case 403:
      return '이 작업을 수행할 권한이 없어요.';
    case 404:
      return '요청한 정보를 찾을 수 없어요.';
    case 409:
      return '아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.';
    case 422:
      return '입력값을 다시 확인해 주세요.';
    case 500:
    case 502:
    case 503:
      return '서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.';
    default:
      return fallback || `요청에 실패했어요 (오류 ${status}).`;
  }
}

export function useApiClient() {
  const { getToken } = useAuth();

  async function authorizedFetch<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    } catch {
      throw new ApiError(0, '네트워크 연결을 확인해 주세요.');
    }

    if (!response.ok) {
      let serverMessage = '';
      try {
        const data = await response.json();
        const detail = data?.detail;
        serverMessage =
          (typeof detail === 'string' ? detail : detail?.message) ||
          data?.message ||
          data?.error_message ||
          data?.error ||
          '';
      } catch {
        // ignore parse errors
      }
      throw new ApiError(response.status, humanizeError(response.status, serverMessage));
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  return { authorizedFetch };
}
