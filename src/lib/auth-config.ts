export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
export const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE || '';

export function isClerkConfigured(): boolean {
  return CLERK_PUBLISHABLE_KEY.startsWith('pk_');
}
