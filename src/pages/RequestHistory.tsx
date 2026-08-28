import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileClock,
  Loader2,
  Plus,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRequestHistory } from '@/api/hooks';
import type { RequestStatus } from '@/api/types';

const INDUSTRY_LABELS: Record<string, string> = {
  cafe: '카페',
  restaurant: '식당',
  medical: '의료',
  education: '교육',
  shopping: '쇼핑',
  fitness_beauty: '피트니스/뷰티',
  it: 'IT/테크',
  professional_service: '전문 서비스',
  other: '기타',
};

const STATUS_META: Record<
  RequestStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  QUEUED: {
    label: '대기 중',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    icon: Clock3,
  },
  PROCESSING: {
    label: '생성 중',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock3,
  },
  COMPLETED: {
    label: '완료',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: CheckCircle2,
  },
  FAILED: {
    label: '실패',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: XCircle,
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function RequestHistory() {
  const history = useRequestHistory();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-600">MY CREATIONS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">생성 이력</h1>
          <p className="mt-2 text-sm text-slate-500">
            지금까지 요청한 랜딩페이지와 생성 상태를 확인하세요.
          </p>
        </div>
        <Link to="/create" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          새로 생성하기
        </Link>
      </div>

      {history.isLoading && (
        <div className="card flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          생성 이력을 불러오는 중...
        </div>
      )}

      {history.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{(history.error as Error)?.message || '생성 이력을 불러오지 못했어요.'}</span>
        </div>
      )}

      {history.data && history.data.items.length === 0 && (
        <div className="card flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileClock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">아직 생성 이력이 없어요</h2>
          <p className="mt-1 text-sm text-slate-500">첫 랜딩페이지 A/B 시안을 만들어보세요.</p>
          <Link to="/create" className="btn-accent mt-5">시작하기</Link>
        </div>
      )}

      {history.data && history.data.items.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-400">총 {history.data.total}건</p>
          {history.data.items.map((request) => {
            const status = STATUS_META[request.status];
            const StatusIcon = status.icon;
            return (
              <Link
                key={request.request_id}
                to={`/requests/${request.request_id}`}
                className="card group block p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-600">
                        {INDUSTRY_LABELS[request.industry] || request.industry}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${status.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      {request.chosen_variant && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                          {request.chosen_variant}안 선택
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 truncate font-semibold text-slate-900">
                      {request.sub_industry} · {request.goal}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      타겟 {request.target} · {request.style}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">{formatDate(request.created_at)}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
