import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useCreateRequest } from '@/api/hooks';
import type { Industry } from '@/api/types';

const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: 'cafe', label: '카페' },
  { value: 'restaurant', label: '식당' },
  { value: 'medical', label: '의료' },
  { value: 'education', label: '교육' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'fitness_beauty', label: '피트니스/뷰티' },
  { value: 'it', label: 'IT/테크' },
  { value: 'professional_service', label: '전문 서비스' },
  { value: 'other', label: '기타' },
];

const LANGUAGE_OPTIONS = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const createRequest = useCreateRequest();

  const [industry, setIndustry] = useState<Industry>('cafe');
  const [subIndustry, setSubIndustry] = useState('');
  const [target, setTarget] = useState('');
  const [style, setStyle] = useState('');
  const [goal, setGoal] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [language, setLanguage] = useState('ko');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subIndustry || !target || !style || !goal) return;

    try {
      const result = await createRequest.mutateAsync({
        industry,
        sub_industry: subIndustry,
        target,
        style,
        goal,
        additional_context: additionalContext || undefined,
        language,
      });
      navigate(`/requests/${result.request_id}`);
    } catch {
      // error surfaced via mutation state
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">랜딩페이지 생성</h1>
        <p className="mt-1 text-sm text-slate-500">
          업종, 타겟, 스타일, 목표를 입력하면 AI가 A/B 시안을 생성해 드려요.
        </p>
      </div>

      {createRequest.isError && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{(createRequest.error as Error)?.message || '요청 생성에 실패했어요.'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="industry">
              업종 <span className="text-rose-500">*</span>
            </label>
            <select
              id="industry"
              className="input"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
            >
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="subIndustry">
              세부 업종 <span className="text-rose-500">*</span>
            </label>
            <input
              id="subIndustry"
              className="input"
              placeholder="예: 디저트 카페"
              value={subIndustry}
              onChange={(e) => setSubIndustry(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="target">
              타겟 고객 <span className="text-rose-500">*</span>
            </label>
            <input
              id="target"
              className="input"
              placeholder="예: 20대 여성"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="style">
              스타일 <span className="text-rose-500">*</span>
            </label>
            <input
              id="style"
              className="input"
              placeholder="예: 따뜻하고 감성적인"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="goal">
              목표 <span className="text-rose-500">*</span>
            </label>
            <input
              id="goal"
              className="input"
              placeholder="예: 신메뉴 홍보 및 예약 유도"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="language">
              언어
            </label>
            <select
              id="language"
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="additionalContext">
            추가 요청사항 (선택)
          </label>
          <textarea
            id="additionalContext"
            className="input min-h-[88px] resize-y"
            placeholder="예: 인스타그램 팔로우와 예약 버튼 강조"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="submit"
            className="btn-primary"
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                생성 요청 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                A/B 시안 생성
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
