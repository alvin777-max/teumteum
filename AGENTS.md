# 틈틈 (TeumTeum) — AI 에이전트 공통 가이드

이 파일은 이 저장소에서 작업하는 모든 AI 코딩 에이전트(Claude Code, Codex, Cursor, Copilot 등)와 팀원이 따르는 공통 규칙입니다.
규칙을 바꿀 때는 PR로 팀 합의 후 수정합니다.

## 1. 프로젝트 개요

틈틈은 **위치·시간 기반 즉흥 외출 추천 서비스**입니다.
사용자가 출발지, 이용 가능 시간(최대 6시간), 이동수단, 카테고리를 고르면 시간 안에 다녀올 수 있는 **코스**(장소 1곳 이상)를 추천합니다.
쓸 수 있는 시간이 짧으면 1곳, 길면 여러 곳을 방문 순서와 함께 넣습니다. (사용자가 단일/코스를 고르지 않음)

- 화면·기능의 기준 문서는 **[화면설계서 최종본 v2.0](docs/틈틈%20화면설계서.md)** (화면 14개, 결정 9건 확정) 이다. 이 파일과 다르면 화면설계서를 따르고 이 파일을 고친다
- 기능 목록·우선순위는 [요구사항 정의서](docs/requirements.md) 를 따른다
- 모바일 우선 설계, PC는 반응형으로 확장
- 비회원 이용 중심. 추천·탐색·상세·지도는 로그인 없이 이용하고, 코스 저장과 마이페이지에서만 로그인 요구 (로그인 후 원래 흐름으로 복귀)
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
| 외부 API | 카카오 로컬(장소 검색), 카카오 지도 JS SDK, TourAPI(사진·소개·운영시간), KOPIS(공연)·문화포털(전시), 이동시간: 카카오모빌리티(차량)·OpenRouteService(도보)·ODsay(대중교통), SMTP(비밀번호 찾기 메일) | 화면설계서 v2.0 기준 |
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
│   ├── recommend/   # 소요시간 계산, 장소 추천 (나혜빈)
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
| 나혜빈 | 추천 로직(체류·이동·총 소요시간), 추천 API, 추천 결과·결과 상세 |
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
| `backend/.../course` | 코스 저장 | 김하윤 |
| `backend/.../admin` | 관리자 | 정종화 |
| `frontend/src/app`, `shared/` | 라우터, 공통 레이아웃·API 클라이언트 | 김용현 |
| `frontend/src/features/auth` | 로그인·회원가입 화면 | 김용현 |
| `frontend/src/features/condition` | 외출 조건·카테고리 선택 화면 | 정종일 |
| `frontend/src/features/recommend` | 추천 결과·결과 상세 화면 | 나혜빈 |
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
- 로그인 상태는 `shared/auth/authStore.ts`, 회원 전용 화면은 `app/router.tsx` 에서 `RequireAuth` 로 감싼다
- API 연동 전 화면 확인용 목업은 각 feature의 `mock.ts` 에 모으고 `[임시]` 주석을 단다. 연동 후 삭제한다

### 화면 ID ↔ 라우트 (화면설계서 v2.0)

| 화면 ID | 화면 | 경로 | 담당 |
|---|---|---|---|
| HOM-01 | 홈 / 바로 추천 | `/` | 유지수(지도)·김용현(하단바) |
| HOM-02 | 주변 장소 탐색 (홈 위 바텀시트) | `/nearby` | 유지수·정종일(장소 API) |
| CON-01 | 외출 조건 설정 | `/condition` | 정종일 |
| CON-02 | 위치 설정 | `/condition/location?type=origin\|destination` | 정종일 |
| RES-01 | 추천 결과 목록 | `/results` | 나혜빈 |
| DET-01 | 추천 결과 상세 | `/results/:courseId` (홈 검색·주변 탐색의 장소 1곳짜리 상세는 `/results/place-{placeId}`) | 나혜빈 |
| DET-02 | 코스 지도 상세 | `/results/:courseId/map`, `/mypage/courses/:courseId/map` | 유지수 |
| DET-03 | 장소 교체 | `/results/:courseId/replace/:placeId` | 나혜빈 |
| MY-01 | 마이페이지 | `/mypage` | 김하윤 |
| MY-02 | 저장한 코스 목록 | `/mypage/courses` (회원 전용) | 김하윤 |
| MY-03 | 저장한 코스 상세 | `/mypage/courses/:courseId` (회원 전용) | 김하윤 |
| MY-04 | 회원 정보 수정·탈퇴 | `/mypage/edit` (회원 전용) | 김하윤 |
| AUT-01 | 로그인 | `/login` | 김용현 |
| AUT-02 | 회원가입 | `/signup` | 김용현 |

하단바(홈·주변 탐색·저장한 코스·로그인/마이)는 HOM-01, HOM-02 에만 고정한다.

## 7. 도메인 용어

| 용어 | 의미 |
|---|---|
| 이동수단 | `TRANSIT`(대중교통) / `WALK`(도보) / `CAR`(차량). 기본값 대중교통 |
| 이용 시간 | 이동 포함 쓸 수 있는 총 시간. 시작 시각(30분 단위) + 0분·30분·1~6시간 8단계 슬라이더, 종료 시각 자동 계산. **0분 = 시간 제한 없음** |
| 카테고리 선택 | `DIRECT`(직접 선택, 대분류 최대 3개) / `RANDOM`(랜덤 추천, 조건 안에서 무작위). 직접 선택에서 아무것도 안 고르면 랜덤 |
| 대분류 | 문화생활, 카페/디저트, 음식/맛집, 자연/휴식, 오락/체험, 쇼핑/구경, 스포츠활동, 관광/명소 (8개) |
| 세분류 | 대분류 하위 항목. 조건 설정에서는 고르지 않고 추천 결과 화면의 필터로만 쓴다. 랜덤이면 결과 장소들의 세분류로 표시 |
| 코스 | 추천 결과 1건. 장소 1곳 이상(최대 4곳) + 방문 순서 + 장소 간 이동시간. 한 번에 3개 추천, 2시간 보관 |
| 총 소요시간 | 출발지→첫 장소 이동 + 장소별 예상 체류 + 장소 간 이동 + (도착지 있으면) 마지막 장소→도착지 이동 |
| 다시 추천 | 같은 조건으로 다른 조합을 추천 (랜덤도 동일). 너무 자주 누르면 잠시 후 다시 시도 안내 |
| 장소 교체 | 코스 안의 한 장소만 같은 카테고리 후보(5곳 정도, 앞뒤 장소와 가까운 순)로 바꾸고 바뀐 구간만 재계산. 이용 시간을 넘으면 경고 |
| 코스 저장 | 코스를 통째로 저장 (회원 전용). 저장한 코스는 저장 시점 정보로 표시하고 '정보 새로고침'을 누를 때만 외부 API 재조회. 장소 교체 불가 |

규칙 (화면설계서 v2.0):
- 출발지 필수(기본값 현재 위치), 도착지 선택. 추천받기는 출발지와 시간이 있어야 활성
- 사용자가 단일/코스를 고르지 않는다. 장소 수 상한은 이용 시간으로 정한다: 1시간 이하 1곳 · 3시간까지 최대 2곳 · 5시간까지 최대 3곳 · 그 이상과 0분(제한 없음) 최대 4곳
- 체류시간은 세분류별 예상 체류시간 표(화면설계서 RES-01)를 쓴다
- 도착지를 비우면 출발지 주변에서 끝나는 코스. 돌아오는 시간은 계산하지 않는다
- 이동시간 API는 고른 이동수단 하나만 호출한다. 실패하면 직선거리로 계산하고 '예상 시간'으로 표시
- 세분류 확정 목록: 문화생활(전시·영화·공연·책방), 카페/디저트(카페·베이커리·디저트), 음식/맛집(한식·양식·일식·중식·분식), 자연/휴식(공원·산책로·한강), 오락/체험(방탈출·보드게임·공방·노래방), 쇼핑/구경(소품샵·팝업스토어·시장·백화점), 스포츠활동(당구·볼링·클라이밍), 관광/명소(랜드마크·고궁·전망대)
- 로그인은 이메일·비밀번호 방식(JWT)만 제공한다. 소셜 로그인 없음. 비밀번호 찾기는 가입 이메일로 재설정 링크 발송
- 외부 지도 앱 길찾기 연동은 범위에서 제외 (정보가 없는 장소의 '카카오맵에서 보기' 링크만 제공)
- 지도 경로: 차량·도보는 실제 경로, 대중교통은 1차 버전에서 장소 사이 직선

화면설계서 v2.0 결정 사항 9건은 모두 확정됐다 (위 규칙에 반영). 개발하면서 확인할 것: 세분류 키워드로 실제 검색 결과가 잘 나오는지, 체류·이동시간 추정값을 실측과 비교해 보정, 각 API 무료 한도와 약관(데이터 보관 기간).

위 enum 이름은 초안이며, 확정 시 이 표를 갱신한다.

### 영문 ↔ 한글 용어표

코드(클래스·변수·URL·DB)에는 아래 영문을 쓴다. 같은 개념에 다른 영어 단어를 쓰지 않는다 (예: 코스를 `route`, `plan` 으로 쓰지 않기).

| 영문 | 한글 | 쓰이는 곳 |
|---|---|---|
| member | 회원 | 백엔드 패키지, `member` 테이블 |
| place | 장소 | 백엔드 패키지 |
| recommend / recommendation | 추천 | 백엔드 패키지, 프론트 feature |
| course | 코스 (추천 결과 1건, 저장 단위) | 백엔드 패키지, `/api/courses`, 프론트 `Course` 타입 |
| categoryMode | 카테고리 선택 방식 (직접/랜덤) | 추천 조건 (초안) |
| startTime | 시작 시각 | 추천 조건 (초안) |
| replace | 장소 교체 | 결과 상세 (초안) |
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

### 브랜치

- 구조: `main`(배포·시연) ← `dev`(통합) ← 작업 브랜치
- `main`, `dev` 는 GitHub 규칙으로 보호된다: 직접 push·강제 push·삭제 불가, PR 승인 1명 이상 필요
- 작업 브랜치 이름: `{작업코드}/{type}/{이슈번호}-{도메인}-{기능}`
  - type: `feature` 기능, `fix` 버그, `refactor`, `docs`, `chore`(설정·빌드)
  - 이슈번호는 `#` 없이 숫자만 쓴다 (터미널에서 `#` 은 주석으로 처리됨)
- **협업 순서: 이슈 → 브랜치 → PR → 머지 → 이슈·브랜치 닫힘.** 이슈 없이 작업하지 않는다
  1. 이슈 생성 (템플릿 선택 → 라벨 자동)
  2. 이슈 화면 Development → Create a branch 로 최신 `dev` 에서 브랜치 생성 (이름은 아래 규칙대로 고쳐 쓴다)
  3. 작업·커밋 후 `dev` 로 PR (본문에 `close #이슈번호`)
  4. 리뷰 승인 → Squash 머지
  5. 머지되면 이슈는 자동으로 닫히고, 브랜치는 자동 삭제된다

### 작업코드

작업코드 = **작업 영역** + **팀원 번호**. 브랜치 이름과 커밋·PR 제목 맨 앞에 붙인다.

| 영역 | 의미 |
|---|---|
| `be` | 백엔드 (`backend/`) 작업 |
| `fe` | 프론트엔드 (`frontend/`) 작업 |

| 번호 | 팀원 | 백엔드 | 프론트 |
|---|---|---|---|
| 01 | 김용현 | `be01` | `fe01` |
| 02 | 정종일 | `be02` | `fe02` |
| 03 | 나혜빈 | `be03` | `fe03` |
| 04 | 유지수 | `be04` | `fe04` |
| 05 | 김하윤 | `be05` | `fe05` |
| 06 | 정종화 | `be06` | `fe06` |

- 백엔드·프론트를 둘 다 건드리면 **주로 작업한 쪽** 코드를 쓴다. 가능하면 백엔드와 프론트 PR을 나눈다
- 문서·설정(`docs/`, 루트 파일)만 바꾸면 더 관련 있는 쪽 코드를 쓴다

예시:

| 작업 | 브랜치 | 커밋·PR 제목 |
|---|---|---|
| 김용현 · 로그인 API | `be01/feature/12-auth-login` | `[be01] feat: 로그인 API 추가` |
| 김용현 · 로그인 화면 | `fe01/feature/13-auth-login-page` | `[fe01] feat: 로그인 화면 구현` |
| 정종일 · 장소 검색 API | `be02/feature/14-place-search` | `[be02] feat: 카카오 장소 검색 API 연동` |
| 정종일 · 조건 선택 화면 | `fe02/feature/15-condition-form` | `[fe02] feat: 조건 선택 화면 구현` |
| 나혜빈 · 소요시간 계산 | `be03/feature/16-recommend-time` | `[be03] feat: 총 소요시간 계산 로직 추가` |
| 유지수 · 지도 마커 버그 | `fe04/fix/23-map-marker` | `[fe04] fix: 순번 마커 위치 오류 수정` |
| 김하윤 · ERD 문서 | `be05/docs/30-erd` | `[be05] docs: ERD 초안 추가` |
| 정종화 · 공지사항 API | `be06/feature/31-admin-notice` | `[be06] feat: 공지사항 등록 API 추가` |

### 커밋

- 커밋 메시지: `[작업코드] type: 내용` — `feat` 기능, `fix` 버그, `refactor`, `docs`, `test`, `chore`(설정·빌드), `style`(포맷)
  - 예: `[be05] feat: 코스 저장 API 추가`

### 이슈·PR

- 이슈는 템플릿(기능 / 버그 / 개선·리팩터링 / 문서 / 설정·기타)으로만 만든다. 템플릿을 고르면 라벨이 자동으로 붙는다
- 이슈 제목: `[작업코드] 할 일` (예: `[be01] 로그인 API 구현`). 버그는 고칠 사람의 작업코드
- 이슈 라벨: `feature` 신규 기능, `bug` 오류 수정, `enhancement` 기존 기능 개선, `refactor` 코드 개선, `docs` 문서, `chore` 환경 설정·기타
- PR 대상은 `dev`. `dev` → `main` 은 시연·배포할 때만
- 머지 방식: 작업 브랜치 → `dev` 는 **Squash merge**, `dev` → `main` 은 **Merge commit** (GitHub 규칙으로 고정됨). 머지된 작업 브랜치는 자동 삭제된다
- Squash merge 시 PR 제목이 `dev` 의 커밋 메시지가 되므로, PR 제목을 커밋 규칙(`[be01] feat: ...`)에 맞춘다
- 리뷰 댓글(conversation)을 모두 해결해야 머지할 수 있다
- PR 제목은 커밋 규칙과 동일, 본문은 `.github/pull_request_template.md` 사용. 본문에 `close #이슈번호` 를 적어 머지 시 이슈가 자동으로 닫히게 한다
- 기능 하나에 PR 하나. 다른 담당자의 도메인이나 `global/` 을 수정했으면 그 담당자에게 리뷰를 요청한다
- PR 올리기 전에 최신 `dev` 를 내 브랜치에 합쳐 충돌을 먼저 해결한다
- 승인 후 새 커밋을 push하면 기존 승인이 취소되므로 다시 승인받는다

## 9. AI 에이전트 작업 원칙

- 요청받은 범위 밖의 파일은 수정하지 않는다. 특히 **다른 담당자의 도메인 폴더와 `global/` 은 변경 전에 먼저 알린다**
- 큰 변경은 바로 코드를 쓰지 말고 계획(수정할 파일, 이유)을 먼저 제시한다
- 새 의존성 추가, DB 스키마 변경, 공통 응답·예외 형식 변경은 사람의 확인을 받는다
- 비밀값(API 키, 비밀번호, 토큰)을 코드·로그·커밋에 넣지 않는다
- 변경 후 가능한 경우 빌드와 테스트를 실행하고 결과를 알린다
- 확실하지 않은 요구사항은 추측하지 말고 `docs/` 를 확인하거나 질문한다
