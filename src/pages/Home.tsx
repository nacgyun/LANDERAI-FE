import { ArrowRight, Layers3, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: Sparkles,
    title: '몇 가지 정보만 입력',
    description: '업종과 타겟, 원하는 분위기와 목표를 간단히 알려주세요.',
  },
  {
    icon: Layers3,
    title: 'A/B 시안 동시 생성',
    description: '비교할 수 있는 두 가지 랜딩페이지 시안을 한 번에 만들어요.',
  },
  {
    icon: Wand2,
    title: '바로 쓰는 결과물',
    description: '아이디어에서 멈추지 않고 실제 활용할 수 있는 페이지를 받아보세요.',
  },
];

export default function Home() {
  return (
    <div className="-mx-4 -my-6 overflow-hidden sm:-mx-6 sm:-my-8">
      <section className="relative isolate px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_45%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI 랜딩페이지 A/B 시안 생성
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            생각만 하던 랜딩페이지,
            <span className="mt-2 block text-emerald-600">이제 몇 분이면 충분해요.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            업종과 고객, 목표만 알려주세요. <br/>
            LANDERAI를 통해 홍보에서 정보 제공까지!
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3">
            <Link to="/create" className="btn-accent min-w-44">
              지금 생성하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-emerald-600">HOW IT WORKS</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              입력은 간단하게, 결과는 다양하게
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-2xl bg-slate-900 px-6 py-10 text-center sm:px-10 md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">첫 번째 시안을 만들어볼까요?</h2>
            <p className="mt-2 text-sm text-slate-300">
              아이디어를 입력하면 LANDERAI가 페이지 제작을 시작합니다.
            </p>
          </div>
          <Link to="/create" className="btn shrink-0 bg-white text-slate-900 hover:bg-slate-100">
            지금 생성하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
