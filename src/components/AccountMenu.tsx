import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { KeyRound, LogOut, Settings, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isClerkConfigured } from '@/lib/auth';

type AccountMenuMode = 'header' | 'profile';

function MenuAvatar({ mode }: { mode: AccountMenuMode }) {
  const isProfile = mode === 'profile';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 ${
        isProfile ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-9 w-9'
      }`}
    >
      <UserRound className={isProfile ? 'h-7 w-7 sm:h-9 sm:w-9' : 'h-[18px] w-[18px]'} />
    </span>
  );
}

function DropdownShell({ mode, children }: { mode: AccountMenuMode; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="사용자 메뉴"
        aria-expanded={isOpen}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <MenuAvatar mode={mode} />
      </button>
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 ${
            mode === 'header' ? 'right-0' : 'left-0'
          }`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const itemClass =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950';

function ClerkAccountMenu({ mode }: { mode: AccountMenuMode }) {
  const clerk = useClerk();
  const navigate = useNavigate();

  return (
    <DropdownShell mode={mode}>
      {mode === 'header' ? (
        <>
          <button type="button" className={itemClass} onClick={() => navigate('/mypage')}>
            <UserRound className="h-4 w-4" />
            마이페이지
          </button>
          <button
            type="button"
            className={`${itemClass} text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
            onClick={() => clerk.signOut({ redirectUrl: '/login' })}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={itemClass}
            onClick={() => clerk.openUserProfile({ __experimental_startPath: '/account' })}
          >
            <Settings className="h-4 w-4" />
            사용자 정보 변경
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => clerk.openUserProfile({ __experimental_startPath: '/security' })}
          >
            <KeyRound className="h-4 w-4" />
            비밀번호 설정
          </button>
        </>
      )}
    </DropdownShell>
  );
}

function MockAccountMenu({ mode }: { mode: AccountMenuMode }) {
  const navigate = useNavigate();
  return (
    <DropdownShell mode={mode}>
      {mode === 'header' ? (
        <>
          <button type="button" className={itemClass} onClick={() => navigate('/mypage')}>
            <UserRound className="h-4 w-4" />
            마이페이지
          </button>
          <button type="button" className={`${itemClass} text-slate-400`} disabled>
            <LogOut className="h-4 w-4" />
            미리보기 모드
          </button>
        </>
      ) : (
        <p className="px-3 py-2 text-xs leading-5 text-slate-500">
          Clerk 연결 후 계정 설정을 사용할 수 있어요.
        </p>
      )}
    </DropdownShell>
  );
}

export default function AccountMenu({ mode = 'header' }: { mode?: AccountMenuMode }) {
  return isClerkConfigured() ? <ClerkAccountMenu mode={mode} /> : <MockAccountMenu mode={mode} />;
}
