# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호 설정
4. 리전 선택 (Asia Pacific - Seoul 권장)

## 2. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase URL과 Key 찾는 방법:

1. Supabase 대시보드에서 프로젝트 선택
2. 좌측 메뉴에서 "Settings" > "API" 선택
3. "Project URL"과 "anon public" 키 복사

## 3. 데이터베이스 테이블 생성

Supabase 대시보드에서:

1. 좌측 메뉴에서 "SQL Editor" 선택
2. "New query" 클릭
3. `supabase/migrations/001_create_memos_table.sql` 파일의 내용을 복사해서 붙여넣기
4. "Run" 버튼 클릭하여 실행

## 4. 실행

환경변수 설정 후 애플리케이션을 재시작:

```bash
npm run dev
```

## 5. 확인

- 애플리케이션이 정상적으로 실행되는지 확인
- 메모 생성, 수정, 삭제가 정상적으로 작동하는지 확인
- Supabase 대시보드에서 "Table Editor"로 데이터가 제대로 저장되는지 확인

## 마이그레이션 완료 내용

✅ **완료된 마이그레이션:**
- Supabase 클라이언트 라이브러리 설치 (`@supabase/supabase-js`, `@supabase/ssr`)
- Next.js App Router 최적화된 Supabase 클라이언트 설정:
  - 클라이언트 컴포넌트용: `src/lib/supabase/client.ts`
  - 서버 컴포넌트용: `src/lib/supabase/server.ts`
- 타입 정의 생성 (`src/types/supabase.ts`)
- 데이터베이스 스키마 정의 (`supabase/migrations/001_create_memos_table.sql`)
- Supabase 유틸리티 함수 작성 (`src/utils/supabaseUtils.ts`)
- useMemos 훅 Supabase로 마이그레이션 (`src/hooks/useMemos.ts`)

## 주요 변경사항

### 1. Next.js App Router 최적화
- `@supabase/ssr` 패키지 사용으로 서버사이드 렌더링 최적화
- 클라이언트/서버 컴포넌트별 분리된 Supabase 클라이언트
- 쿠키 기반 세션 관리로 SSR에서도 인증 상태 유지

### 2. 메모 인터페이스 유지
기존 `Memo` 타입 인터페이스를 그대로 유지하여 호환성 보장

### 3. 비동기 함수 변환
- `createMemo`: `Promise<Memo | null>` 반환
- `updateMemo`: `Promise<boolean>` 반환  
- `deleteMemo`: `Promise<boolean>` 반환
- `clearAllMemos`: `Promise<boolean>` 반환

### 4. 자동 시간 관리
Supabase에서 `created_at`, `updated_at` 자동 관리 (트리거 활용)

### 5. 성능 최적화
- 카테고리, 생성일시, 태그에 대한 인덱스 생성
- GIN 인덱스를 사용한 태그 검색 최적화
- 브라우저 클라이언트 싱글톤 패턴으로 불필요한 인스턴스 생성 방지

### 6. 보안
- RLS (Row Level Security) 활성화
- 현재는 모든 사용자 접근 허용 (단일 사용자 앱)
- 환경변수로 민감한 정보 관리

## 향후 확장 가능성

- 사용자 인증 시스템 추가 가능
- 다중 사용자 지원을 위한 RLS 정책 수정
- 실시간 동기화 (Supabase Realtime) 추가 가능
- 파일 첨부 기능 (Supabase Storage) 추가 가능