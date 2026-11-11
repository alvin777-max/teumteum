# 틈틈 (TeumTeum) — AI 에이전트 공통 가이드

이 파일은 이 저장소에서 작업하는 모든 AI 코딩 에이전트(Claude Code, Codex, Cursor, Copilot 등)와 팀원이 따르는 공통 규칙입니다.
규칙을 바꿀 때는 PR로 팀 합의 후 수정합니다.

## 1. 프로젝트 개요

틈틈은 **위치·시간 기반 즉흥 외출 추천 서비스**입니다.
사용자가 출발지, 이용 가능 시간(최대 6시간), 이동수단, 카테고리를 고르면 시간 안에 다녀올 수 있는 **단일 장소** 또는 **코스**를 추천합니다.

- 모바일 우선 설계, PC는 반응형으로 확장
- 비회원 이용 중심. 코스 저장 등 회원 전용 기능에서만 로그인 요구
- 관리자 기능은 `/admin` 경로로 분리

## 2. 기술 스택

| 영역 | 스택 | 상태 |
|---|---|---|
| 언어 | Java 21 | 확정 |
| 프레임워크 | Spring Boot 4.x | 확정 |
| 빌드 | Gradle (Groovy) | 확정 |
| 영속성 | Spring Data JPA | 확정 |
| DB | MySQL 8 | 확정 |
| 인증 | Spring Security + JWT | 확정 |
| API 문서 | springdoc-openapi 3.x (Swagger UI) — Boot 4는 3.x 버전 필요 | 확정 |
| 검증 | Spring Validation | 확정 |
| 기타 | Lombok | 확정 |
| 테스트 | JUnit 5, Spring Boot Test | 확정 |
| Frontend | Vite, React 19, TypeScript (SPA) | 확정 |
| 라우팅 | React Router (`react-router`, `src/app/router.tsx` 에서 관리) | 확정 |
| 린트 | oxlint (`.oxlintrc.json`) | 확정 |
| HTTP | axios | 확정 |
| 상태관리 | 우선 없음 (필요 시 Zustand) | 확정 |
| 스타일 | Tailwind CSS (+ 필요 시 CSS Modules) | 확정 |
| 외부 API | 카카오 로컬 API(REST), 카카오 지도 JS SDK | 변경 가능 |
| 협업 | GitHub Organization, GitHub Issues/PR | 확정 |
| 배포 | 미정 | 미정 |
| CI/CD | GitHub Actions (배포 방식 확정 후) | 미정 |

- 프론트는 정적 SPA다. 비즈니스 로직과 모든 API는 Spring 백엔드가 담당한다
- 새 라이브러리 추가는 PR 설명에 이유를 적고 팀 확인을 받는다

## 3. 폴더 구조와 담당

모노레포입니다. 백엔드는 **도메인형 패키지**, 프론트는 **기능형 폴더**를 씁니다.

```
teumteum/
├── backend/src/main/java/com/teumteum/
│   ├── global/      # 공통: config, auth(JWT·인증), exception, common(ApiResponse 등)
│   ├── member/      # 회원가입·로그인(김용현) / 회원 조회·수정·탈퇴(김하윤)
│   ├── place/       # 카카오 로컬 연동, 장소 검색·상세 (정종일)
│   ├── recommend/   # 소요시간 계산, 단일·코스 추천 (나혜빈)
│   ├── course/      # 코스 저장·조회·삭제 (김하윤)
│   └── admin/       # 관리자 기능 (정종화)
├── frontend/src/
│   ├── app/         # App.tsx, router.tsx (전체 라우트 목록)
│   ├── pages/       # 화면 단위 컴포넌트 (HomePage.tsx 등). features 조합만 하고 로직은 두지 않음
│   ├── features/    # auth, condition, recommend, map, mypage, admin
│   └── shared/      # 공통 레이아웃(Header·Nav·Loading), axios 클라이언트, 공용 컴포넌트, 공통 타입
└── docs/            # API 명세, ERD, 화면 설계서
```

각 백엔드 도메인 내부는 `controller / service / repository / domain / dto` 로 통일합니다. (MyBatis 사용 시 `repository` 대신 `mapper`)
각 프론트 feature 내부는 `api / components / types.ts` 를 기본으로 하고, 필요할 때만 `hooks` 등을 추가합니다.

| 담당 | 영역 |
|---|---|
| 김용현 | 공통 기반·인증, 초기 세팅, 공통 레이아웃, API 명세서 취합, 시연 서버 배포 |
| 정종일 | 장소(카카오 로컬 API), 외출 조건 설정, 공통 응답·예외 처리, Swagger |
| 나혜빈 | 추천 로직(체류·이동·총 소요시간), 추천 API, 결과·코스 상세 |
| 유지수 | 카카오 지도, 마커·방문 순서, 화면 설계서·화면-API 매핑표, 시연 시나리오 |
| 김하윤 | ERD·테이블 정의서, 코스 저장·조회·삭제, 회원 정보 조회, 마이페이지 |
| 정종화 | 관리자 기능(`/admin`) — 회원 관리, 공지사항·전체 알림 |

### 폴더별 담당자

수정 전에 담당자에게 알려야 하는 폴더를 확인할 때 이 표를 봅니다.

| 폴더 | 한글 이름 | 담당 |
|---|---|---|
| `backend/.../global/config`, `global/auth` | 공통 설정, 인증(JWT) | 김용현 |
| `backend/.../global/common`, `global/exception` | 공통 응답, 예외 처리 | 정종일 |
| `backend/.../member` | 회원 | 김용현(가입·로그인) / 김하윤(조회·수정·탈퇴) |
| `backend/.../place` | 장소 | 정종일 |
| `backend/.../recommend` | 추천 | 나혜빈 |
| `backend/.../course` | 코스(저장) | 김하윤 |
| `backend/.../admin` | 관리자 | 정종화 |
| `frontend/src/app`, `shared/` | 라우터, 공통 레이아웃·API 클라이언트 | 김용현 |
| `frontend/src/features/auth` | 로그인·회원가입 화면 | 김용현 |
| `frontend/src/features/condition` | 외출 조건·카테고리 선택 화면 | 정종일 |
| `frontend/src/features/recommend` | 추천 결과·코스 상세 화면 | 나혜빈 |
| `frontend/src/features/map` | 카카오 지도·마커 | 유지수 |
| `frontend/src/features/mypage` | 마이페이지 | 김하윤 |
| `frontend/src/features/admin` | 관리자 화면 | 정종화 |
| `frontend/src/pages` | 화면 조합 | 해당 화면의 feature 담당자 |
| `docs/` | 문서 | `docs/README.md` 참고 |

## 4. 실행 명령어

```bash
# Backend (backend/ 에서)
./gradlew bootRun          # Windows: gradlew.bat bootRun
./gradlew test

# Frontend (frontend/ 에서)
npm install
npm run dev                # http://localhost:5173, /api 요청은 vite.config.ts 의 proxy로 8080에 전달
npm run build
npm run lint
```

로컬 설정은 예시 파일을 복사해서 씁니다.
- `backend/src/main/resources/application-local.yml.example` → `application-local.yml`
- `frontend/.env.example` → `.env.local`

## 5. 백엔드 규칙

- **URL**: REST API는 `/api/...`, 관리자 API는 `/api/admin/...`. 복수형 명사 사용 (`/api/courses/{courseId}`)
- **응답**: 모든 API는 `global/common`의 공통 응답 형식(`ApiResponse`)으로 감싼다
- **예외**: `global/exception`의 `ErrorCode` + `CustomException` 으로 던지고, `GlobalExceptionHandler` 에서 처리. 컨트롤러에서 try-catch로 응답을 직접 만들지 않는다
- **DTO**: 엔티티를 컨트롤러 응답으로 직접 반환하지 않는다. 요청은 `XxxRequest`, 응답은 `XxxResponse`
- **도메인 경계**: 다른 도메인의 repository를 직접 호출하지 않고 해당 도메인의 service를 통해 접근한다
- **비밀값**: API 키, DB 비밀번호, JWT 시크릿은 `application-local.yml` / `application-prod.yml` 에만 둔다 (둘 다 gitignore)
- **테스트**: 추천 시간 계산처럼 순수 로직은 단위 테스트를 함께 작성한다
- 네이밍: 클래스 PascalCase, 메서드·변수 camelCase, DB 테이블·컬럼 snake_case

## 6. 프론트엔드 규칙

- 모바일 우선. 기본은 모바일 폭으로 스타일링하고 Tailwind 반응형 접두사(`md:`, `lg:`)로 PC 확장
- `pages/` 의 화면 컴포넌트는 조합만 담당하고, UI·로직은 `features/` 에 둔다. 새 화면은 `app/router.tsx` 에 경로를 등록한다
- 카카오 지도 SDK는 스크립트 로드가 끝난 뒤에 지도를 생성한다 (`features/map` 에서 로드 로직을 한 곳에 모은다)
- API 호출은 반드시 `shared/api/client.ts` 의 axios 인스턴스를 거친다 (토큰 첨부·에러 처리 일원화)
- TypeScript: `any` 사용 금지. API 요청·응답 타입은 백엔드 DTO 이름과 맞춰 정의한다 (`CourseResponse` 등)
- 스타일은 Tailwind 우선. 클래스가 지나치게 길어지면 컴포넌트로 분리한다
- feature 간 직접 import는 최소화하고, 여러 곳에서 쓰는 것은 `shared/` 로 올린다
- 컴포넌트 파일은 PascalCase(`CourseCard.tsx`), 그 외는 camelCase(`recommendApi.ts`)
- 환경변수는 `VITE_` 접두사로 `.env.local` 에 두고 `import.meta.env.VITE_...` 로 읽는다 (예: `VITE_KAKAO_MAP_APP_KEY`). 새 변수는 `src/vite-env.d.ts` 와 `.env.example` 에도 추가한다
- `VITE_` 변수는 빌드 결과물에 그대로 들어가 누구나 볼 수 있다. 카카오 **REST API 키**, DB 비밀번호 같은 비밀값은 프론트에 두지 않는다 (지도용 JavaScript 키만 허용)

## 7. 도메인 용어

| 용어 | 의미 |
|---|---|
| 추천 유형 | `SINGLE`(단일 장소) / `COURSE`(코스) |
| 이동수단 | `TRANSIT`(대중교통) / `WALK`(도보) / `CAR`(차량) / `BIKE`(자전거) |
| 대분류 | 문화생활, 카페/디저트, 음식/맛집, 자연/휴식, 오락/체험, 쇼핑/구경, 스포츠활동, 관광/명소 (8개) |
| 세분류 | 대분류 하위 선택 항목 (예: 스포츠활동 → 당구). 선택 안 해도 됨 |
| 랜덤 추천 | 카테고리 미선택 시. 위치·시간·이동수단 조건은 동일하게 적용 |
| 총 소요시간 | 출발지→첫 장소 이동 + 장소별 예상 체류 + 장소 간 이동 + (도착지 있으면) 마지막 장소→도착지 이동 |

규칙: 단일은 대분류 최대 1개, 코스는 대분류 복수 선택 가능. 이용 시간은 최대 6시간. 코스라도 장소가 1곳일 수 있다.
위 enum 이름은 초안이며, 확정 시 이 표를 갱신한다.

### 영문 ↔ 한글 용어표

코드(클래스·변수·URL·DB)에는 아래 영문을 쓴다. 같은 개념에 다른 영어 단어를 쓰지 않는다 (예: 코스를 `route`, `plan` 으로 쓰지 않기).

| 영문 | 한글 | 쓰이는 곳 |
|---|---|---|
| member | 회원 | 백엔드 패키지, `member` 테이블 |
| place | 장소 | 백엔드 패키지 |
| recommend / recommendation | 추천 | 백엔드 패키지, 프론트 feature |
| course | 코스 (여러 장소를 순서대로 묶은 것) | 백엔드 패키지, `/api/courses` |
| admin | 관리자 | 백엔드 패키지, `/admin`, `/api/admin/...` |
| auth | 인증 (로그인·토큰) | `global/auth`, 프론트 feature |
| condition | 외출 조건 (출발지·시간·이동수단·카테고리) | 프론트 feature |
| map | 지도 | 프론트 feature |
| mypage | 마이페이지 | 프론트 feature |
| notice | 공지사항 | 관리자 기능 (초안) |
| notification | 전체 알림 | 관리자 기능 (초안) |
| category / subCategory | 대분류 / 세분류 | 추천 조건 (초안) |
| origin / destination | 출발지 / 도착지 | 추천 조건 (초안) |
| availableMinutes | 이용 가능 시간(분) | 추천 조건 (초안) |
| transportType | 이동수단 | 추천 조건 (초안) |
| stayMinutes | 장소 예상 체류시간(분) | 추천 결과 (초안) |
| travelMinutes | 이동시간(분) | 추천 결과 (초안) |
| totalMinutes | 총 소요시간(분) | 추천 결과 (초안) |
| visitOrder | 방문 순서 | 코스·지도 마커 (초안) |

대분류 8개의 영문 코드는 아직 정하지 않았다. ERD 담당(김하윤)과 정한 뒤 위 7장 표에 함께 적는다.
(초안)이 붙은 이름은 ERD·API 명세가 나오면 그 이름으로 맞추고 이 표를 고친다.

## 8. Git 규칙

- 브랜치: `main`(배포·시연) ← `develop`(통합) ← `feature/{도메인}-{기능}` (예: `feature/auth-login`, `feature/recommend-course-api`)
- `main`, `develop` 에 직접 push 금지. PR로만 머지하고 1명 이상 리뷰
- 커밋 메시지: `type: 내용` — `feat` 기능, `fix` 버그, `refactor`, `docs`, `test`, `chore`(설정·빌드), `style`(포맷)
  - 예: `feat: 코스 저장 API 추가`
- PR 제목은 커밋 규칙과 동일, 본문은 `.github/pull_request_template.md` 사용

## 9. AI 에이전트 작업 원칙

- 요청받은 범위 밖의 파일은 수정하지 않는다. 특히 **다른 담당자의 도메인 폴더와 `global/` 은 변경 전에 먼저 알린다**
- 큰 변경은 바로 코드를 쓰지 말고 계획(수정할 파일, 이유)을 먼저 제시한다
- 새 의존성 추가, DB 스키마 변경, 공통 응답·예외 형식 변경은 사람의 확인을 받는다
- 비밀값(API 키, 비밀번호, 토큰)을 코드·로그·커밋에 넣지 않는다
- 변경 후 가능한 경우 빌드와 테스트를 실행하고 결과를 알린다
- 확실하지 않은 요구사항은 추측하지 말고 `docs/` 를 확인하거나 질문한다
