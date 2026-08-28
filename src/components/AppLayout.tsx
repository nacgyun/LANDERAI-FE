import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  History,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import AccountMenu from '@/components/AccountMenu';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: '생성 이력', icon: History },
  { to: '/mypage', label: '마이페이지', icon: UserRound },
];

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!isNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNavOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isNavOpen]);

  const renderNav = () => (
    <nav className="px-3 py-5">
      <div className="space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setIsNavOpen(false)}
            className={({ isActive }) =>
              `group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-emerald-600" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900">LANDERAI</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {location.pathname !== '/create' && (
                  <Link to="/create" className="btn-secondary hidden sm:inline-flex">
                    <Sparkles className="h-4 w-4" />
                    생성하기
                  </Link>
                )}
                <AccountMenu />
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-secondary">
                <LogIn className="h-4 w-4" />
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition ${
          isNavOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
        aria-hidden={!isNavOpen}
      >
            <button
              type="button"
              className={`absolute inset-0 bg-slate-950/10 backdrop-blur-[1px] transition-opacity duration-300 ${
                isNavOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsNavOpen(false)}
              aria-label="메뉴 닫기"
            />
            <aside
              className={`relative flex h-full w-72 max-w-[88vw] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
                isNavOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
                <Link
                  to="/"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-slate-900">LANDERAI</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsNavOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="메뉴 닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">{renderNav()}</div>
            </aside>
      </div>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-slate-400 sm:px-6">
              © {new Date().getFullYear()} LANDERAI
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
