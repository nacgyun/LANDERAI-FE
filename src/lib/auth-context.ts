import { createContext, useContext } from 'react';

export interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue>({
  isLoaded: true,
  isSignedIn: false,
  getToken: async () => null,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
