# LANDERAI — Frontend

LANDERAI는 사용자가 입력한 정보를 바탕으로 랜딩페이지 A/B 시안을 생성하고, 선택한 시안을 수정하거나 게시할 수 있는 서비스입니다.

이 저장소에는 사용자가 랜딩페이지를 생성하고 결과를 확인하는 화면이 있습니다. 실제 생성·수정 처리는 BE에서 담당하고, AWS 인프라는 별도 저장소에서 관리합니다.

- [서비스](https://landerai.un-box.click)
- [Backend](https://github.com/nacgyun/LANDERAI-BE)
- [Infrastructure](https://github.com/nacgyun/LANDERAI-INFRA)

## 1. 기술 구성

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | React 18, TypeScript, Vite |
| 화면 및 라우팅 | React Router, Tailwind CSS |
| API 및 상태 관리 | Fetch API, TanStack Query |
| 인증 | Clerk |
| 배포 | GitHub Actions, S3, CloudFront |

## 2. 주요 사용자 흐름

```text
로그인
  → 랜딩페이지 생성 요청
  → 생성 상태 확인
  → A/B 시안 확인 및 선택
  → 수정 요청 및 Revision 확인
  → 다운로드 또는 게시
```

`/create`에서 업종, 대상, 스타일, 목적 등을 입력하면 랜딩페이지 생성을 요청합니다. 생성이 시작되면 `/requests/:requestId`에서 현재 진행 단계와 결과를 확인할 수 있습니다.

생성이 끝나면 A/B 시안 중 하나를 선택하고, 선택한 시안을 기준으로 수정할 수 있습니다. 수정 결과는 Revision별로 확인하며, 원하는 버전을 다운로드하거나 사용자별 주소로 게시할 수 있습니다. 이전 생성 요청은 `/history`에서 확인합니다.

관련 코드: [`src/pages/CreateRequest.tsx`](src/pages/CreateRequest.tsx), [`src/pages/RequestDetail.tsx`](src/pages/RequestDetail.tsx), [`src/pages/RequestHistory.tsx`](src/pages/RequestHistory.tsx)

## 3. 주요 구현 내용

### 3.1 비동기 작업 상태 조회

랜딩페이지 생성과 수정은 시간이 걸리는 작업이라 API를 호출한 직후 결과를 받을 수 없습니다. 그래서 작업을 요청한 뒤에는 상태를 주기적으로 조회하는 방식으로 구현합니다.

TanStack Query의 `refetchInterval`을 이용해 생성 상태가 `PROCESSING`이면 2.5초마다 다시 조회하고, 완료되거나 실패하면 조회를 멈춥니다. 수정 요청도 `QUEUED`, `PROCESSING` 상태일 때 같은 방식으로 처리합니다. 게시하거나 게시를 해제할 때도 작업이 진행 중인 동안 호스팅 상태를 확인합니다.

시안 선택이나 수정 요청이 끝난 뒤에는 관련 Query를 무효화하거나 캐시를 갱신합니다. 화면에 이전 상태가 그대로 남지 않도록 하기 위해서입니다.

관련 코드: [`src/api/hooks.ts`](src/api/hooks.ts)

### 3.2 API 호출 및 인증

API 요청을 화면마다 직접 작성하지 않고 `client`, `endpoints`, `hooks`로 나눕니다.

- `client.ts`: 인증 토큰을 포함한 HTTP 요청과 공통 오류 처리
- `endpoints.ts`: 요청 생성, 상태 조회, 수정, 게시 등의 API 경로
- `hooks.ts`: 화면에서 사용하는 Query와 Mutation

Clerk에서 가져온 토큰은 요청할 때 `Authorization: Bearer` 헤더에 넣습니다. 인증이 필요하지만 로그인하지 않은 사용자는 `ProtectedRoute`에서 로그인 화면으로 이동시킵니다.

API 오류는 상태 코드에 따라 사용자에게 보여줄 메시지로 바꿉니다. 예를 들어 인증 오류와 서버 오류를 구분해 안내하고, 네트워크 연결 자체가 실패한 경우도 따로 처리합니다.

로컬에서는 Clerk 키가 없어도 화면을 확인할 수 있도록 미리보기 모드를 두었습니다. 다만 배포 빌드에서 Clerk 설정이 빠진 경우에는 보호된 화면을 로그인 없이 사용할 수 없도록 합니다.

관련 코드: [`src/api/client.ts`](src/api/client.ts), [`src/api/endpoints.ts`](src/api/endpoints.ts), [`src/lib/auth.tsx`](src/lib/auth.tsx), [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx)

### 3.3 A/B 시안 및 Revision 관리 화면

생성된 A/B 시안을 미리보고, 사용할 시안을 하나 선택합니다. 이후에는 선택한 결과를 기준으로 수정 요청을 보낼 수 있습니다.

수정할 때마다 새 Revision이 만들어지기 때문에 이전 결과도 남아 있습니다. 화면에서는 Revision 목록과 처리 상태를 보여주고, 선택한 버전을 미리보거나 다운로드할 수 있도록 구성합니다.

게시할 때는 원하는 Revision을 선택하고 프로젝트 이름을 입력합니다. 게시가 완료되면 할당된 서브도메인 주소를 확인할 수 있고, 게시를 해제하는 기능도 제공합니다.

관련 코드: [`src/pages/RequestDetail.tsx`](src/pages/RequestDetail.tsx), [`src/api/hooks.ts`](src/api/hooks.ts)

## 4. 프로젝트 구조

```text
src/
├── api/             # API 호출, Query·Mutation Hooks, 타입
├── components/      # 공통 레이아웃, 계정 메뉴, 인증 라우트
├── lib/             # Clerk 인증 관련 코드
├── pages/           # 생성, 결과, 수정, 게시, 이력, 마이페이지
├── App.tsx          # 라우팅 및 QueryClient 설정
└── index.css        # 공통 스타일
.github/workflows/   # FE 배포 워크플로
```

## 5. CI/CD 및 배포

`develop` 브랜치는 dev 환경, `main` 브랜치는 prod 환경에 연결합니다. 각 브랜치에 push하면 GitHub Actions에서 빌드와 배포를 진행합니다.

배포 전에 `npm ci`로 의존성을 설치하고 TypeScript 타입 검사와 ESLint 검사를 진행합니다. 두 검사를 통과하면 Vite로 빌드한 뒤 S3에 업로드하고 CloudFront 캐시를 무효화합니다.

해시가 포함된 JS·CSS 등의 정적 파일은 긴 캐시 기간을 사용하고, HTML 같은 진입 파일은 `no-cache`로 업로드합니다. 배포 후 변경된 화면이 이전 캐시 때문에 보이지 않는 상황을 줄이기 위해서입니다.

AWS 배포 권한은 액세스 키를 저장하는 대신 GitHub OIDC로 IAM Role을 수임해 사용합니다.

관련 코드: [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml)
