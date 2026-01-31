# TripTalk Agent

대화하면 완성되는 여행 일정 웹사이트

## 개요

AI와 자연어 대화를 통해 여행 일정을 기획하고, 공유 가능한 웹 페이지로 자동 생성하는 서비스입니다.

## 주요 기능

- **대화형 여행 기획**: 챗 UI에서 자연어로 여행 계획 수립, 실시간 스트리밍 응답
- **자동 일정 생성**: Day 단위, 시간대별(Morning/Lunch/Afternoon/Evening) 일정 구성
- **웹 일정 페이지**: 여행 요약, 날짜별 일정, 장소 카드가 포함된 반응형 웹페이지
- **간편 공유**: 링크 공유, QR 코드 생성

## 기술 스택

- **Frontend**: Next.js 16, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, better-sqlite3
- **AI**: Anthropic Claude / OpenAI GPT (선택 가능, SSE 스트리밍)
- **Infra**: Docker, standalone output
- **Security**: Zod 입력 검증, Rate Limiting, Security Headers

## 빠른 시작

### Docker (권장)

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일에서 ANTHROPIC_API_KEY 설정

# 2. 실행
docker compose up -d

# 3. 접속
open http://localhost:3000
```

### 로컬 개발

```bash
# 1. 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 ANTHROPIC_API_KEY 설정

# 3. 개발 서버 실행
npm run dev
```

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `ANTHROPIC_API_KEY` | O* | - | Anthropic API 키 |
| `OPENAI_API_KEY` | O* | - | OpenAI API 키 |
| `LLM_PROVIDER` | - | `anthropic` | `anthropic` 또는 `openai` |
| `ANTHROPIC_MODEL` | - | `claude-sonnet-4-20250514` | Anthropic 모델명 |
| `OPENAI_MODEL` | - | `gpt-4o` | OpenAI 모델명 |
| `RATE_LIMIT_MAX` | - | `30` | 분당 최대 요청 수 |
| `MAX_MESSAGES_PER_TRIP` | - | `200` | 여행당 최대 메시지 수 |

*선택한 LLM_PROVIDER에 해당하는 API 키 필수

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/api/trips` | 새 여행 생성 |
| `GET` | `/api/trips?id=xxx` | 여행 일정 조회 |
| `POST` | `/api/chat` | 대화 메시지 전송 (SSE 스트리밍) |
| `GET` | `/api/chat?tripId=xxx` | 대화 내역 조회 |
| `GET` | `/api/qr?url=xxx` | QR 코드 생성 |
| `GET` | `/api/health` | 헬스 체크 |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                     # 랜딩 페이지
│   ├── chat/[id]/page.tsx           # 대화 페이지
│   ├── trip/[id]/
│   │   ├── page.tsx                 # 일정 페이지 (SSR + SEO)
│   │   └── TripClientPage.tsx       # 클라이언트 컴포넌트
│   └── api/
│       ├── chat/route.ts            # 대화 API (SSE 스트리밍)
│       ├── trips/route.ts           # 여행 CRUD API
│       ├── qr/route.ts              # QR 코드 API
│       └── health/route.ts          # 헬스 체크 API
├── components/
│   ├── chat/                        # ChatWindow, ChatMessage, ChatInput
│   ├── itinerary/                   # ItineraryView, DaySection, PlaceCard
│   └── shared/                      # ShareButton, ErrorBoundary
├── lib/
│   ├── db.ts                        # SQLite (graceful shutdown)
│   ├── agent.ts                     # AI 에이전트 (스트리밍)
│   ├── env.ts                       # 환경변수 검증 (Zod)
│   ├── validation.ts                # 입력 검증 스키마
│   └── rate-limit.ts                # Rate Limiter
└── types/
    └── trip.ts                      # TypeScript 타입
```

## 프로덕션 기능

- **스트리밍 응답**: SSE 기반 실시간 AI 응답
- **입력 검증**: Zod 기반 모든 API 입력 검증
- **Rate Limiting**: IP 기반 요청 제한
- **Security Headers**: X-Frame-Options, CSP, XSS Protection 등
- **SQL Injection 방지**: 컬럼 화이트리스트, 파라미터 바인딩
- **Open Redirect 방지**: QR 코드 도메인 제한
- **Error Boundary**: 클라이언트 에러 격리
- **Graceful Shutdown**: SIGTERM/SIGINT 시 DB 안전 종료
- **Health Check**: `/api/health` 엔드포인트, Docker HEALTHCHECK
- **Dynamic SEO**: 여행 페이지별 OG 메타데이터
