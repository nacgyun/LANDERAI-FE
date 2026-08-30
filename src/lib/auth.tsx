import {
  ClerkProvider,
  useAuth as useClerkAuth,
  UserButton as ClerkUserButton,
  SignIn as ClerkSignIn,
} from '@clerk/clerk-react';
import {
  useMemo,
  type ReactNode,
} from 'react';
import { CLERK_JWT_TEMPLATE, CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './auth-config';
import { AuthContext, type AuthContextValue } from './auth-context';

function MockAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded: true,
      // Local development can preview protected screens without Clerk. A
      // production build must fail closed if its publishable key is missing.
      isSignedIn: import.meta.env.DEV,
      getToken: async () => null,
    }),
    [],
  );
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const clerk = useClerkAuth();
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded: clerk.isLoaded,
      isSignedIn: !!clerk.isSignedIn,
      getToken: () =>
        clerk.getToken(CLERK_JWT_TEMPLATE ? { template: CLERK_JWT_TEMPLATE } : undefined),
    }),
    [clerk],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/login"
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function UserButton() {
  if (!isClerkConfigured()) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
        U
      </div>
    );
  }
  return <ClerkUserButton afterSignOutUrl="/login" />;
}

export function SignIn() {
  if (!isClerkConfigured()) {
    return (
      <div className="space-y-3 text-sm text-slate-600">
        <p>
          Clerk 키가 설정되지 않았어요. <code>.env</code>의{' '}
          <code>VITE_CLERK_PUBLISHABLE_KEY</code>에 실제 키를 입력하면 로그인 UI가
          표시돼요.
        </p>
        <p>지금은 미리보기 모드라서 로그인 없이 폼을 사용할 수 있어요.</p>
      </div>
    );
  }
  return <ClerkSignIn routing="hash" />;
}
