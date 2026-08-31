import { useEffect, useRef, useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { useApi } from '@/api/endpoints';
import { useAuth } from '@/lib/auth-context';

export default function SignupComplete() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const api = useApi();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded || !isSignedIn || started.current) return;
    started.current = true;

    void api
      .initializeCurrentUser()
      .then(() => clerk.signOut({ redirectUrl: '/login?signup=complete' }))
      .catch((initializationError: unknown) => {
        setError(
          initializationError instanceof Error
            ? initializationError.message
            : '회원 정보를 초기화하지 못했습니다.',
        );
      });
  }, [api, clerk, isLoaded, isSignedIn]);

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center px-4 text-center">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-slate-950">회원가입 마무리에 실패했어요</h1>
            <p className="mt-3 text-sm leading-6 text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-emerald-600" size={28} />
            <h1 className="mt-5 text-xl font-semibold text-slate-950">회원가입을 마무리하고 있어요</h1>
            <p className="mt-2 text-sm text-slate-500">완료되면 로그인 화면으로 이동합니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
