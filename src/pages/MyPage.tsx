import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentUser, useRequestHistory } from '@/api/hooks';
import AccountMenu from '@/components/AccountMenu';

function formatDate(value: string | null | undefined) {
  if (!value) return '가입일 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export default function MyPage() {
  const user = useCurrentUser();
  const history = useRequestHistory();
  const requests = history.data?.items ?? [];
  const completedCount = requests.filter((item) => item.status === 'COMPLETED').length;
  const selectedCount = requests.filter((item) => item.selection_status === 'SELECTED').length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7">
        <p className="text-sm font-semibold text-emerald-600">MY LANDERAI</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-500">
          내 프로필과 랜딩페이지 제작 활동을 한눈에 확인하세요.
        </p>
      </div>

      {user.isLoading ? (
        <div className="card flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          내 정보를 불러오는 중...
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <section className="card flex items-center gap-5 p-6 sm:gap-6 sm:p-8">
            <AccountMenu mode="profile" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-slate-950">
                  {user.data?.name || '이름 정보 없음'}
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {user.data?.role || 'USER'}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{user.data?.email || '이메일 정보 없음'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    {user.data?.created_at
                      ? `${formatDate(user.data.created_at)} 가입`
                      : '가입일 정보 없음'}
                  </span>
                </p>
              </div>
              {user.isError && (
                <p className="mt-3 text-xs text-rose-600">사용자 정보를 불러오지 못했습니다.</p>
              )}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">제작 활동</p>
                <p className="mt-1 text-xs text-slate-500">LANDERAI에서 만든 결과를 요약했어요.</p>
              </div>
              <FileText className="h-5 w-5 text-slate-300" />
            </div>
            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200">
              <div className="pr-3">
                <p className="text-2xl font-bold text-slate-950">{history.isLoading ? '-' : requests.length}</p>
                <p className="mt-1 text-xs text-slate-500">전체 요청</p>
              </div>
              <div className="px-3">
                <p className="text-2xl font-bold text-slate-950">{history.isLoading ? '-' : completedCount}</p>
                <p className="mt-1 text-xs text-slate-500">생성 완료</p>
              </div>
              <div className="pl-3">
                <p className="text-2xl font-bold text-slate-950">{history.isLoading ? '-' : selectedCount}</p>
                <p className="mt-1 text-xs text-slate-500">시안 선택</p>
              </div>
            </div>
            <Link
              to="/history"
              className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              생성 이력 전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link to="/create" className="card group flex items-center gap-4 p-5 transition hover:border-emerald-200 hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">새 랜딩페이지 만들기</h3>
            <p className="mt-1 text-sm text-slate-500">새로운 A/B 시안을 생성해보세요.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
        </Link>
        <Link to="/history" className="card group flex items-center gap-4 p-5 transition hover:border-emerald-200 hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">내 결과 다시 보기</h3>
            <p className="mt-1 text-sm text-slate-500">완료된 시안과 선택 결과를 확인하세요.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
        </Link>
      </section>
    </div>
  );
}
