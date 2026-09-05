import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Download,
  Wand2,
  History,
} from 'lucide-react';
import {
  usePreviewUrls,
  useDownloadSelectedVariant,
  useRequestStatus,
  useSaveVariantSelection,
  useVariantSelection,
  useCreateRevision,
  useRevisions,
  useRevisionPreviewUrl,
  useRevisionStatus,
} from '@/api/hooks';
import type { CurrentStep, LandingPageRevision, RevisionStatus } from '@/api/types';

const STEP_ORDER: CurrentStep[] = [
  'EMBEDDING',
  'DESIGN_PLAN',
  'LANDING_PAGE_VARIANT',
  'PERSIST_RESULT',
  'DONE',
];

const STEP_LABEL: Record<CurrentStep, string> = {
  EMBEDDING: '임베딩 분석',
  DESIGN_PLAN: '디자인 기획',
  LANDING_PAGE_VARIANT: '랜딩페이지 생성',
  PERSIST_RESULT: '결과 저장',
  DONE: '완료',
};

function StatusCard({
  status,
  currentStep,
  progress,
}: {
  status: string;
  currentStep: CurrentStep | null;
  progress: number;
}) {
  const stepIndex = currentStep ? STEP_ORDER.indexOf(currentStep) : -1;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'PROCESSING' && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          )}
          {status === 'COMPLETED' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          {status === 'FAILED' && (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          )}
          <span className="text-sm font-medium text-slate-900">
            {status === 'PROCESSING'
              ? '열심히 만들고 있어요!'
              : status === 'COMPLETED'
                ? '생성이 완료되었어요!'
                : status === 'FAILED'
                  ? '생성이 실패했어요'
                  : status}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500">{progress}%</span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'FAILED'
              ? 'bg-rose-400'
              : status === 'COMPLETED'
                ? 'bg-emerald-500'
                : 'bg-slate-700'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentStep && status === 'PROCESSING' && (
        <div className="space-y-2">
          {STEP_ORDER.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div
                key={step}
                className={`flex items-center gap-2 text-xs ${
                  done
                    ? 'text-slate-400'
                    : active
                      ? 'font-medium text-slate-900'
                      : 'text-slate-300'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    done
                      ? 'border-slate-300 bg-slate-100'
                      : active
                        ? 'border-slate-700 bg-slate-700 text-white'
                        : 'border-slate-200'
                  }`}
                >
                  {done ? '✓' : active ? '' : ''}
                </span>
                {STEP_LABEL[step]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PreviewPanel({
  requestId,
  status,
  chosenVariant,
}: {
  requestId: string;
  status: string;
  chosenVariant: 'A' | 'B' | null;
}) {
  const selectionQuery = useVariantSelection(requestId, status === 'COMPLETED');
  const saveMutation = useSaveVariantSelection(requestId);
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const selectedVariant =
    selectionQuery.data?.chosen_variant ?? chosenVariant;
  const previewQuery = usePreviewUrls(
    requestId,
    status === 'COMPLETED' && !selectedVariant,
  );
  const isAlreadySelected = selectionQuery.data?.selection_status === 'SELECTED';

  const refreshPreview = () => {
    previewQuery.refetch();
  };

  if (status !== 'COMPLETED') return null;

  if (selectedVariant && selectionQuery.data?.latest_revision_id) {
    return (
      <RevisionWorkspace
        requestId={requestId}
        latestRevisionId={selectionQuery.data.latest_revision_id}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">A/B Preview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshPreview}
            className="btn-secondary"
            disabled={previewQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${previewQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Preview URL 새로고침
          </button>
        </div>
      </div>

      {previewQuery.isError && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {(previewQuery.error as Error)?.message ||
              'Preview URL을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'}
          </span>
        </div>
      )}

      {previewQuery.isLoading && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preview 불러오는 중...
        </div>
      )}

      {previewQuery.data && (
        <>
          <div className="text-xs text-slate-500">
            Preview URL은 {previewQuery.data.expires_in}초 후 만료돼요. 만료되면
            새로고침 버튼을 눌러 주세요.
          </div>

          {/* Mobile: tab switch */}
          <div className="flex gap-2 sm:hidden">
            {(['A', 'B'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveTab(v)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  activeTab === v
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Variant {v}
                {selectedVariant === v && (
                  <CheckCircle2 className="ml-1 inline h-3.5 w-3.5" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop: 2 columns; Mobile: active tab */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['A', 'B'] as const).map((variant) => (
              <div
                key={variant}
                className={`card overflow-hidden ${
                  activeTab !== variant ? 'hidden sm:block' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      Variant {variant}
                    </span>
                    {selectedVariant === variant && (
                      <span className="text-xs font-medium text-emerald-600">
                        선택됨
                      </span>
                    )}
                  </div>
                  <a
                    href={previewQuery.data.variants[variant].preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="bg-slate-50 p-2">
                  <iframe
                    title={`Variant ${variant} preview`}
                    src={previewQuery.data.variants[variant].preview_url}
                    className="h-[480px] w-full rounded-md border border-slate-200 bg-white sm:h-[560px]"
                  />
                </div>
                <div className="border-t border-slate-200 p-3">
                  <button
                    onClick={() => saveMutation.mutate(variant)}
                    disabled={
                      isAlreadySelected ||
                      saveMutation.isPending ||
                      selectedVariant !== null
                    }
                    className={`w-full ${
                      selectedVariant === variant
                        ? 'btn-accent'
                        : 'btn-primary'
                    }`}
                  >
                    {saveMutation.isPending && selectedVariant === null ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : selectedVariant !== null ? (
                      selectedVariant === variant ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Variant {variant} 선택됨
                        </>
                      ) : (
                        '이미 선택 완료'
                      )
                    ) : (
                      `Variant ${variant} 선택`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {saveMutation.isError && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {(saveMutation.error as Error)?.message ||
                  '선택 저장에 실패했어요. 다시 시도해 주세요.'}
              </span>
            </div>
          )}

        </>
      )}
    </div>
  );
}

const REVISION_STATUS_LABEL: Record<RevisionStatus, string> = {
  QUEUED: '대기 중',
  PROCESSING: '수정 중',
  COMPLETED: '완료',
  FAILED: '실패',
};

function RevisionWorkspace({
  requestId,
  latestRevisionId,
}: {
  requestId: string;
  latestRevisionId: string;
}) {
  const revisionsQuery = useRevisions(requestId);
  const createMutation = useCreateRevision(requestId);
  const downloadMutation = useDownloadSelectedVariant(requestId);
  const [selectedRevisionId, setSelectedRevisionId] = useState(latestRevisionId);
  const [processingRevisionId, setProcessingRevisionId] = useState<string>();
  const [prompt, setPrompt] = useState('');
  const processingQuery = useRevisionStatus(
    requestId,
    processingRevisionId,
    !!processingRevisionId,
  );

  const revisions = revisionsQuery.data?.items ?? [];
  const selectedRevision = revisions.find(
    (revision) => revision.revision_id === selectedRevisionId,
  );
  const processingRevision = processingQuery.data;
  const activeStatus = processingRevision?.status;
  const isWorking = activeStatus === 'QUEUED' || activeStatus === 'PROCESSING';
  const previewQuery = useRevisionPreviewUrl(
    requestId,
    selectedRevisionId,
    selectedRevision?.status === 'COMPLETED',
  );

  const downloadLatestRevision = async () => {
    try {
      const result = await downloadMutation.mutateAsync();
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Mutation state renders the error.
    }
  };

  useEffect(() => {
    setSelectedRevisionId(latestRevisionId);
  }, [latestRevisionId]);

  useEffect(() => {
    if (!processingRevision) return;
    revisionsQuery.refetch();
    if (processingRevision.status === 'COMPLETED') {
      setSelectedRevisionId(processingRevision.revision_id);
      setProcessingRevisionId(undefined);
      setPrompt('');
    }
  }, [processingRevision?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitRevision = async (event: React.FormEvent) => {
    event.preventDefault();
    const revisionPrompt = prompt.trim();
    if (!revisionPrompt || !selectedRevisionId) return;
    try {
      const revision = await createMutation.mutateAsync({
        source_revision_id: selectedRevisionId,
        revision_prompt: revisionPrompt,
      });
      setProcessingRevisionId(revision.revision_id);
    } catch {
      // Mutation state renders the error.
    }
  };

  const formatCreatedAt = (value: string) =>
    new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <section className="space-y-4 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Wand2 className="h-4 w-4" />
            AI 수정
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            이력에서 기준 버전을 고른 뒤 원하는 변경사항을 입력하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadLatestRevision}
          disabled={downloadMutation.isPending}
          className="btn-primary"
        >
          {downloadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloadMutation.isPending ? '다운로드 준비 중...' : '코드 다운로드'}
        </button>
      </div>

      {downloadMutation.isError && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {(downloadMutation.error as Error)?.message ||
              '다운로드 URL을 만들지 못했어요. 다시 시도해 주세요.'}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-900">선택한 버전</span>
              {previewQuery.data && (
                <a
                  href={previewQuery.data.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="새 창에서 버전 미리보기"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {previewQuery.isLoading ? (
              <div className="flex h-[420px] items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 미리보기 준비 중...
              </div>
            ) : previewQuery.data ? (
              <iframe
                title="버전 미리보기"
                src={previewQuery.data.preview_url}
                className="h-[520px] w-full bg-white"
              />
            ) : (
              <div className="flex h-40 items-center justify-center px-5 text-center text-sm text-slate-500">
                {previewQuery.isError
                  ? (previewQuery.error as Error).message
                  : '완료된 버전을 선택하면 미리보기가 표시됩니다.'}
              </div>
            )}
          </div>

          <form onSubmit={submitRevision} className="card space-y-3 p-4">
            <label htmlFor="revision-prompt" className="block text-sm font-medium text-slate-900">
              수정 요청
            </label>
            <textarea
              id="revision-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={4000}
              rows={4}
              disabled={isWorking || createMutation.isPending}
              placeholder="예: 전체 배경을 어둡게 바꾸고 CTA 버튼을 더 눈에 띄게 만들어줘"
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={!prompt.trim() || isWorking || createMutation.isPending}
              >
                {isWorking || createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isWorking
                  ? REVISION_STATUS_LABEL[activeStatus!]
                  : createMutation.isPending
                    ? '요청 등록 중...'
                    : '수정 요청하기'}
              </button>
            </div>
            {processingRevision && (
              <div className={`rounded-lg px-3 py-2 text-sm ${
                processingRevision.status === 'FAILED'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-50 text-slate-600'
              }`}>
                상태: {REVISION_STATUS_LABEL[processingRevision.status]}
                {processingRevision.error_message && ` · ${processingRevision.error_message}`}
              </div>
            )}
            {createMutation.isError && (
              <div className="text-sm text-rose-600">{(createMutation.error as Error).message}</div>
            )}
          </form>
        </div>

        <div className="card h-fit p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900">
            <History className="h-4 w-4" /> 버전 이력
          </h3>
          {revisionsQuery.isLoading ? (
            <div className="text-sm text-slate-500">이력을 불러오는 중...</div>
          ) : (
            <div className="space-y-2">
              {revisions.map((revision: LandingPageRevision, index) => (
                <button
                  type="button"
                  key={revision.revision_id}
                  onClick={() => revision.status === 'COMPLETED' && setSelectedRevisionId(revision.revision_id)}
                  disabled={revision.status !== 'COMPLETED'}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedRevisionId === revision.revision_id
                      ? 'border-slate-800 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-400 disabled:hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {revision.source_type === 'VARIANT' ? '최초 선택본' : `수정 ${revisions.length - index - 1}`}
                    </span>
                    <span className={`text-[11px] ${
                      revision.status === 'FAILED' ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {REVISION_STATUS_LABEL[revision.status]}
                    </span>
                  </div>
                  {revision.revision_prompt && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{revision.revision_prompt}</p>
                  )}
                  <div className="mt-2 text-[11px] text-slate-400">{formatCreatedAt(revision.created_at)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const statusQuery = useRequestStatus(requestId);

  // Update document title with status for clarity
  useEffect(() => {
    if (statusQuery.data) {
      document.title = `LANDERAI · ${statusQuery.data.status}`;
    }
  }, [statusQuery.data]);

  if (!requestId) {
    return (
      <div className="text-sm text-slate-500">잘못된 요청 주소예요.</div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-medium">요청 정보를 불러오지 못했어요.</div>
            <div className="mt-1 text-rose-600">
              {(statusQuery.error as Error)?.message}
            </div>
          </div>
        </div>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-600 underline">
          생성 화면으로 돌아가기
        </Link>
      </div>
    );
  }

  const data = statusQuery.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          생성 화면
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">요청 상세</h1>
      </div>

      {data ? (
        <>
          <StatusCard
            status={data.status}
            currentStep={data.current_step}
            progress={data.progress}
          />

          {data.status === 'FAILED' && (
            <div className="card border-rose-200 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div className="text-sm">
                  <div className="font-medium text-rose-700">
                    생성에 실패했어요
                    {data.error_type ? ` (${data.error_type})` : ''}
                  </div>
                  {data.error_message && (
                    <div className="mt-1 text-rose-600">{data.error_message}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <PreviewPanel
            requestId={requestId}
            status={data.status}
            chosenVariant={data.chosen_variant}
          />
        </>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          불러오는 중...
        </div>
      )}
    </div>
  );
}
