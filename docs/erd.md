# ERD · 테이블 정의 (초안)

> 담당: 김하윤 · 상태: 초안 (팀 확정 전)
> 이 문서의 SQL을 그대로 실행하면 로컬 MySQL에 테이블과 카테고리 기본 데이터가 만들어집니다.
> 저장본 유지 정책은 2절에 명시했습니다. 현재 DDL에는 장소 스냅샷 필드가 없어, 후속 설계 확정과 DDL 반영이 필요합니다.

## 1. 로컬에 테이블 만들기

1. MySQL 8 실행
2. [3. 전체 DDL](#3-전체-ddl) 을 통째로 복사해서 MySQL Workbench / DBeaver / `mysql` CLI 에서 실행
   - 맨 앞에서 `teumteum` DB를 만들고 `USE teumteum;` 까지 합니다
   - DB 이름은 `application-local.yml.example` 의 `jdbc:mysql://localhost:3306/teumteum` 과 같습니다
3. [4. 카테고리 기본 데이터](#4-카테고리-기본-데이터) 실행
4. 스키마가 바뀌어 다시 만들 때는 [5. 테이블 전체 삭제](#5-테이블-전체-삭제) → 3 → 4 순서로 실행

CLI로 실행할 때 예시 (SQL 부분을 `erd.sql` 로 저장했다고 가정):

```bash
mysql -u root -p < erd.sql
```

## 2. 테이블 요약

| 테이블 | 한글 이름 | 설명 | 주요 관계 |
|---|---|---|---|
| `member` | 회원 | 회원 계정. 이메일로 로그인, 닉네임 표시. 탈퇴는 `account_status` 로 처리(soft delete) | |
| `admin` | 관리자 | 관리자 권한을 가진 회원 | `member` 1:1 |
| `category` | 카테고리 | 대분류(level 1)·세분류(level 2), 자기참조. 세분류에 예상 체류시간 | 상위 `category` |
| `place` | 장소 | 갱신 가능한 공용 장소 정보. 외부(카카오 등) 장소 캐시 | |
| `place_category` | 장소카테고리 | 장소 ↔ 카테고리 N:M | `place`, `category` |
| `course` | 저장한 코스 | 추천 코스(1곳 이상)를 저장 시점 정보로 통째로 저장 | `member` |
| `course_place` | 저장한 코스의 장소 | 장소 참조 + 방문 순서 + 구간 이동 정보. 장소 스냅샷 필드 추가 필요 | `course`, `place` |
| `recommendation_history` | 추천 기록 | 추천 요청 조건·결과. 비회원도 기록 | `member`(선택) |
| `recommendation_history_category` | 추천 기록 카테고리 | 요청 시 선택한 카테고리 | `recommendation_history`, `category` |
| `recommendation_history_place` | 추천 기록 장소 | 추천된 장소 + 방문 순서 (다시 추천 시 제외용) | `recommendation_history`, `place` |
| `notice` | 공지사항 | 관리자 공지 | `admin` |
| `inquiry` | 문의사항 | 회원 문의 + 관리자 답변 | `member`, `admin` |

### 값 규칙

| 컬럼 | 값 |
|---|---|
| `transport_type` | `TRANSIT`(대중교통) / `WALK`(도보) / `CAR`(차량) |
| `category_mode` | `DIRECT`(직접 선택) / `RANDOM`(랜덤 추천) |
| `account_status` | `ACTIVE` / `WITHDRAWN` (초안) |
| `inquiry_status` | `WAITING` / `ANSWERED` (초안) |
| `place_provider` | `KAKAO` |
| `category_code` | 대분류만: `CULTURE` `CAFE` `FOOD` `NATURE` `ENTERTAINMENT` `SHOPPING` `SPORTS` `TOURISM` (프론트 `shared/types/domain.ts` 와 동일) |

### 시간 컬럼 규칙

총 소요시간 = 출발지→첫 장소 이동 + 장소별 체류 + 장소 간 이동 + (도착지 있으면) 마지막 장소→도착지 이동

- `*_place.travel_minutes`: **직전 지점에서 이 장소까지** 이동시간. 방문 순서 1번은 출발지→첫 장소
- `final_travel_minutes`: 마지막 장소→도착지 이동시간. 도착지가 없으면 0
- `total_minutes` = Σ`travel_minutes` + Σ`stay_minutes` + `final_travel_minutes`

### 저장본 유지 정책 (REQ-030, REQ-031)

2026-11-12 사용자 결정에 따라 **저장본을 유지하고 최신 조회 정보는 별도로 표시**한다. 작업 이슈: [#7](https://github.com/teumteum-sesac/teumteum/issues/7).

- 저장 시 추천 결과의 장소 정보와 일정을 복사해 보관한다. 기본 목록·상세·지도는 이 저장본으로 응답한다.
- 공용 `place`가 갱신돼도 저장한 코스명, 장소 정보, 방문 순서, 좌표·경로, 체류·이동시간과 총 소요시간은 유지한다.
- `place_id`는 원래 장소를 식별하고 최신 정보를 조회하는 연결로 유지한다. 공용 `place`를 JOIN한 값만으로 저장 당시 장소 정보를 구성하지 않는다.
- '정보 새로고침'을 누를 때만 최신 장소 정보를 조회한다. 저장본을 덮어쓰거나 일정을 재계산하지 않고, 최신 조회 정보와 조회 시각을 별도로 반환·표시한다.
- 최신 조회 결과는 해당 화면의 임시 정보로 사용한다. 화면 재진입·브라우저 새로고침 시 저장본으로 표시하며, 자동으로 외부 API를 다시 호출하지 않는다.
- 장소별 최신 조회 성공·실패·정보 없음 상태를 구분한다. 일부 조회가 실패해도 저장본은 그대로 제공하고, 저장 당시 값을 최신 정보로 표시하지 않는다.
- 기본 조회와 최신 정보 조회 모두 로그인한 회원 본인의 저장 코스에 대해서만 허용한다.

**현재 DDL과 후속 설계 범위**

| 데이터 | 현재 저장 위치 | 후속 설계 |
|---|---|---|
| 회원·코스명·출발지·도착지·이동수단·시작 시각·총 시간·저장일 | `course` | 저장 시 값을 유지하고, 최신 장소 조회로 갱신하지 않는다. |
| 장소 참조·방문 순서·체류시간·이동시간·대중교통 정보 | `course_place` | 저장 시 값을 유지한다. |
| 장소명·주소·위도·경도·사진 URL·소개·운영시간·대분류·세분류 | 공용 장소·카테고리 정보 또는 외부 API. 현재 DDL에 별도 저장본 없음 | `course_place`에 장소 스냅샷 필드를 두는 안을 기준으로 컬럼명·자료형·NULL 허용 여부를 확정한다. |
| 차량·도보 지도 경로, 이동시간 추정 여부 | 현재 DDL에 저장 필드 없음 | 추천·지도 담당자와 저장할 데이터 형식과 위치를 확정한다. |
| 최신 장소 정보·조회 시각·장소별 조회 상태 | 현재 API 미구현 | 저장본과 분리된 응답 구조를 정의한다. 저장 코스 스냅샷에는 영구 반영하지 않는다. |

이 절은 저장본 유지 동작을 정의한다. 스냅샷 컬럼 추가 등 DB 스키마 변경은 팀 확인 후 별도 반영한다. 사진 URL 보관 범위와 외부 데이터 보관 정책은 NFR-008에 맞춰 장소 담당자와 확인한다.

## 3. 전체 DDL

```sql
CREATE DATABASE IF NOT EXISTS teumteum
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE teumteum;

-- ===== 회원 =====

CREATE TABLE `member` (
  `member_id`      BIGINT       NOT NULL AUTO_INCREMENT,
  `email`          VARCHAR(255) NOT NULL COMMENT '로그인 ID. 수정 불가',
  `password_hash`  VARCHAR(255) NOT NULL,
  `nickname`       VARCHAR(50)  NOT NULL,
  `account_status` VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE / WITHDRAWN',
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `UK_member_email` (`email`)
) ENGINE=InnoDB COMMENT='회원';

CREATE TABLE `admin` (
  `member_id`   BIGINT   NOT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  CONSTRAINT `FK_admin_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
) ENGINE=InnoDB COMMENT='관리자';

-- ===== 카테고리 · 장소 =====

CREATE TABLE `category` (
  `category_id`        BIGINT      NOT NULL AUTO_INCREMENT,
  `parent_category_id` BIGINT      NULL     COMMENT '대분류면 NULL',
  `category_code`      VARCHAR(30) NULL     COMMENT '대분류 영문 코드. 세분류는 NULL',
  `category_name`      VARCHAR(80) NOT NULL,
  `category_level`     TINYINT     NOT NULL COMMENT '1: 대분류, 2: 세분류',
  `stay_minutes`       SMALLINT    NULL     COMMENT '세분류 예상 체류시간(분). 대분류는 NULL',
  `display_order`      INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `UK_category_code` (`category_code`),
  CONSTRAINT `FK_category_parent` FOREIGN KEY (`parent_category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB COMMENT='카테고리';

CREATE TABLE `place` (
  `place_id`             BIGINT        NOT NULL AUTO_INCREMENT,
  `place_provider`       VARCHAR(30)   NOT NULL COMMENT 'KAKAO',
  `external_place_id`    VARCHAR(150)  NOT NULL COMMENT '외부 API 장소 ID',
  `place_name`           VARCHAR(200)  NOT NULL,
  `address`              VARCHAR(500)  NULL,
  `latitude`             DECIMAL(10,7) NOT NULL,
  `longitude`            DECIMAL(10,7) NOT NULL,
  `default_stay_minutes` SMALLINT      NOT NULL DEFAULT 30 COMMENT '예상 체류시간 기본값(분)',
  `description`          TEXT          NULL,
  `image_url`            VARCHAR(2048) NULL,
  `created_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`place_id`),
  UNIQUE KEY `UK_place_external` (`place_provider`, `external_place_id`)
) ENGINE=InnoDB COMMENT='장소';

CREATE TABLE `place_category` (
  `place_id`    BIGINT NOT NULL,
  `category_id` BIGINT NOT NULL,
  PRIMARY KEY (`place_id`, `category_id`),
  CONSTRAINT `FK_place_category_place` FOREIGN KEY (`place_id`) REFERENCES `place` (`place_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_place_category_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB COMMENT='장소카테고리';

-- ===== 저장한 코스 =====

CREATE TABLE `course` (
  `course_id`             BIGINT        NOT NULL AUTO_INCREMENT,
  `member_id`             BIGINT        NOT NULL,
  `course_name`           VARCHAR(200)  NOT NULL,
  `origin_name`           VARCHAR(200)  NULL,
  `origin_latitude`       DECIMAL(10,7) NOT NULL,
  `origin_longitude`      DECIMAL(10,7) NOT NULL,
  `destination_name`      VARCHAR(200)  NULL,
  `destination_latitude`  DECIMAL(10,7) NULL,
  `destination_longitude` DECIMAL(10,7) NULL,
  `transport_type`        VARCHAR(20)   NOT NULL COMMENT 'TRANSIT / WALK / CAR',
  `start_time`            TIME          NOT NULL COMMENT '출발 시각. 장소별 방문 시각 계산용',
  `total_minutes`         SMALLINT      NOT NULL COMMENT '총 소요시간(분)',
  `total_travel_minutes`  SMALLINT      NOT NULL DEFAULT 0 COMMENT '이동시간 합계(분)',
  `final_travel_minutes`  SMALLINT      NOT NULL DEFAULT 0 COMMENT '마지막 장소→도착지(분). 도착지 없으면 0',
  `created_at`            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`),
  KEY `IX_course_member` (`member_id`, `created_at`),
  CONSTRAINT `FK_course_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
) ENGINE=InnoDB COMMENT='저장한 코스';

CREATE TABLE `course_place` (
  `course_place_id` BIGINT   NOT NULL AUTO_INCREMENT,
  `course_id`       BIGINT   NOT NULL,
  `place_id`        BIGINT   NOT NULL,
  `visit_order`     SMALLINT NOT NULL COMMENT '1부터 시작',
  `stay_minutes`    SMALLINT NOT NULL COMMENT '예상 체류시간(분)',
  `travel_minutes`  SMALLINT NOT NULL DEFAULT 0 COMMENT '직전 지점→이 장소 이동시간(분). 1번은 출발지에서',
  `transit_info`    VARCHAR(200) NULL  COMMENT '대중교통 노선·환승 (예: 버스 721 · 환승 0회)',
  PRIMARY KEY (`course_place_id`),
  UNIQUE KEY `UK_course_place_order` (`course_id`, `visit_order`),
  CONSTRAINT `FK_course_place_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_course_place_place` FOREIGN KEY (`place_id`) REFERENCES `place` (`place_id`)
) ENGINE=InnoDB COMMENT='저장한 코스의 장소';

-- ===== 추천 기록 =====

CREATE TABLE `recommendation_history` (
  `recommendation_history_id` BIGINT        NOT NULL AUTO_INCREMENT,
  `member_id`                 BIGINT        NULL     COMMENT '비회원이면 NULL',
  `category_mode`             VARCHAR(10)   NOT NULL COMMENT 'DIRECT / RANDOM',
  `origin_name`               VARCHAR(200)  NULL,
  `origin_latitude`           DECIMAL(10,7) NOT NULL,
  `origin_longitude`          DECIMAL(10,7) NOT NULL,
  `destination_name`          VARCHAR(200)  NULL,
  `destination_latitude`      DECIMAL(10,7) NULL,
  `destination_longitude`     DECIMAL(10,7) NULL,
  `start_time`                TIME          NOT NULL COMMENT '시작 시각 (30분 단위)',
  `available_minutes`         SMALLINT      NOT NULL COMMENT '이용 시간(분). 0~360, 0 = 시간 제한 없음',
  `transport_type`            VARCHAR(20)   NOT NULL COMMENT 'TRANSIT / WALK / CAR',
  `total_minutes`             SMALLINT      NOT NULL DEFAULT 0 COMMENT '총 소요시간(분)',
  `final_travel_minutes`      SMALLINT      NOT NULL DEFAULT 0 COMMENT '마지막 장소→도착지(분)',
  `created_at`                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recommendation_history_id`),
  KEY `IX_recommendation_history_member` (`member_id`, `created_at`),
  CONSTRAINT `FK_recommendation_history_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
) ENGINE=InnoDB COMMENT='추천 기록';

CREATE TABLE `recommendation_history_category` (
  `recommendation_history_id` BIGINT NOT NULL,
  `category_id`               BIGINT NOT NULL,
  PRIMARY KEY (`recommendation_history_id`, `category_id`),
  CONSTRAINT `FK_rh_category_history` FOREIGN KEY (`recommendation_history_id`)
    REFERENCES `recommendation_history` (`recommendation_history_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_rh_category_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB COMMENT='추천 기록 카테고리';

CREATE TABLE `recommendation_history_place` (
  `recommendation_history_place_id` BIGINT   NOT NULL AUTO_INCREMENT,
  `recommendation_history_id`       BIGINT   NOT NULL,
  `place_id`                        BIGINT   NOT NULL,
  `visit_order`                     SMALLINT NOT NULL COMMENT '1부터 시작',
  `stay_minutes`                    SMALLINT NOT NULL COMMENT '예상 체류시간(분)',
  `travel_minutes`                  SMALLINT NOT NULL DEFAULT 0 COMMENT '직전 지점→이 장소 이동시간(분)',
  PRIMARY KEY (`recommendation_history_place_id`),
  UNIQUE KEY `UK_rh_place_order` (`recommendation_history_id`, `visit_order`),
  CONSTRAINT `FK_rh_place_history` FOREIGN KEY (`recommendation_history_id`)
    REFERENCES `recommendation_history` (`recommendation_history_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_rh_place_place` FOREIGN KEY (`place_id`) REFERENCES `place` (`place_id`)
) ENGINE=InnoDB COMMENT='추천 기록 장소';

-- ===== 관리자 기능 =====

CREATE TABLE `notice` (
  `notice_id`       BIGINT       NOT NULL AUTO_INCREMENT,
  `admin_member_id` BIGINT       NOT NULL,
  `title`           VARCHAR(200) NOT NULL,
  `content`         TEXT         NOT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notice_id`),
  CONSTRAINT `FK_notice_admin` FOREIGN KEY (`admin_member_id`) REFERENCES `admin` (`member_id`)
) ENGINE=InnoDB COMMENT='공지사항';

CREATE TABLE `inquiry` (
  `inquiry_id`     BIGINT       NOT NULL AUTO_INCREMENT,
  `member_id`      BIGINT       NOT NULL,
  `title`          VARCHAR(200) NOT NULL,
  `content`        TEXT         NOT NULL,
  `inquiry_status` VARCHAR(20)  NOT NULL DEFAULT 'WAITING' COMMENT 'WAITING / ANSWERED',
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `answered_by`    BIGINT       NULL     COMMENT '답변한 관리자 member_id',
  `answer_content` TEXT         NULL,
  `answered_at`    DATETIME     NULL,
  PRIMARY KEY (`inquiry_id`),
  KEY `IX_inquiry_member` (`member_id`, `created_at`),
  CONSTRAINT `FK_inquiry_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
  CONSTRAINT `FK_inquiry_admin` FOREIGN KEY (`answered_by`) REFERENCES `admin` (`member_id`)
) ENGINE=InnoDB COMMENT='문의사항';
```

## 4. 카테고리 기본 데이터

대분류 8개와 세분류, 세분류별 예상 체류시간. 화면설계서 v2.0 RES-01 표 기준이며 프론트 `shared/types/domain.ts` 와 같습니다. 체류시간은 실측을 보고 보정합니다.

```sql
USE teumteum;

INSERT INTO `category` (`category_id`, `parent_category_id`, `category_code`, `category_name`, `category_level`, `display_order`) VALUES
  (1, NULL, 'CULTURE',       '문화생활',    1, 1),
  (2, NULL, 'CAFE',          '카페/디저트', 1, 2),
  (3, NULL, 'FOOD',          '음식/맛집',   1, 3),
  (4, NULL, 'NATURE',        '자연/휴식',   1, 4),
  (5, NULL, 'ENTERTAINMENT', '오락/체험',   1, 5),
  (6, NULL, 'SHOPPING',      '쇼핑/구경',   1, 6),
  (7, NULL, 'SPORTS',        '스포츠활동',  1, 7),
  (8, NULL, 'TOURISM',       '관광/명소',   1, 8);

-- (상위, 이름, level, 예상 체류시간(분), 순서)
INSERT INTO `category` (`parent_category_id`, `category_name`, `category_level`, `stay_minutes`, `display_order`) VALUES
  (1, '전시', 2, 90, 1), (1, '영화', 2, 150, 2), (1, '공연', 2, 150, 3), (1, '책방', 2, 60, 4),
  (2, '카페', 2, 60, 1), (2, '베이커리', 2, 30, 2), (2, '디저트', 2, 40, 3),
  (3, '한식', 2, 60, 1), (3, '양식', 2, 60, 2), (3, '일식', 2, 60, 3), (3, '중식', 2, 60, 4), (3, '분식', 2, 40, 5),
  (4, '공원', 2, 60, 1), (4, '산책로', 2, 60, 2), (4, '한강', 2, 90, 3),
  (5, '방탈출', 2, 90, 1), (5, '보드게임', 2, 120, 2), (5, '공방', 2, 120, 3), (5, '노래방', 2, 60, 4),
  (6, '소품샵', 2, 40, 1), (6, '팝업스토어', 2, 40, 2), (6, '시장', 2, 60, 3), (6, '백화점', 2, 90, 4),
  (7, '당구', 2, 90, 1), (7, '볼링', 2, 90, 2), (7, '클라이밍', 2, 120, 3),
  (8, '랜드마크', 2, 60, 1), (8, '고궁', 2, 90, 2), (8, '전망대', 2, 60, 3);
```

## 5. 테이블 전체 삭제

FK 때문에 자식 테이블부터 지웁니다. **로컬 데이터가 모두 사라집니다.**

```sql
USE teumteum;

DROP TABLE IF EXISTS `inquiry`;
DROP TABLE IF EXISTS `notice`;
DROP TABLE IF EXISTS `recommendation_history_place`;
DROP TABLE IF EXISTS `recommendation_history_category`;
DROP TABLE IF EXISTS `recommendation_history`;
DROP TABLE IF EXISTS `course_place`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `place_category`;
DROP TABLE IF EXISTS `place`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `admin`;
DROP TABLE IF EXISTS `member`;
```

## 6. 원본 초안에서 바뀐 점

| 항목 | 원본 | 변경 | 이유 |
|---|---|---|---|
| 테이블 이름 | 한글 (`회원`, `저장코스` …) | 영문 snake_case (`member`, `course` …) | AGENTS.md 규칙(DB snake_case), 용어표(`course` = 저장한 추천 결과) |
| PK | 값 직접 지정 | 단일 PK에 `AUTO_INCREMENT` | JPA `@GeneratedValue(IDENTITY)` 사용 |
| UNIQUE | 없음 | `email`, (`place_provider`, `external_place_id`), (`*_id`, `visit_order`), `category_code` | 중복 가입·장소 중복 저장·방문 순서 중복 방지 |
| `updated_at` | 자동 갱신 안 됨 | `ON UPDATE CURRENT_TIMESTAMP` | |
| 출발지 컬럼 | `departure_*` | `origin_*` | 용어표·프론트(`origin`)와 통일 |
| 시간 컬럼 | `total_duration_minutes`, `total_estimated_minutes`, `estimated_stay_minutes`, `travel_minutes_from_previous` | `total_minutes`, `stay_minutes`, `travel_minutes` | 용어표·프론트 타입과 통일 |
| 도착지 이동시간 | 없음 | `final_travel_minutes` | 총 소요시간에 마지막 장소→도착지 이동 포함. 프론트 `finalTravelMinutes` 와 대응 |
| `recommendation_type` (단일/코스) | 있음 | 삭제 | 사용자가 단일/코스를 고르지 않음. 장소 수로 판단 가능 |
| `recommendation_mode` | 있음 | `category_mode` (`DIRECT`/`RANDOM`) | 프론트 `CategoryMode` 와 통일 |
| `start_at`, `end_at` | 있음 | `start_time` + `available_minutes` | 조건은 시작 시각 + 이용 시간(0분~6시간 슬라이더, 0분 = 시간 제한 없음) |
| `recommendation_history.member_id` | NOT NULL | NULL 허용 | 비회원 이용 중심 서비스 |
| `category_code` | 없음 | 추가 + 기본 데이터 | 대분류 영문 코드로 API·프론트와 연결 |
| `place.created_at` | 없음 | 추가 | |
| 하위 테이블 FK | 삭제 동작 없음 | `ON DELETE CASCADE` (`course_place`, 추천 기록 하위, `place_category`) | 저장한 추천 결과 삭제 시 장소 목록 함께 삭제 |
| 인덱스 | 없음 | 회원별 목록 조회용 (`member_id`, `created_at`) | 마이페이지 목록 |
| 엔진·문자셋 | 미지정 | InnoDB, utf8mb4 | 한글·이모지 |

## 7. 화면설계서 v2.0 반영 (2026-11-12)

| 항목 | 이전 | 변경 | 이유 |
|---|---|---|---|
| 회원 식별 | `login_id` + `member_name` + `email` | `email`(로그인 ID, 수정 불가) + `nickname` | 이메일 회원가입·로그인만, 닉네임 표시 (AUT-02, MY-04) |
| 찜 | `place_like` | 삭제 | 화면설계서 v2.0에 찜 화면 없음 |
| 체류시간 | `place.default_stay_minutes` 만 | `category.stay_minutes`(세분류별) 추가 | 세분류별 예상 체류시간 표 (RES-01, 결정 1) |
| 시작 시각 | 없음 | `recommendation_history.start_time`, `course.start_time` | 시작 시각 + 이용 시간, 저장 코스의 방문 시각 표시 |
| 대중교통 정보 | 없음 | `course_place.transit_info` | 상세에 노선·환승 표시 (DET-01) |
| `available_minutes` | 0~360 | 0 = 시간 제한 없음 | 결정 4 |
| 카테고리 이름 | `카페·디저트` 등 | `카페/디저트` 등 | 화면설계서·프론트와 통일 |

## 8. 남은 결정 사항

- 저장 장소 스냅샷 컬럼명·자료형·NULL 허용 여부 및 기존 저장 데이터 전환 방식 — 김하윤·정종일
- 저장 코스 지도 경로·이동시간 추정 여부 저장 형식과 위치 — 김하윤·나혜빈·유지수
- 저장본과 최신 조회 정보를 분리하는 API 요청·응답 형식, 장소별 조회 상태·조회 시각 표현 — 김하윤·정종일
- 비밀번호 찾기(재설정 링크) 토큰 저장 방식: 테이블 추가 또는 만료 JWT — 김용현
- 추천 결과 2시간 보관·장소 교체 후보(저장된 카카오 로컬 후보) 저장 위치: DB 또는 서버 캐시 — 나혜빈
- 전시(문화포털)·공연(KOPIS) 매일 1회 저장 테이블 — 정종일
- 이동시간 API 실패 여부('예상 시간' 표시) 저장 필요 여부 — 나혜빈·김하윤

- 전체 알림(`notification`) 테이블: 관리자 기능에 있으나 요구사항(발송 방식, 읽음 처리)이 정해지지 않아 넣지 않음 — 정종화
- `account_status`, `inquiry_status` 값 목록 확정
- 세분류 목록과 카카오 장소 분류 매핑

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-11-11 | 초안 추가 |
| 2026-11-11 | 테이블·컬럼 영문화, 용어표 정렬, 제약조건·찜 테이블·카테고리 기본 데이터 추가 |
| 2026-11-12 | 화면설계서 v2.0 반영: 회원 이메일·닉네임, 찜 삭제, 세분류 체류시간, 시작 시각, 대중교통 정보 (7장) |
| 2026-11-12 | 저장본 유지 정책 반영: 최신 장소 정보 별도 조회·표시, 저장본·일정 유지, 현재 DDL의 스냅샷 저장 필드 후속 설계 항목 명시 (#7) |
