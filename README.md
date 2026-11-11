# 틈틈 (TeumTeum)

> 남는 시간, 어디로 가볼까요?

위치·시간·이동수단을 고르면 그 시간 안에 다녀올 수 있는 장소나 코스를 추천하는 즉흥 외출 추천 서비스입니다.

## 팀

| 이름 | 담당 |
|---|---|
| 김용현 | 공통 기반·인증, 배포 |
| 정종일 | 장소 (카카오 로컬 API) |
| 나혜빈 | 추천 로직 |
| 유지수 | 지도 |
| 김하윤 | 저장·마이페이지, DB 설계 |
| 정종화 | 관리자 기능 |

## 구조

```
teumteum/
├── backend/    # Spring Boot
├── frontend/   # Vite + React + TypeScript + Tailwind
└── docs/       # API 명세, ERD, 화면 설계서
```

자세한 규칙은 [AGENTS.md](./AGENTS.md) 를 참고하세요.

## 로컬 실행

### Backend
1. MySQL에 `teumteum` 데이터베이스 생성
2. `backend/src/main/resources/application-local.yml.example` 을 복사해 `application-local.yml` 로 만들고 값 입력
3. `backend/` 에서 `./gradlew bootRun` (Windows: `gradlew.bat bootRun`)

### Frontend
1. `frontend/.env.example` 을 복사해 `.env.local` 로 만들고 카카오 키 입력
2. `frontend/` 에서 `npm install` → `npm run dev`
3. http://localhost:5173 접속 (`/api` 요청은 백엔드 8080으로 전달됨)

### 필요한 버전
- Java 21 (JDK), Node.js 20.19 이상 또는 22.12 이상, MySQL 8

## 브랜치 전략

`main` ← `develop` ← `feature/{도메인}-{기능}`
