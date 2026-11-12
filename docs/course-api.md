# 저장 코스 API 명세 (초안)

> 담당: 김하윤 · 작성일: 2026-11-12 · 저장·목록·상세·삭제·최신 정보 조회 5개 API의 초안입니다.
> 기준: [REQ-030/031/032](requirements.md#15-코스-저장-및-관리)와 사용자 결정인 '저장본 유지·최신 정보 별도 표시' 정책.
> URL·DTO·오류 코드 등 연동 항목은 팀 확인 전 제안안입니다. 실제 API·스키마가 구현됐거나 공통 응답 형식이 확정됐다는 뜻은 아닙니다.

## API 목록

| 기능 | Method | URL | 성공 상태 | 응답 데이터 DTO |
|---|---|---|---|---|
| 추천 코스 저장 | POST | `/api/courses` | 신규 201, 기존 저장본 반환 200 | `CourseSaveResponse` |
| 내 저장 코스 목록 | GET | `/api/courses?page=0&size=20` | 200 | `CourseListResponse` |
| 내 저장 코스 상세·지도 | GET | `/api/courses/{courseId}` | 200 | `CourseResponse` |
| 내 저장 코스 삭제 | DELETE | `/api/courses/{courseId}` | 200 | `CourseDeleteResponse` |
| 최신 장소 정보 별도 조회 | GET | `/api/courses/{courseId}/places/latest` | 200 | `CourseLatestPlacesResponse` |

## 공통 규칙

- 모든 API는 JWT 인증이 필요하다. 서버는 인증 계층이 확인한 회원 ID로 소유자를 판단하며, 요청에서 `memberId`를 받지 않는다. 탈퇴 회원의 접근도 인증 계층에서 차단한다.
- 목록은 본인 코스만 반환한다. 상세·삭제·최신 조회는 없는 코스와 다른 회원의 코스에 동일한 `404 COURSE_NOT_FOUND`를 반환한다. 소유권을 확인하기 전에 외부 장소 API를 호출하지 않는다.
- `courseId`, `coursePlaceId`, `placeId`는 DB `BIGINT`에 대응하는 **양의 십진 정수 문자열**로 제안한다. 요청 ID는 Java `Long`의 양수 범위로 검증한다. 형식·범위 오류는 400, 유효한 형식이지만 없는 ID는 404다.
- 시각은 오프셋을 포함한 ISO 8601 문자열, 출발 시각은 `HH:mm`, 시간 길이는 분 단위 정수다. DB 시각의 저장·변환 기준은 팀 공통 설정과 맞춘다.
- 응답 필드가 선택 정보이면 없을 때 `null`, 목록이면 `[]`를 사용한다. 필드 타입에서 null을 허용하지 않으면 반드시 값을 제공한다.
- 실제 성공·실패 응답은 공통 `ApiResponse`를 따른다. **이 문서의 성공 JSON은 공통 응답 내부의 업무 DTO 예시**다. 바깥 JSON 구조와 오류 응답 구조는 공통 담당자와 확정한다.
- 아래 오류 코드 이름은 공통 `ErrorCode` 반영 전 제안안이다. 민감 정보와 외부 API·DB 오류 원문은 반환하지 않는다.
- 회원별 응답과 최신 조회 응답은 `Cache-Control: no-store`를 제안한다. 프론트 요청은 `shared/api/client.ts`를 사용한다.
- 기본 목록·상세·지도는 저장 당시 정보를 사용한다. 최신 정보 조회는 사용자가 누를 때만 실행하고 저장본·일정·지도 데이터를 덮어쓰거나 재계산하지 않는다.

회원 정보 수정·탈퇴, 추천 생성·교체, 장소 검색 API는 이 문서의 범위에 포함하지 않는다.

## 1. 추천 코스 저장

### 1.1 기본 정보

| 항목 | 내용 |
|---|---|
| 설명 | 로그인한 회원이 선택한 추천 코스를 저장한다. |
| 요구사항 | [REQ-030](requirements.md#15-코스-저장-및-관리) |
| 화면 | DET-01 추천 결과 상세의 '이 코스 저장' 버튼 |
| Method | `POST` |
| URL | `/api/courses` |
| 인증 | 필수: JWT Bearer 토큰 |
| 요청 DTO | `CourseSaveRequest` |
| 응답 DTO | `CourseSaveResponse` (공통 `ApiResponse`로 감쌈) |

### 1.2 요청

**요청 헤더**

```http
POST /api/courses
Authorization: Bearer <accessToken>
Content-Type: application/json
```

- `Authorization`: 로그인 토큰을 전달한다. 서버가 토큰을 검증한 뒤 로그인 회원을 확인한다.
- `Content-Type`: 요청 본문을 JSON 형식으로 보낸다는 뜻이다.

**요청 본문 — `CourseSaveRequest`**

```json
{
  "recommendationId": "rec-123"
}
```

| 필드 | 타입 | 필수 | 설명·검증 |
|---|---|---|---|
| `recommendationId` | string | O | 저장할 추천 코스 1건의 불변 버전 ID. 빈 문자열·공백 불가. ID 형식·최대 길이는 추천 담당자와 확정한다. |

`recommendationId`는 예시 필드명이다. 한 번에 추천한 코스 3개 전체가 아니라 **사용자가 선택한 코스 1개**를 가리킨다. 장소 교체로 내용이 바뀌면 바뀐 버전을 구분할 수 있어야 한다.

회원 ID는 본문으로 받지 않고 인증 계층이 확인한 값으로 결정한다. 장소 목록·이동시간도 프론트가 보낸 값을 그대로 저장하지 않고, 서버에 보관된 추천 결과를 조회해 사용한다.

### 1.3 성공 응답

**HTTP 상태: `201 Created`** — 저장 코스가 새로 생성됐다는 뜻이다.

응답 헤더: `Location: /api/courses/42`

아래 JSON은 **공통 `ApiResponse`가 담을 데이터 부분인 `CourseSaveResponse`**다. 실제 HTTP 응답 전체의 바깥 구조는 공통 응답 담당자가 정한 형식에 맞춘다.

```json
{
  "courseId": "42",
  "courseName": "틈카페 → 산책공원",
  "createdAt": "2026-11-12T10:00:00+09:00",
  "created": true
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `courseId` | string | 새로 저장한 코스의 ID. DB `BIGINT`는 JSON에서 십진 문자열로 전달하는 안이다. |
| `courseName` | string | 저장 당시 코스명 |
| `createdAt` | string | 저장 시각. 시간대 오프셋을 포함한 ISO 8601 형식 |
| `created` | boolean | 이번 요청으로 새로 저장했다면 `true`, 기존 저장본을 반환했다면 `false` |

**중복 저장 제안**: 같은 회원이 같은 추천 버전을 다시 저장하면 새 코스를 만들지 않고 `200 OK`로 기존 저장본을 반환한다. 응답 필드는 같고 `created`만 `false`다. 기존 ID·코스명·저장 시각은 유지한다. 동시 요청도 저장본 1개로 처리할 수 있도록 서버의 중복 방지 구조가 필요하다.

`recommendationId`는 저장 대상을 찾는 ID이고, `courseId`는 저장이 끝난 뒤 저장 코스를 찾는 ID다. 저장 후에는 `courseId`로 상세 조회·삭제를 요청한다.

### 1.4 실패 응답

오류 응답도 공통 `ApiResponse`와 공통 예외 처리를 따른다. 아래 코드 이름은 `ErrorCode` 반영 전 제안안이다.

| HTTP 상태 | 제안 오류 코드 | 발생 상황 | 화면 처리 |
|---|---|---|---|
| 400 | `INVALID_REQUEST` | 추천 ID가 없거나 형식이 잘못됨 | 요청 확인 안내 |
| 401 | `UNAUTHORIZED` | 로그인하지 않았거나 토큰이 만료·무효임 | 로그인 후 저장 흐름으로 복귀 |
| 404 | `RECOMMENDATION_NOT_FOUND` | 추천 결과가 없거나 해당 결과에 접근할 수 없음 | 결과를 찾을 수 없다는 안내 |
| 410 | `RECOMMENDATION_EXPIRED` | 서버가 추천 결과의 2시간 만료를 확인함 | 다시 추천 안내 |
| 409 | `RECOMMENDATION_NOT_SAVEABLE` | 추천 결과의 장소·좌표·일정 등이 유효하지 않아 저장할 수 없음 | 다시 추천 안내 |
| 500 | `INTERNAL_SERVER_ERROR` | DB 저장 등 서버 처리 실패 | 저장 실패 안내, 재시도 가능 |

존재하지 않는 ID의 만료 이력까지 확인할 수 없다면 `404`로 처리한다. 응답에 토큰·비밀번호·외부 API 키·DB 오류 원문은 포함하지 않는다.

### 1.5 서버 처리 순서

1. 토큰을 검증해 로그인 회원을 확인하고 요청 본문을 검증한다.
2. 같은 회원이 같은 추천 버전을 저장한 기록이 있으면 기존 저장본을 반환한다. 이미 저장된 결과는 원래 추천이 나중에 만료돼도 기존 저장본을 반환할 수 있다.
3. 신규 저장이면 추천 도메인의 서비스를 통해 선택한 추천 결과의 접근 권한·존재·만료 여부를 확인한다.
4. 장소 1~4개, 방문 순서·좌표·체류 및 이동시간이 유효한지 확인한다.
5. 코스와 장소 정보·일정을 저장 시점 복사본(스냅샷)으로 함께 저장한다. 저장 직전에 외부 API를 재조회해 선택했던 내용을 바꾸지 않는다.
6. 저장이 모두 성공하면 `201` 응답을 보낸다. 중간에 실패하면 일부만 저장되지 않도록 전체 저장을 취소한다.

코스와 장소를 함께 성공시키거나 함께 취소하는 처리를 트랜잭션이라고 한다. 공용 장소 정보가 나중에 바뀌어도 이 저장본은 유지한다.

### 1.6 프론트 처리

- 비회원은 선택한 추천 버전 ID와 저장 의도를 보존하고 로그인 화면으로 이동한다. 로그인 후 추천 상세로 복귀해 저장을 요청한다.
- `201` 또는 `200` 응답 후 현재 추천 상세를 유지하며 '저장됨 · 저장한 코스 보기' 토스트를 표시한다. 링크를 누르면 `/mypage/courses`로 이동한다.
- 실패하면 저장 완료 상태로 바꾸지 않고 상태 코드에 맞는 안내를 표시한다.
- API 호출은 `shared/api/client.ts`의 axios 인스턴스를 사용한다. 해당 인스턴스가 토큰 헤더를 첨부한다.

### 1.7 구현 전 함께 확정할 항목

| 항목 | 확인할 내용 | 담당 |
|---|---|---|
| 추천 결과 ID | `recommendationId`의 실제 이름·형식, 선택한 코스 버전 구분, 만료 확인, 로그인 전 추천 결과의 로그인 후 접근 검증 | 나혜빈·김용현·김하윤 |
| 공통 응답·오류 | `ApiResponse`의 실제 JSON 구조와 `ErrorCode` 이름, 인증 계층의 회원 ID 전달 방식 | 정종일·김용현·김하윤 |
| 저장 구조 | 장소 스냅샷·추천 버전 ID 저장 위치, 회원별 중복 저장 방지, 좌표·경로 보관 | 김하윤·정종일·나혜빈·유지수 |
| 장소 1곳 상세 | 홈 검색·주변 탐색의 `place-{placeId}` 목업 ID를 서버가 검증한 저장 대상 ID로 연결하는 방식 | 정종일·나혜빈·김하윤 |

현재 백엔드에는 저장 API·공통 응답이 구현돼 있지 않고, ERD에도 장소 스냅샷 필드가 없다. 이 문서는 구현 전 계약 초안이며 DB 스키마나 공통 형식을 변경하지 않는다.

## 2. 내 저장 코스 목록 조회

### 2.1 기본 정보·요청

| 항목 | 내용 |
|---|---|
| 요구사항·화면 | REQ-031 · MY-02 저장한 코스 목록, MY-01 저장 건수 |
| Method·URL | `GET /api/courses` |
| 인증 | 필수 |
| 요청 본문 | 없음 |
| 응답 DTO | `CourseListResponse` |

```http
GET /api/courses?page=0&size=20
Authorization: Bearer <accessToken>
```

| 쿼리 파라미터 | 타입 | 기본값 | 검증 |
|---|---|---|---|
| `page` | integer | 0 | 0부터 시작, Java `Integer` 범위의 0 이상 정수 |
| `size` | integer | 20 | 1~50 |

정렬은 `created_at DESC, course_id DESC`로 고정한다. 저장 시각이 같은 코스도 ID로 순서를 정한다. 회원 ID·정렬 조건은 요청으로 받지 않는다.

### 2.2 성공 응답

`200 OK` · `CourseListResponse`:

```json
{
  "content": [
    {
      "courseId": "42",
      "sourceRecommendationId": "rec-123",
      "courseName": "틈카페 → 산책공원",
      "placeCount": 2,
      "totalMinutes": 130,
      "createdAt": "2026-11-12T10:00:00+09:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "hasNext": false
}
```

| `CourseListResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `content` | CourseSummaryResponse[] | 현재 페이지의 코스 요약 |
| `page`, `size` | integer | 요청 페이지·한 페이지 크기 |
| `totalElements` | integer | 본인의 저장 코스 전체 건수 |
| `totalPages` | integer | `ceil(totalElements / size)`, 전체 0건이면 0 |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

| `CourseSummaryResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `courseId` | string | 저장 코스 ID |
| `sourceRecommendationId` | string | 저장에 사용한 추천 코스의 불변 버전 ID |
| `courseName` | string | 저장 당시 코스명 |
| `placeCount` | integer | 저장 장소 수, 1~4 |
| `totalMinutes` | integer | 저장 당시 총 소요시간(분) |
| `createdAt` | string | 저장 시각 |

저장한 코스가 없을 때도 `200`을 반환한다.

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "hasNext": false
}
```

마지막 페이지를 넘긴 요청도 빈 `content`와 실제 전체 건수·페이지 수, `hasNext: false`를 반환한다. MY-01의 저장 건수는 `size=1` 조회의 `totalElements`를 활용할 수 있다.

### 2.3 처리·오류·화면

- 본인 코스의 저장본만 조회하며 외부 API를 호출하지 않는다. 목록을 만들 때 코스마다 장소 전체를 별도 조회하지 않도록 요약 조회·집계를 설계한다.
- `400 INVALID_REQUEST`: 페이지·크기 형식 또는 범위 오류. `401 UNAUTHORIZED`: 인증 오류. `500 INTERNAL_SERVER_ERROR`: 서버 조회 실패.
- 전체 0건이면 '아직 저장한 코스가 없어요'와 `/condition` 이동 버튼을 표시한다. 페이지가 비었다는 이유만으로 전체 저장 코스가 없다고 판단하지 않고 `totalElements`를 확인한다.
- 카드 선택 시 저장 `courseId`로 `/mypage/courses/{courseId}`에 진입한다. 페이지 추가 로딩 중 오류가 나면 기존 목록을 유지한다.

## 3. 내 저장 코스 상세·지도 조회

### 3.1 기본 정보·요청

| 항목 | 내용 |
|---|---|
| 요구사항·화면 | REQ-031 · MY-03 저장 코스 상세, 저장 코스 DET-02 지도 |
| Method·URL | `GET /api/courses/{courseId}` |
| 인증 | 필수, 본인 코스 |
| Path 변수 | `courseId`: 양의 십진 정수 문자열 |
| 요청 본문·쿼리 | 없음 |
| 응답 DTO | `CourseResponse` |

```http
GET /api/courses/42
Authorization: Bearer <accessToken>
```

### 3.2 성공 응답

`200 OK` · `CourseResponse` (장소·주소·좌표는 설명용 예시):

```json
{
  "courseId": "42",
  "sourceRecommendationId": "rec-123",
  "courseName": "틈카페 → 산책공원",
  "createdAt": "2026-11-12T10:00:00+09:00",
  "origin": {"name": "출발지", "address": null, "latitude": 37.544, "longitude": 127.055},
  "destination": null,
  "transportType": "WALK",
  "startTime": "13:00",
  "totalMinutes": 130,
  "totalTravelMinutes": 25,
  "finalTravelMinutes": 0,
  "estimated": true,
  "places": [
    {
      "coursePlaceId": "501", "placeId": "101", "visitOrder": 1,
      "placeName": "틈카페", "category": "CAFE", "subCategory": "카페",
      "address": "예시 주소 1", "latitude": 37.5475, "longitude": 127.061,
      "imageUrl": null, "description": null, "openingHours": null,
      "stayMinutes": 60, "travelMinutes": 15, "transitInfo": null
    },
    {
      "coursePlaceId": "502", "placeId": "102", "visitOrder": 2,
      "placeName": "산책공원", "category": "NATURE", "subCategory": "공원",
      "address": "예시 주소 2", "latitude": 37.549, "longitude": 127.063,
      "imageUrl": null, "description": null, "openingHours": null,
      "stayMinutes": 45, "travelMinutes": 10, "transitInfo": null
    }
  ],
  "routeLegs": [
    {"fromVisitOrder": 0, "toVisitOrder": 1, "pathType": "STRAIGHT", "coordinates": [{"latitude": 37.544, "longitude": 127.055}, {"latitude": 37.5475, "longitude": 127.061}]},
    {"fromVisitOrder": 1, "toVisitOrder": 2, "pathType": "STRAIGHT", "coordinates": [{"latitude": 37.5475, "longitude": 127.061}, {"latitude": 37.549, "longitude": 127.063}]}
  ]
}
```

| `CourseResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `courseId`, `sourceRecommendationId`, `courseName`, `createdAt` | string | 저장 ID·원본 추천 버전 ID·저장 코스명·저장 시각 |
| `origin` | CourseLocationResponse | 저장 당시 출발지 |
| `destination` | CourseLocationResponse 또는 null | 저장 당시 도착지, 설정하지 않았다면 null |
| `transportType` | string | `TRANSIT`, `WALK`, `CAR` |
| `startTime` | string | 저장한 출발 시각, `HH:mm` |
| `totalMinutes` | integer | 저장 당시 총 소요시간(분) |
| `totalTravelMinutes` | integer | 저장 당시 이동시간 합계(분) |
| `finalTravelMinutes` | integer | 마지막 장소→도착지 이동시간(분), 도착지가 없으면 0 |
| `estimated` | boolean | 이동시간 API 실패 후 추정한 시간 값이 포함됐는지 여부 |
| `places` | CoursePlaceResponse[] | 방문 순서대로 정렬된 저장 장소 1~4개 |
| `routeLegs` | CourseRouteLegResponse[] | 저장 당시 지도 경로 |

`CourseLocationResponse`: `name: string 또는 null`, `address: string 또는 null`, `latitude: number`, `longitude: number`. 이름이 없으면 UI에서 출발·도착 위치 기본 문구를 표시한다. 도착지 자체가 null이면 도착지 표시를 생략한다.

| `CoursePlaceResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `coursePlaceId` | string | 저장 코스 안의 장소 항목 ID, 최신 조회 결과 대응에 사용 |
| `placeId` | string | 공용 장소 ID, 최신 조회 연결에 사용 |
| `visitOrder` | integer | 1부터 연속되는 방문 순서 |
| `placeName` | string | 저장 당시 장소명 |
| `category`, `subCategory` | string | 저장 당시 대분류 코드·세분류 이름 |
| `address` | string 또는 null | 저장 당시 주소 |
| `latitude`, `longitude` | number | 저장 당시 WGS84 좌표. 위도 -90~90, 경도 -180~180 |
| `imageUrl`, `description`, `openingHours` | string 또는 null | 저장 당시 사진 URL·소개·운영시간 |
| `stayMinutes` | integer | 장소 체류시간(분), 0 이상 |
| `travelMinutes` | integer | 직전 지점→이 장소 이동시간(분), 0 이상. 첫 장소는 출발지에서 이동 |
| `transitInfo` | string 또는 null | 저장 당시 대중교통 노선·환승 표시 정보 |

대분류 코드 초안은 `CULTURE`, `CAFE`, `FOOD`, `NATURE`, `ENTERTAINMENT`, `SHOPPING`, `SPORTS`, `TOURISM`이다. ERD·추천·프론트와 함께 확정한다.

`CourseRouteLegResponse` 제안:

- `fromVisitOrder`, `toVisitOrder`: integer. 출발지 0, 장소 1~N, 도착지가 있으면 N+1이다. 출발→첫 장소→다음 장소→도착 순서로 구간을 제공한다.
- `pathType`: string. `ACTUAL`은 저장된 실제 경로, `STRAIGHT`는 저장된 직선 표시 경로다.
- `coordinates`: CourseCoordinateResponse[] (`latitude: number`, `longitude: number`). 진행 방향 순서의 유효한 좌표 2개 이상이다.
- 차량·도보는 저장 당시 실제 경로를 우선한다. API 실패 시 저장한 직선 대체 경로를 사용한다. 대중교통 1차 버전은 직선 표시이며, 직선 표시 자체가 이동시간 추정 실패를 뜻하지는 않는다.

`totalTravelMinutes = sum(places.travelMinutes) + finalTravelMinutes`, `totalMinutes = sum(places.stayMinutes) + totalTravelMinutes`다. 예시는 이동 25분과 체류 105분을 합한 130분이다. 방문 시각은 저장된 `startTime`과 시간 값으로 계산한다.

### 3.3 처리·오류·화면

- 공용 `place`·카테고리 갱신이나 원래 추천 결과의 만료와 관계없이 저장본을 반환한다. 사진 URL 보관은 URL 문자열 보관이며 이미지 파일 자체의 영구 보존을 의미하지 않는다.
- 외부 장소·이동 경로 API를 호출하지 않는다. 일정·지도·코스명은 저장본을 사용한다. 최신 조회 DTO를 이 응답에 병합하지 않는다.
- `400 INVALID_REQUEST`: ID 형식·범위 오류. `401 UNAUTHORIZED`: 인증 오류. `404 COURSE_NOT_FOUND`: 없거나 다른 회원의 코스. `500 INTERNAL_SERVER_ERROR`: 서버 조회 실패.
- '저장 시점 정보'를 표시하고 장소 교체 버튼은 제공하지 않는다. 지도 화면도 같은 응답의 저장 좌표·경로를 사용한다.
- 기존 프론트 `Course` 타입의 `name`·`lat`·`lng`와 이 초안의 `placeName`·`latitude`·`longitude`는 연동 시 어댑터에서 매핑한다. `routeLegs` 지원과 원본 추천 ID 보관 방식은 후속 합의가 필요하다.

## 4. 내 저장 코스 삭제

### 4.1 기본 정보·요청

| 항목 | 내용 |
|---|---|
| 요구사항·화면 | REQ-032 · MY-02 목록, MY-03 상세 |
| Method·URL | `DELETE /api/courses/{courseId}` |
| 인증 | 필수, 본인 코스 |
| Path 변수 | `courseId`: 양의 십진 정수 문자열 |
| 요청 본문·쿼리 | 없음 |
| 응답 DTO | `CourseDeleteResponse` |

```http
DELETE /api/courses/42
Authorization: Bearer <accessToken>
```

### 4.2 성공 응답

`200 OK` · `CourseDeleteResponse` (공통 응답으로 감쌈):

```json
{
  "courseId": "42",
  "deleted": true
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `courseId` | string | 삭제한 저장 코스 ID |
| `deleted` | boolean | 성공이면 true |

### 4.3 처리·오류·화면

- 코스와 하위 장소·스냅샷·경로 데이터는 함께 삭제한다. 공용 장소·카테고리·다른 회원의 코스는 삭제하지 않는다. 실패하면 부분 삭제가 남지 않도록 전체 취소한다.
- `400 INVALID_REQUEST`: ID 형식·범위 오류. `401 UNAUTHORIZED`: 인증 오류. `404 COURSE_NOT_FOUND`: 없거나 다른 회원의 코스, 이미 삭제된 코스. `500 INTERNAL_SERVER_ERROR`: 서버 삭제 실패.
- 재삭제는 404다. 서버 자원은 계속 삭제된 상태이며, UI는 이미 없거나 접근할 수 없는 코스로 안내하고 목록을 다시 조회할 수 있다.
- 삭제 전 페이지 안에서 한 번 더 확인한다. 성공 후 목록 항목·전체 건수를 갱신하고, 상세에서 삭제했으면 목록으로 돌아간다. 실패 시 저장 해제 완료로 표시하지 않는다.

## 5. 최신 장소 정보 별도 조회

### 5.1 기본 정보·요청

| 항목 | 내용 |
|---|---|
| 요구사항·화면 | REQ-031 · MY-03 '정보 새로고침' |
| Method·URL | `GET /api/courses/{courseId}/places/latest` |
| 인증 | 필수, 본인 코스 |
| Path 변수 | `courseId`: 양의 십진 정수 문자열 |
| 요청 본문·쿼리 | 없음 |
| 응답 DTO | `CourseLatestPlacesResponse` |

```http
GET /api/courses/42/places/latest
Authorization: Bearer <accessToken>
```

저장 코스의 모든 장소를 대상으로 조회한다. 본인 코스 확인 후 서버가 장소 도메인의 서비스를 통해 외부 장소 정보를 조회한다. 외부 제공자·외부 장소 ID를 클라이언트에서 입력받지 않고 서버의 장소 연결 정보로 확인한다.

### 5.2 성공 응답

`200 OK` · `CourseLatestPlacesResponse` (한 장소 성공, 한 장소 실패 예시):

```json
{
  "courseId": "42",
  "requestedAt": "2026-11-12T10:05:00+09:00",
  "places": [
    {
      "coursePlaceId": "501", "placeId": "101", "visitOrder": 1,
      "status": "SUCCESS", "fetchedAt": "2026-11-12T10:05:01+09:00",
      "place": {
        "placeName": "틈베이커리", "category": "CAFE", "subCategory": "베이커리",
        "address": "변경된 예시 주소 1", "latitude": 37.548, "longitude": 127.062,
        "imageUrl": null, "description": null, "openingHours": "10:00~20:00"
      },
      "errorCode": null, "message": null
    },
    {
      "coursePlaceId": "502", "placeId": "102", "visitOrder": 2,
      "status": "FAILED", "fetchedAt": null, "place": null,
      "errorCode": "PLACE_LOOKUP_FAILED", "message": "최신 정보를 불러오지 못했어요."
    }
  ]
}
```

| `CourseLatestPlacesResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `courseId` | string | 조회한 저장 코스 ID |
| `requestedAt` | string | 서버가 최신 조회 요청을 받은 시각 |
| `places` | CourseLatestPlaceResponse[] | 모든 저장 장소의 결과, 원래 방문 순서 유지 |

| `CourseLatestPlaceResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `coursePlaceId`, `placeId` | string | 저장 장소 항목 ID·공용 장소 ID |
| `visitOrder` | integer | 저장 당시 방문 순서 |
| `status` | string | `SUCCESS`, `NOT_FOUND`, `FAILED` |
| `fetchedAt` | string 또는 null | 성공 시 최신 정보를 확인한 시각. 실패·정보 없음이면 null |
| `place` | LatestPlaceResponse 또는 null | 성공 시 최신 정보. 저장본에서 복사한 대체 값은 넣지 않음 |
| `errorCode`, `message` | string 또는 null | 항목별 실패·정보 없음 코드와 안내, 성공이면 null |

`LatestPlaceResponse` 필드:

- `placeName`: string, 필수.
- `category`, `subCategory`, `address`, `imageUrl`, `description`, `openingHours`: string 또는 null. 공급 정보가 없으면 null이며 저장본의 값으로 보완하지 않는다.
- `latitude`, `longitude`: number 또는 null. 유효한 WGS84 좌표 쌍이어야 하며, 확인할 수 없으면 둘 다 null이다.
- 일정·체류시간·이동시간·총 시간·경로·저장일은 포함하지 않는다.

| 항목 상태 | `place` | `fetchedAt` | `errorCode` | 의미 |
|---|---|---|---|---|
| `SUCCESS` | 최신 정보 | 성공 시각 | null | 조회 성공. 일부 선택 정보 null은 허용 |
| `NOT_FOUND` | null | null | `PLACE_INFORMATION_NOT_FOUND` | 제공자에서 장소 정보를 확인할 수 없음. 폐업이라고 단정하지 않음 |
| `FAILED` | null | null | `PLACE_LOOKUP_FAILED` | 시간 초과·호출 제한·외부 응답 오류 등 |

### 5.3 처리·오류·화면

- 사용자가 버튼을 누를 때만 호출한다. 기본 상세 조회·지도 진입·화면 재진입·브라우저 새로고침에서 자동 호출하지 않는다.
- 저장본과 최신 조회 결과를 별도 상태로 관리한다. `coursePlaceId`로 항목을 대응시키고 '최신 조회 정보'와 조회 시각을 별도 영역에 표시한다.
- 코스명·장소 스냅샷·방문 순서·일정·좌표·경로·저장 시각을 갱신하거나 재계산하지 않는다. 최신 좌표가 달라도 저장 코스 지도는 저장 좌표·경로를 유지한다.
- 장소별 최신 조회 실패·정보 없음은 다른 장소 결과와 함께 `200`으로 반환한다. 모든 장소가 실패해도 결과 목록의 상태로 구분한다. 저장 당시 값을 최신 정보로 표시하지 않는다.
- 외부 호출에는 제한 시간을 둔다. 현재 공통 axios의 10초 타임아웃 안에 부분 결과를 반환할 수 있도록 전체 요청·제공자별 시간 예산을 장소 담당자와 확정한다.
- `400 INVALID_REQUEST`: ID 형식·범위 오류. `401 UNAUTHORIZED`: 인증 오류. `404 COURSE_NOT_FOUND`: 없거나 다른 회원의 코스. `500 INTERNAL_SERVER_ERROR`: DB 등 서버 자체 처리 실패. 외부 장소별 실패는 위 항목 상태로 표현한다.
- 화면을 벗어나면 임시 최신 조회 상태를 비우고, 재진입 시 저장본으로 표시한다. 화면을 바꾼 뒤 도착한 응답이 다른 코스 화면을 덮지 않도록 현재 `courseId`와 대응시킨다.

## 6. 전체 연동 전 확인 사항

| 항목 | 확인할 내용 | 담당 |
|---|---|---|
| 공통 응답 | 실제 `ApiResponse` JSON 구조, 오류 구조·코드명·검증 오류 표현 | 정종일·김용현 |
| 인증 | 로그인 회원 ID 전달, 탈퇴·만료 토큰 처리 | 김용현·김하윤 |
| 추천 버전 | 선택 코스 1건의 불변 버전 ID, 로그인 전 추천의 로그인 후 접근 검증, 만료 확인 | 나혜빈·김용현·김하윤 |
| 저장 구조 | 장소 스냅샷, `sourceRecommendationId`, 회원별 중복 방지, 기존 데이터 전환 | 김하윤·정종일·나혜빈 |
| 지도 | 경로·추정 여부 저장 필드, `routeLegs` 형식, 프론트 지도 연결 | 김하윤·나혜빈·유지수 |
| 최신 조회 | 제공자별 최신 정보 필드·누락·실패 상태, 조회 시각·시간 예산 | 정종일·김하윤 |
| 명세 취합 | 검토한 DTO·메서드·상태·오류를 통합 API 명세와 Swagger에 반영 | 김용현·정종일·김하윤 |

현재 ERD에는 장소 스냅샷·추천 버전 ID·지도 경로·추정 여부의 저장 구조가 모두 갖춰져 있지 않다. 이 명세의 응답을 안정적으로 제공하려면 해당 저장 구조를 별도 확정해야 한다.

### 구현 시 확인할 시나리오

- 비회원·다른 회원 접근을 차단하며, 다른 회원의 최신 조회에서 외부 API도 호출하지 않는다.
- 신규·중복·동시 저장, 추천 만료 전후, 저장 실패 시 전체 취소를 확인한다.
- 원래 추천 만료·공용 장소 갱신 후에도 저장 목록·상세·지도는 같은 저장본을 제공한다.
- 최신순 정렬·동일 시각의 ID 정렬·페이징·빈 목록·페이지 범위 초과를 확인한다.
- 삭제 후 하위 데이터만 제거되고 공용 장소는 남으며, 재삭제는 404다.
- 최신 조회의 성공·부분 실패·전체 실패·정보 없음에서도 저장본과 일정은 바뀌지 않는다.
- 외부 API는 최신 조회 버튼을 누를 때만 호출되고, 일반 상세·지도 진입에서는 호출하지 않는다.
