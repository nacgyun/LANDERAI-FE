import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreateRequest from '@/pages/CreateRequest';
import RequestDetail from '@/pages/RequestDetail';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import RequestHistory from '@/pages/RequestHistory';
import MyPage from '@/pages/MyPage';
import { AuthProvider } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';

function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <Navigate to="/create" replace />;
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/create" element={<CreateRequest />} />
                <Route path="/history" element={<RequestHistory />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/requests/:requestId" element={<RequestDetail />} />
              </Route>
              <Route path="*" element={<RootRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
