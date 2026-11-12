# 저장 코스 API 명세 (초안)

> 담당: 김하윤 (`be05`) · 작성일: 2026-11-12 · 작업 이슈: [#9](https://github.com/teumteum-sesac/teumteum/issues/9)
> 기준: [요구사항 REQ-030/031/032](requirements.md#15-코스-저장-및-관리), [화면설계서 MY-02/03](틈틈%20화면설계서.md), 저장본 유지 정책 [PR #8](https://github.com/teumteum-sesac/teumteum/pull/8).
> 아래 URL·DTO·HTTP 상태·오류 코드·중복 저장 방식은 연동을 위한 제안안이다. 공통 응답·추천 결과 식별·인증·지도 담당자와 검토 후 확정한다. API 구현이나 스키마 반영이 완료됐다는 뜻은 아니다.

## 1. 범위와 API 목록

| 기능 | Method | URL | 성공 응답 | 응답 DTO | 화면 |
|---|---|---|---|---|---|
| 추천 코스 저장 | POST | `/api/courses` | 신규 `201`, 기존 저장본 반환 `200` | `CourseSaveResponse` | DET-01 |
| 내 저장 코스 목록 | GET | `/api/courses?page=0&size=20` | `200` | `CourseListResponse` | MY-01/02 |
| 내 저장 코스 상세·지도 | GET | `/api/courses/{courseId}` | `200` | `CourseResponse` | MY-03, 저장 코스 DET-02 |
| 내 저장 코스 삭제 | DELETE | `/api/courses/{courseId}` | `200` | `CourseDeleteResponse` | MY-02/03 |
| 최신 장소 정보 별도 조회 | GET | `/api/courses/{courseId}/places/latest` | `200` | `CourseLatestPlacesResponse` | MY-03 정보 새로고침 |

회원 정보 API, 추천 생성·교체 API, 장소 검색 API는 이 문서의 범위에서 제외한다. 저장 코스의 장소 교체·일정 수정 API는 제공하지 않는다.

## 2. 공통 규칙

### 2.1 인증·소유권

모든 API는 `Authorization: Bearer <accessToken>` 인증을 요구한다. 서버는 김용현 담당의 인증 계층에서 제공하는 로그인 회원 ID로 소유자를 판단한다. 요청 본문·쿼리에서 `memberId`를 받지 않는다.

- 미로그인·만료되거나 유효하지 않은 토큰·탈퇴 회원의 접근은 `401`로 처리한다. 탈퇴 상태와 기존 JWT 처리 방식은 인증 담당자와 확정한다.
- 목록은 로그인 회원의 저장 코스만 반환한다.
- 상세·삭제·최신 조회에서 코스가 없거나 다른 회원의 코스이면 동일한 `404 COURSE_NOT_FOUND`를 반환한다. 최신 조회는 소유권 확인을 마친 뒤에만 장소 서비스를 호출한다.
- 요청은 `Accept: application/json`, 본문이 있는 저장 요청은 `Content-Type: application/json`을 사용한다.
- 회원별 응답과 최신 조회 응답에 `Cache-Control: no-store`를 적용하는 안으로 한다. 최신 조회는 사용자가 버튼을 누를 때만 호출하며, 일반 상세 조회·지도 진입·화면 재진입에서는 호출하지 않는다.

### 2.2 응답 형식

실제 성공·오류 응답은 프로젝트의 공통 `ApiResponse`를 따른다. 현재 공통 응답 클래스와 `ErrorCode`가 구현 전이므로 **이 문서의 성공 JSON 예시는 `ApiResponse<T>`가 담을 업무 DTO 부분만** 보여준다. 실제 HTTP 본문 전체로 사용하지 않는다.

| 상황 | 공통 응답에 담을 내용 |
|---|---|
| 성공 | 각 API의 응답 DTO (`ApiResponse<CourseResponse>` 등) |
| 오류 | 8절의 제안 오류 코드·사용자 메시지, 필요한 경우 필드 검증 오류 |

공통 응답의 필드명·성공 표시·오류 구조는 정종일 담당이 확정한 형식에 맞춘다. 이 문서를 근거로 도메인 전용 응답 래퍼를 별도로 만들지 않는다. 삭제도 공통 응답을 사용하도록 `200`과 `CourseDeleteResponse`를 제안한다.

### 2.3 ID·시간·누락값

| 항목 | 규칙 |
|---|---|
| `courseId`, `coursePlaceId`, `placeId` | JSON에서 양의 정수인 십진 문자열. DB `BIGINT`와 매핑하며, 요청 ID는 Java `Long` 양수 범위로 검증한다. |
| `recommendationId` | 서버 추천 기능이 발급한 선택 코스 1건의 불변 버전 식별 문자열. 추천 요청 묶음 ID·추천 기록 PK·저장 코스 ID와 구분한다. 최대 200자 제안. |
| `createdAt`, `requestedAt`, `fetchedAt` | 오프셋을 포함한 ISO 8601 문자열. 예: `2026-11-12T10:00:00+09:00`. DB 시각과 API 오프셋 변환 기준은 팀 공통 설정과 맞춘다. |
| `startTime` | 저장한 출발 시각, 24시간제 `HH:mm`. 날짜가 포함된 저장 시각과 구분한다. |
| `*Minutes` | 0 이상의 정수, 단위는 분. 저장된 총 시간·체류·이동시간은 최신 조회로 변경하지 않는다. |
| 좌표 | WGS84 숫자. 위도 -90~90, 경도 -180~180. 본문에서는 `latitude`, `longitude` 사용. |
| 선택 정보 없음 | 해당 필드를 `null`로 반환한다. 예: 도착지·사진·운영시간. 목록이 없으면 `[]`. 빈 문자열로 대체하지 않는다. |
| 저장 정보 기준 | 성공 응답의 값은 저장본이다. 최신 조회 DTO만 최신 장소 정보를 담는다. |

추천 생성·다시 추천·장소 교체로 내용이 달라지면 다른 불변 버전 식별자가 필요하다. 현재 프론트 목업은 장소 교체 후에도 `courseId`를 유지하므로, 그대로 저장용 불변 ID로 사용할 수 있다고 가정하지 않는다. ID 재발급 또는 버전 식별 방식은 나혜빈 담당과 확정한다.

## 3. 추천 코스 저장

### 요청

```http
POST /api/courses
Authorization: Bearer <accessToken>
Content-Type: application/json
```

`CourseSaveRequest`:

```json
{
  "recommendationId": "rec_20261112_a1"
}
```

| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| `recommendationId` | string | O | 공백 불가, 1~200자, 접근 가능한 추천 코스 1건의 불변 버전 ID |

프론트가 계산한 장소 목록·시간·회원 ID를 저장 데이터로 신뢰하지 않는다. 서버가 추천 도메인의 서비스를 통해 저장 가능한 추천 결과를 확인하고, 서버 보관본의 장소 정보·일정·좌표·경로를 복사한다. 저장 직전에 외부 장소 API를 다시 호출해 화면에서 선택한 추천 정보를 바꾸지 않는다.

### 처리·중복 저장 제안

1. 로그인 회원과 요청 형식을 확인한다.
2. 동일 회원이 동일한 불변 `recommendationId`를 이미 저장했다면 기존 `courseId`를 `200`으로 반환한다. 기존 저장본이나 `createdAt`을 변경하지 않는다.
3. 기존 저장본이 없으면 추천 서비스에서 해당 결과에 대한 접근 권한·존재·유효기간(2시간)을 확인한다. 로그인 전 추천 결과도 로그인 후 본래 흐름에서 접근 가능한지 검증해야 한다.
4. 장소 1~4곳, 유효한 장소 식별자·좌표·방문 순서·시간 정보인지 확인한다. 코스와 장소 스냅샷을 하나의 트랜잭션으로 저장한다.
5. 새로운 저장 코스 ID를 발급해 `201`로 반환한다. `Location: /api/courses/{courseId}`를 포함한다.

- 같은 저장 요청을 동시에 보내도 회원별·추천 버전별 저장본이 1개만 생기도록 원자적으로 처리한다. 이를 위한 원본 추천 ID 저장 위치와 중복 방지 제약은 후속 스키마 설계 대상이다.
- 이미 저장한 추천 결과가 나중에 만료돼도 중복 요청은 기존 저장본을 반환한다. 저장 코스의 수명은 추천 결과의 2시간 만료와 독립적이다.
- 저장 해제 후 같은 결과를 다시 저장하면, 추천 결과가 아직 유효한 경우 새 ID와 저장 시각으로 저장한다. 만료됐다면 `410`이다.

### 응답

`CourseSaveResponse` (`201` 신규 저장 예시):

```json
{
  "courseId": "42",
  "sourceRecommendationId": "rec_20261112_a1",
  "createdAt": "2026-11-12T10:00:00+09:00",
  "created": true
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `courseId` | string | 저장한 코스의 ID. 이후 목록·상세·지도·삭제에 사용 |
| `sourceRecommendationId` | string | 저장에 사용한 추천 버전 ID |
| `createdAt` | string | 최초 저장 시각 |
| `created` | boolean | 신규 저장이면 `true`, 기존 저장본 반환이면 `false` |

`200` 중복 저장 응답은 위와 같은 DTO이며 `created: false`와 기존 ID·저장 시각을 반환한다. 클라이언트는 두 경우 모두 저장 완료로 처리한다.

### 주요 오류·화면 처리

| HTTP | 제안 오류 코드 | 처리 |
|---|---|---|
| 400 | `INVALID_REQUEST` | 추천 ID 입력 형식 확인 |
| 401 | `UNAUTHORIZED` | 로그인 후 선택한 추천 버전 ID와 저장 의도를 복구해 다시 요청 |
| 404 | `RECOMMENDATION_NOT_FOUND` | 결과 없음 또는 접근할 수 없음 안내 |
| 410 | `RECOMMENDATION_EXPIRED` | 추천 만료 안내 후 다시 추천 |
| 409 | `RECOMMENDATION_NOT_SAVEABLE` | 유효한 장소·일정이 없는 추천 결과. 다시 추천 안내 |

## 4. 내 저장 코스 목록

### 요청·페이징

```http
GET /api/courses?page=0&size=20
Authorization: Bearer <accessToken>
```

| 쿼리 | 타입 | 기본값 | 검증 |
|---|---|---|---|
| `page` | integer | 0 | 0부터 시작, Java `Integer` 범위의 0 이상 정수 |
| `size` | integer | 20 | 1~50 |

- 정렬은 `created_at DESC, course_id DESC`로 고정한다. 같은 시각에 저장된 코스도 순서가 일정하도록 ID를 함께 사용한다.
- 클라이언트에서 회원 ID·정렬 조건을 지정하지 않는다. 목록 조회 시 외부 API를 호출하지 않는다.
- 전체 건수는 로그인 회원의 저장 코스 수이며, MY-01의 '저장한 코스 N' 표시는 `size=1` 조회의 `totalElements`를 활용할 수 있다.

### 응답

`CourseListResponse` (`200`):

```json
{
  "content": [
    {
      "courseId": "42",
      "sourceRecommendationId": "rec_20261112_a1",
      "courseName": "틈카페 → 산책공원",
      "placeCount": 2,
      "totalMinutes": 130,
      "thumbnailUrl": null,
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

`content` 항목 타입은 `CourseSummaryResponse`다. `thumbnailUrl`은 방문 순서 1번 장소의 저장 당시 사진 URL이며 없으면 `null`이다. 코스명·장소 수·시간·사진·저장일은 저장본에서 구성한다. UI의 사진 대체 이미지는 별도 표시 규칙을 사용한다.

| `CourseSummaryResponse` 필드 | 타입 | 설명 |
|---|---|---|
| `courseId`, `sourceRecommendationId` | string | 저장 코스 ID·원본 추천 버전 ID |
| `courseName` | string | 저장한 코스명 |
| `placeCount` | integer | 저장 장소 수, 1~4 |
| `totalMinutes` | integer | 저장한 총 소요시간(분) |
| `thumbnailUrl` | string 또는 null | 첫 장소의 저장 사진 URL |
| `createdAt` | string | 최초 저장 시각 |

| 필드 | 타입 | 설명 |
|---|---|---|
| `content` | CourseSummaryResponse[] | 현재 페이지의 요약 목록 |
| `page`, `size` | integer | 요청 페이지·크기 |
| `totalElements` | integer | 로그인 회원의 저장 코스 전체 건수 |
| `totalPages` | integer | `ceil(totalElements / size)`. 전체 0건이면 0 |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

전체 0건이면 `content: []`, `totalElements: 0`, `totalPages: 0`, `hasNext: false`를 반환한다. 마지막 페이지를 넘긴 요청도 `200`, 빈 `content`, 실제 전체 건수·페이지 수, `hasNext: false`다. 첫 페이지가 비면 '아직 저장한 코스가 없어요'와 조건 설정 이동 버튼을 표시한다. 잘못된 페이지·크기는 `400 INVALID_REQUEST`다.

## 5. 내 저장 코스 상세·지도

### 요청

```http
GET /api/courses/42
Authorization: Bearer <accessToken>
```

`courseId`는 2.3절의 양의 정수 문자열이다. 상세와 저장 코스 지도는 같은 저장본을 사용한다. 공용 장소·카테고리가 갱신되거나 원래 추천이 만료돼도 저장본을 반환하며, 외부 API 호출이나 일정 재계산을 하지 않는다.

### 응답

`CourseResponse` (`200`, 장소·좌표는 설명용 예시):

```json
{
  "courseId": "42",
  "sourceRecommendationId": "rec_20261112_a1",
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

### DTO 정의

| `CourseResponse` 필드 | 타입 | 의미 |
|---|---|---|
| `courseId`, `sourceRecommendationId`, `courseName`, `createdAt` | string | 저장 ID·원본 추천 버전 ID·저장 코스명·저장 시각 |
| `origin` | CourseLocationResponse | 저장 당시 출발지 |
| `destination` | CourseLocationResponse 또는 null | 저장 당시 도착지 |
| `transportType` | string | `TRANSIT`, `WALK`, `CAR` |
| `startTime` | string | 저장한 시작 시각 |
| `totalMinutes`, `totalTravelMinutes`, `finalTravelMinutes` | integer | 총 소요·총 이동·마지막 장소→도착지 이동시간 |
| `estimated` | boolean | 저장 당시 이동시간 계산에 API 실패 후 추정값이 포함됐는지 여부 |
| `places` | CoursePlaceResponse[] | 방문 순서대로 정렬된 장소 스냅샷 1~4개 |
| `routeLegs` | CourseRouteLegResponse[] | 저장 당시 구간별 지도 경로 |

`CourseLocationResponse`: `name: string 또는 null`, `address: string 또는 null`, `latitude: number`, `longitude: number`. 이름이 없으면 UI에서 출발·도착 위치라는 기본 문구를 표시한다. `destination` 자체가 null인 경우에는 도착지 표시를 생략한다.

| `CoursePlaceResponse` 필드 | 타입 | 의미 |
|---|---|---|
| `coursePlaceId` | string | 저장 코스 안의 장소 항목 ID. 최신 조회 결과 연결에 사용 |
| `placeId` | string | 공용 장소 ID. 최신 정보 조회 연결에 사용 |
| `visitOrder` | integer | 1부터 연속되는 방문 순서 |
| `placeName`, `category`, `subCategory` | string | 저장 당시 장소명·대분류 코드·세분류 이름 |
| `address` | string 또는 null | 저장 당시 주소 |
| `latitude`, `longitude` | number | 저장 당시 장소 좌표 |
| `imageUrl`, `description`, `openingHours` | string 또는 null | 저장 당시 사진 URL·소개·운영시간. 제공되지 않은 정보는 null |
| `stayMinutes`, `travelMinutes` | integer | 저장 당시 체류시간·직전 지점에서 이 장소까지 이동시간 |
| `transitInfo` | string 또는 null | 저장 당시 대중교통 노선·환승 표시 정보 |

대분류 코드의 초안은 `CULTURE`, `CAFE`, `FOOD`, `NATURE`, `ENTERTAINMENT`, `SHOPPING`, `SPORTS`, `TOURISM`이며, ERD·프론트와 함께 확정한다.

`CourseRouteLegResponse` 제안:

- `fromVisitOrder`, `toVisitOrder`: 출발지는 0, 장소는 1~N, 도착지가 있으면 N+1. 출발지→첫 장소, 장소 사이, 도착지가 있을 때 마지막 장소→도착지 순으로 제공한다.
- `pathType`: `ACTUAL`은 저장된 실제 경로, `STRAIGHT`는 저장된 직선 표시 경로다.
- `coordinates`: `CourseCoordinateResponse[]` (`latitude`, `longitude` 숫자), 구간 진행 순서의 좌표 2개 이상이다.
- 차량·도보는 실제 경로를 우선하며 실패 시 저장 당시의 직선 대체 경로를 제공한다. 대중교통 1차 버전은 직선 경로이며, 직선 표시 자체가 이동시간 추정 실패를 의미하지는 않는다.
- 경로 형식·저장 위치는 나혜빈·유지수 담당과 확정한다. 일반 상세 조회 시 경로 API를 재호출하는 방식으로 대신하지 않는다.

`totalTravelMinutes = sum(places.travelMinutes) + finalTravelMinutes`, `totalMinutes = sum(places.stayMinutes) + totalTravelMinutes`다. 도착지가 없으면 `finalTravelMinutes`는 0이다. 방문 시각 표시는 저장한 `startTime`과 시간 값으로 계산하며 최신 장소 정보로 바꾸지 않는다.

## 6. 내 저장 코스 삭제

### 요청

```http
DELETE /api/courses/42
Authorization: Bearer <accessToken>
```

요청 본문은 없다. 본인 코스와 하위 장소·스냅샷·경로 데이터를 함께 삭제한다. 공용 `place`·카테고리는 삭제하지 않는다. 실패 시 부분 삭제 상태가 남지 않도록 처리한다.

### 응답

`CourseDeleteResponse` (`200`):

```json
{
  "courseId": "42",
  "deleted": true
}
```

UI는 성공 응답 후 목록 항목을 제거하고 저장 건수를 갱신한다. 상세에서 삭제했으면 목록으로 이동한다. 다른 회원의 코스·이미 삭제된 코스·없는 코스는 동일하게 `404 COURSE_NOT_FOUND`다. 재시도에서 `404`가 오면 UI는 '이미 없거나 접근할 수 없는 코스'로 처리해 목록을 다시 조회할 수 있다. 오류 시 기존 목록을 임의로 삭제 완료 상태로 바꾸지 않는다.

## 7. 최신 장소 정보 별도 조회

### 요청·동작

```http
GET /api/courses/42/places/latest
Authorization: Bearer <accessToken>
```

- 요청 본문·쿼리 없이 저장 코스의 모든 장소를 대상으로 조회한다. 외부 제공자·외부 장소 ID는 서버가 저장된 장소 연결을 통해 확인한다.
- 본인 코스 확인 후 장소 도메인의 서비스를 통해 최신 정보를 조회한다. `course` 도메인이 다른 도메인의 repository나 외부 API를 직접 호출하지 않는다.
- 저장한 코스·장소 스냅샷·코스명·방문 순서·시간·좌표·경로·저장일은 갱신하지 않는다. 최신 조회 결과는 이 화면의 별도 상태로만 사용한다.
- 기본 상세 조회, 저장 코스 지도, 화면 재진입·브라우저 새로고침에서는 이 API를 자동 호출하지 않는다.

### 응답

`CourseLatestPlacesResponse` (`200`, 한 장소 성공·한 장소 실패 예시):

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

| DTO·필드 | 타입 | 의미 |
|---|---|---|
| `CourseLatestPlacesResponse.courseId` | string | 조회한 저장 코스 ID |
| `requestedAt` | string | 서버가 최신 조회 요청을 받은 시각 |
| `places` | CourseLatestPlaceResponse[] | 모든 저장 장소의 결과. 원래 방문 순서 유지 |
| 항목의 `coursePlaceId`, `placeId`, `visitOrder` | string, string, integer | 저장 항목과의 연결 정보. `coursePlaceId`로 저장본과 대응 |
| `status` | string | `SUCCESS`, `NOT_FOUND`, `FAILED` |
| `fetchedAt` | string 또는 null | 최신 정보 조회 성공 시각. 실패·정보 없음이면 null |
| `place` | LatestPlaceResponse 또는 null | 성공 시 최신 장소 정보. 저장본을 복사한 대체 응답은 넣지 않는다. |
| `errorCode`, `message` | string 또는 null | 실패·정보 없음에 대한 제안 결과 코드·안내. 외부 API 원문 오류는 노출하지 않는다. |

`LatestPlaceResponse`는 예시의 `placeName`, `category`, `subCategory`, `address`, `latitude`, `longitude`, `imageUrl`, `description`, `openingHours`를 가진다. `latitude`·`longitude`는 number 또는 null, 나머지는 string 또는 null이며 `placeName`은 필수 string이다. 좌표는 쌍으로 검증하고 확인할 수 없으면 두 값 모두 null을 반환한다. 코스 일정·시간·경로는 포함하지 않는다. 저장 당시 분류를 최신 분류로 보완해 표시하지 않는다.

| 항목 상태 | `place` | `fetchedAt` | `errorCode` | 의미 |
|---|---|---|---|---|
| `SUCCESS` | 최신 정보 | 성공 시각 | null | 확인 가능한 최신 정보 조회 성공. 일부 선택 필드 null은 허용 |
| `NOT_FOUND` | null | null | `PLACE_INFORMATION_NOT_FOUND` | 제공자에서 해당 장소 정보를 확인할 수 없음. 폐업이라고 단정하지 않음 |
| `FAILED` | null | null | `PLACE_LOOKUP_FAILED` | 시간 초과·호출 제한·응답 오류 등으로 조회 실패 |

일부 또는 모든 장소의 외부 조회가 실패해도 장소별 상태를 담은 `200` 응답을 반환한다. 인증·소유권·ID·서버 자체 오류는 아래 HTTP 오류 규칙을 따른다. 외부 조회에는 제한 시간을 두며, 현재 프론트 axios의 10초 타임아웃 안에 부분 결과를 반환할 수 있도록 전체 요청·제공자별 시간 예산을 장소 담당자와 확정한다.

UI는 기존 일정 아래 '최신 조회 정보'와 조회 시각을 별도 표시한다. 최신 이름·주소·좌표를 저장본이나 지도 상태에 병합하지 않는다. 화면을 벗어나면 최신 조회 상태를 비우고, 재진입 시 저장본을 조회한다. 재조회 응답이 다른 코스 화면의 상태를 덮지 않도록 현재 `courseId`와 대응시킨다.

## 8. HTTP 오류 코드 제안

아래 이름은 공통 `ErrorCode` 반영 전의 초안이다. 각 도메인이 같은 의미의 별도 오류 형식을 만들지 않고 공통 예외 처리와 맞춘다.

| HTTP | 제안 오류 코드 | 대상·사용자 안내 |
|---|---|---|
| 400 | `INVALID_REQUEST` | ID·본문·페이지 입력 오류. 예: '요청 내용을 확인해 주세요.' |
| 401 | `UNAUTHORIZED` | 모든 API. 로그인 필요·토큰 만료 등. '로그인이 필요해요.' |
| 404 | `COURSE_NOT_FOUND` | 상세·삭제·최신 조회. 코스 없음과 다른 회원 코스를 동일 처리 |
| 404 | `RECOMMENDATION_NOT_FOUND` | 저장. 추천 결과 없음 또는 접근할 수 없음 |
| 409 | `RECOMMENDATION_NOT_SAVEABLE` | 저장. 장소·일정 검증을 통과하지 못한 추천 결과 |
| 410 | `RECOMMENDATION_EXPIRED` | 신규 저장. 2시간이 지난 추천 결과 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류. 저장·삭제는 부분 성공을 남기지 않음 |

문자열·범위가 잘못된 `courseId`는 `400`이며, 형식이 유효한 ID가 없거나 다른 회원 것이면 `404`다. 회원 ID·토큰·외부 API 키·DB 정보·외부 API 원문을 오류 응답에 포함하지 않는다.

## 9. 기존 화면 연결과 후속 합의

### 9.1 프론트 연결

| 위치 | 연결 방식 |
|---|---|
| DET-01 저장 버튼 | 선택한 추천 버전 ID로 저장. `201`·`200` 모두 저장 완료 처리하고 추천 상세에 머무르며 '저장됨 · 저장한 코스 보기' 토스트를 표시한다. 토스트 링크는 MY-02로 연결하고, MY-03 진입에는 응답의 저장 `courseId`를 사용한다. |
| 로그인 복귀 | 로그인 전에 선택한 추천 버전 ID와 저장 의도를 보존. 복귀 후 저장 요청, 성공 후 토스트 표시. 만료되면 다시 추천 안내 |
| MY-02 | 목록 DTO를 카드로 표시하고 페이지 추가 로딩. 삭제 성공 후 목록·전체 건수 갱신 |
| MY-03·저장 코스 지도 | 저장 `courseId`로 상세 조회. 저장본·최신 조회 상태를 별도로 관리 |
| 정보 새로고침 | 버튼 클릭 시 최신 조회 API 호출. 로딩·장소별 상태 표시. 재진입 시 임시 최신 상태 제거 |

API 호출은 `shared/api/client.ts`를 사용한다. 새 프론트 요청·응답 타입은 이 문서의 DTO 이름을 따르되 팀 확정 후 맞춘다. 기존 `Course` 타입의 `name`·`lat`·`lng`와 이 초안의 `placeName`·`latitude`·`longitude`는 어댑터에서 매핑해야 한다. `createdAt`에서 저장일을 표시하며, 기존 목업의 `savedAt`과 실제 저장 코스 ID를 구분한다.

### 9.2 연동 전 합의할 항목

| 항목 | 확인·구현할 내용 | 담당 |
|---|---|---|
| 정책 기준 | 저장본 유지 정책 PR #8 리뷰·머지. 이 문서는 해당 정책을 전제로 함 | 김하윤·팀 |
| 공통 응답·오류 | `ApiResponse` 실제 JSON 구조, `ErrorCode` 이름, 검증 오류 형태 | 정종일·김용현 |
| 로그인 회원 | 인증 Principal의 회원 ID 전달 방식, 탈퇴·만료 토큰 처리 | 김용현·김하윤 |
| 추천 식별·저장 검증 | 선택 코스의 불변 버전 ID·발급 시각·만료 정보, 서버 조회·접근 검증 서비스, 로그인 전 추천의 로그인 후 접근 처리 | 나혜빈·김용현·김하윤 |
| 홈 검색·주변 탐색의 1곳 코스 | 현재 `place-{placeId}`는 프론트 목업 식별자다. 이 저장 API를 쓰려면 서버가 검증한 1곳 코스와 추천 버전 ID를 발급하는 연결 흐름을 별도 확정해야 함 | 정종일·나혜빈·김하윤 |
| 중복 저장 | 회원·추천 버전별 기존 저장본 반환 정책, `sourceRecommendationId` 저장·원자적 중복 방지 구조 | 김하윤·나혜빈 |
| 스냅샷 | 표시 필드·누락값 보관, 기존 데이터 전환. 현재 ERD에는 장소 스냅샷 필드가 없음 | 김하윤·정종일 |
| 지도 | `routeLegs` 형식, 차량·도보 경로 저장, 추정 여부 보관. 현재 ERD·프론트 타입에 대응 필드 추가 필요 | 김하윤·나혜빈·유지수 |
| 최신 조회 | 제공자별 최신 정보·분류·실패 상태·조회 시각, 전체 시간 예산 | 정종일·김하윤 |
| 명세 취합 | 확정한 DTO·메서드·상태·공통 응답을 통합 API 명세와 Swagger에 반영 | 김용현·정종일·김하윤 |

## 10. 구현 검증 기준

- 미인증 접근은 차단하고, 다른 회원의 코스 상세·삭제·최신 조회는 모두 404이며 외부 장소 조회도 실행하지 않는다.
- 저장 성공 후 브라우저 재진입·원래 추천 만료·공용 장소 갱신에도 같은 저장본을 조회한다.
- 저장 실패는 코스·장소·경로를 부분 저장하지 않는다. 같은 회원의 같은 추천 버전 동시 저장은 저장본 1건으로 수렴한다.
- 목록은 회원별 최신순·동일 시각 ID 정렬·페이지 경계·빈 목록을 검증한다.
- 삭제는 하위 저장 데이터만 함께 제거하고 공용 장소는 유지한다. 재삭제는 404 규칙을 따른다.
- 최신 조회의 전체 성공·부분 실패·전체 실패·정보 없음에서 저장본이 바뀌지 않고, 응답 상태와 null 규칙을 지킨다.
- 기본 상세·지도 진입에서는 외부 API를 호출하지 않으며, 최신 조회 후에도 저장된 일정·지도 좌표·경로·저장일은 동일하다.
- 정상 저장, 중복 저장, 목록, 상세, 삭제, 최신 조회의 실제 HTTP 응답은 팀 공통 `ApiResponse` 형식으로 검증한다.

## 11. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-11-12 | 저장·목록·상세·삭제·최신 장소 정보 조회 5개 API의 요청·응답 초안 작성 (#9) |
