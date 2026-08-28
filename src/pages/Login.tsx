import { useState, type FormEvent } from 'react'
import { useClerk, useSignIn } from '@clerk/clerk-react'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { isClerkConfigured } from '@/lib/auth'

type ClerkErrorLike = {
  errors?: Array<{
    code?: string
    longMessage?: string
    message?: string
  }>
}

function getLoginErrorMessage(error: unknown) {
  const clerkError = error as ClerkErrorLike
  const firstError = clerkError.errors?.[0]

  switch (firstError?.code) {
    case 'form_identifier_not_found':
      return '가입되지 않은 이메일입니다.'
    case 'form_password_incorrect':
      return '비밀번호가 올바르지 않습니다.'
    case 'form_param_format_invalid':
      return '이메일 형식을 다시 확인해 주세요.'
    case 'strategy_for_user_invalid':
      return '이 계정은 다른 로그인 방식을 사용하고 있습니다.'
    case 'too_many_requests':
      return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return firstError?.longMessage || firstError?.message || '로그인 중 문제가 발생했습니다. 다시 시도해 주세요.'
  }
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_70px_-32px_rgba(15,23,42,0.32)]"
        style={{ maxWidth: '560px' }}
      >
        <section className="flex min-h-[520px] items-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </section>
      </div>
    </div>
  )
}

function ClerkLoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const clerk = useClerk()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const from = (location.state as { from?: string } | null)?.from || '/create'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLoaded || isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const result = await signIn.create({
        strategy: 'password',
        identifier: email.trim(),
        password,
      })

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        navigate(from, { replace: true })
        return
      }

      if (result.status === 'needs_second_factor') {
        setErrorMessage('추가 인증이 필요한 계정입니다. 현재 로그인 화면에서는 추가 인증을 지원하지 않습니다.')
      } else {
        setErrorMessage('로그인을 완료하려면 추가 인증이 필요합니다.')
      }
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Link to="/" className="mb-12 flex w-fit items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">LANDERAI</span>
      </Link>

      <form className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-600">이메일</span>
          <input
            type="text"
            inputMode="email"
            name="landerai-email-entry"
            autoComplete="new-password"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="login-input h-12 w-full rounded-lg border border-slate-300 bg-transparent px-5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-600">비밀번호</span>
          <span className="flex h-12 w-full items-center overflow-hidden rounded-lg border border-slate-300 bg-transparent shadow-sm transition hover:border-slate-400 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10">
            <input
              type={showPassword ? 'text' : 'password'}
              name="landerai-password-entry"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="login-input h-full min-w-0 flex-1 border-0 bg-transparent pl-5 pr-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center bg-transparent text-slate-400"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {errorMessage && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700">
            <AlertCircle className="mt-0.5 shrink-0" size={17} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <button
            type="submit"
            disabled={!isLoaded || isSubmitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-950 px-4 text-sm font-semibold shadow-sm transition hover:border-emerald-600 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: '#020617', color: '#ffffff' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                로그인 중
              </>
            ) : (
              <>
                로그인
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => clerk.openSignUp()}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-900/10"
          >
            회원가입
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-xs leading-5 text-slate-400">
        로그인하면 LANDERAI 서비스 이용 정책에 동의하게 됩니다.
      </p>
    </>
  )
}

function MockLoginNotice() {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-emerald-600">DEVELOPMENT MODE</p>
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">로그인 설정이 필요해요</h1>
      <p className="mt-4 text-sm leading-6 text-slate-500">
        Clerk 키가 설정되지 않아 현재는 개발용 사용자로 실행 중입니다. 서비스를 둘러보거나 환경 변수에 Clerk 키를 추가해 주세요.
      </p>
      <Link
        to="/create"
        className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        LANDERAI 시작하기
        <ArrowRight size={17} />
      </Link>
    </div>
  )
}

export default function Login() {
  return <LoginShell>{isClerkConfigured() ? <ClerkLoginForm /> : <MockLoginNotice />}</LoginShell>
}
