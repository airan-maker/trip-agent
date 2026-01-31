# TripTalk Agent

대화하면 완성되는 여행 일정 웹사이트

## 개요

AI와 자연어 대화를 통해 여행 일정을 기획하고, 공유 가능한 웹 페이지로 자동 생성하는 서비스입니다.

## 주요 기능

- **대화형 여행 기획**: 챗 UI에서 자연어로 여행 계획 수립
- **자동 일정 생성**: Day 단위, 시간대별(Morning/Lunch/Afternoon/Evening) 일정 구성
- **웹 일정 페이지**: 여행 요약, 날짜별 일정, 장소 카드가 포함된 반응형 웹페이지
- **간편 공유**: 링크 공유, QR 코드 생성

## 기술 스택

- **Frontend**: Next.js 16, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, better-sqlite3
- **AI**: Anthropic Claude / OpenAI GPT (선택 가능)
- **UI Icons**: Lucide React

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 API 키를 설정하세요:

```bash
cp .env.example .env.local
```

```env
# Anthropic (기본)
ANTHROPIC_API_KEY=your-api-key

# 또는 OpenAI
# OPENAI_API_KEY=your-api-key
# LLM_PROVIDER=openai
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 랜딩 페이지
│   ├── chat/[id]/page.tsx    # 대화 페이지
│   ├── trip/[id]/page.tsx    # 일정 보기 페이지
│   └── api/
│       ├── chat/route.ts     # 대화 API
│       ├── trips/route.ts    # 여행 CRUD API
│       └── qr/route.ts       # QR 코드 생성 API
├── components/
│   ├── chat/                 # 대화 UI 컴포넌트
│   ├── itinerary/            # 일정 뷰 컴포넌트
│   └── shared/               # 공유 컴포넌트
├── lib/
│   ├── db.ts                 # SQLite 데이터베이스
│   └── agent.ts              # AI 에이전트 로직
└── types/
    └── trip.ts               # TypeScript 타입 정의
```

## 사용 흐름

1. 랜딩 페이지에서 "여행 계획 시작하기" 클릭
2. AI와 대화하며 여행 정보 입력 (목적지, 기간, 동행자, 테마 등)
3. AI가 일정 초안 생성
4. 필요시 대화로 수정 요청
5. 웹 일정 페이지에서 확인 및 공유
