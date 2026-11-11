# ERD · 테이블 정의 (초안)

> 담당: 김하윤 · 상태: 초안 (팀 확정 전)
> 이 문서의 SQL을 그대로 실행하면 로컬 MySQL에 테이블과 카테고리 기본 데이터가 만들어집니다.

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
| `member` | 회원 | 회원 계정. 탈퇴는 `account_status` 로 처리(soft delete) | |
| `admin` | 관리자 | 관리자 권한을 가진 회원 | `member` 1:1 |
| `category` | 카테고리 | 대분류(level 1)·세분류(level 2), 자기참조 | 상위 `category` |
| `place` | 장소 | 외부(카카오 등) 장소 캐시 | |
| `place_category` | 장소카테고리 | 장소 ↔ 카테고리 N:M | `place`, `category` |
| `place_like` | 찜 | 회원이 찜(♡)한 장소 | `member`, `place` |
| `course` | 저장한 추천 결과 | 추천 결과(1곳 이상)를 통째로 저장 | `member` |
| `course_place` | 저장한 추천 결과의 장소 | 장소 + 방문 순서 | `course`, `place` |
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

## 3. 전체 DDL

```sql
CREATE DATABASE IF NOT EXISTS teumteum
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE teumteum;

-- ===== 회원 =====

CREATE TABLE `member` (
  `member_id`      BIGINT       NOT NULL AUTO_INCREMENT,
  `login_id`       VARCHAR(50)  NOT NULL,
  `password_hash`  VARCHAR(255) NOT NULL,
  `member_name`    VARCHAR(80)  NOT NULL,
  `email`          VARCHAR(255) NOT NULL,
  `account_status` VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE / WITHDRAWN',
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `UK_member_login_id` (`login_id`),
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

CREATE TABLE `place_like` (
  `member_id`  BIGINT   NOT NULL,
  `place_id`   BIGINT   NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`, `place_id`),
  CONSTRAINT `FK_place_like_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
  CONSTRAINT `FK_place_like_place` FOREIGN KEY (`place_id`) REFERENCES `place` (`place_id`)
) ENGINE=InnoDB COMMENT='찜';

-- ===== 저장한 추천 결과 =====

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
  `total_minutes`         SMALLINT      NOT NULL COMMENT '총 소요시간(분)',
  `total_travel_minutes`  SMALLINT      NOT NULL DEFAULT 0 COMMENT '이동시간 합계(분)',
  `final_travel_minutes`  SMALLINT      NOT NULL DEFAULT 0 COMMENT '마지막 장소→도착지(분). 도착지 없으면 0',
  `created_at`            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`),
  KEY `IX_course_member` (`member_id`, `created_at`),
  CONSTRAINT `FK_course_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
) ENGINE=InnoDB COMMENT='저장한 추천 결과';

CREATE TABLE `course_place` (
  `course_place_id` BIGINT   NOT NULL AUTO_INCREMENT,
  `course_id`       BIGINT   NOT NULL,
  `place_id`        BIGINT   NOT NULL,
  `visit_order`     SMALLINT NOT NULL COMMENT '1부터 시작',
  `stay_minutes`    SMALLINT NOT NULL COMMENT '예상 체류시간(분)',
  `travel_minutes`  SMALLINT NOT NULL DEFAULT 0 COMMENT '직전 지점→이 장소 이동시간(분). 1번은 출발지에서',
  PRIMARY KEY (`course_place_id`),
  UNIQUE KEY `UK_course_place_order` (`course_id`, `visit_order`),
  CONSTRAINT `FK_course_place_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_course_place_place` FOREIGN KEY (`place_id`) REFERENCES `place` (`place_id`)
) ENGINE=InnoDB COMMENT='저장한 추천 결과의 장소';

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
  `available_minutes`         SMALLINT      NOT NULL COMMENT '이용 가능 시간(분). 0~360',
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

대분류 8개와 세분류. 이름·세분류 목록은 프론트 `shared/types/domain.ts` 기준이며, 확정되면 양쪽을 함께 고칩니다.

```sql
USE teumteum;

INSERT INTO `category` (`category_id`, `parent_category_id`, `category_code`, `category_name`, `category_level`, `display_order`) VALUES
  (1, NULL, 'CULTURE',       '문화생활',    1, 1),
  (2, NULL, 'CAFE',          '카페·디저트', 1, 2),
  (3, NULL, 'FOOD',          '음식·맛집',   1, 3),
  (4, NULL, 'NATURE',        '자연·휴식',   1, 4),
  (5, NULL, 'ENTERTAINMENT', '오락·체험',   1, 5),
  (6, NULL, 'SHOPPING',      '쇼핑·구경',   1, 6),
  (7, NULL, 'SPORTS',        '스포츠·활동', 1, 7),
  (8, NULL, 'TOURISM',       '관광명소',    1, 8);

INSERT INTO `category` (`parent_category_id`, `category_name`, `category_level`, `display_order`) VALUES
  (1, '전시', 2, 1), (1, '영화', 2, 2), (1, '공연', 2, 3), (1, '책방', 2, 4),
  (2, '카페', 2, 1), (2, '베이커리', 2, 2), (2, '디저트', 2, 3),
  (3, '한식', 2, 1), (3, '양식', 2, 2), (3, '일식', 2, 3), (3, '중식', 2, 4), (3, '분식', 2, 5),
  (4, '공원', 2, 1), (4, '산책로', 2, 2), (4, '한강', 2, 3),
  (5, '방탈출', 2, 1), (5, '보드게임', 2, 2), (5, '공방', 2, 3), (5, '노래방', 2, 4),
  (6, '소품샵', 2, 1), (6, '팝업스토어', 2, 2), (6, '시장', 2, 3), (6, '백화점', 2, 4),
  (7, '당구', 2, 1), (7, '볼링', 2, 2), (7, '클라이밍', 2, 3),
  (8, '랜드마크', 2, 1), (8, '고궁', 2, 2), (8, '전망대', 2, 3);
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
DROP TABLE IF EXISTS `place_like`;
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
| UNIQUE | 없음 | `login_id`, `email`, (`place_provider`, `external_place_id`), (`*_id`, `visit_order`), `category_code` | 중복 가입·장소 중복 저장·방문 순서 중복 방지 |
| `updated_at` | 자동 갱신 안 됨 | `ON UPDATE CURRENT_TIMESTAMP` | |
| 출발지 컬럼 | `departure_*` | `origin_*` | 용어표·프론트(`origin`)와 통일 |
| 시간 컬럼 | `total_duration_minutes`, `total_estimated_minutes`, `estimated_stay_minutes`, `travel_minutes_from_previous` | `total_minutes`, `stay_minutes`, `travel_minutes` | 용어표·프론트 타입과 통일 |
| 도착지 이동시간 | 없음 | `final_travel_minutes` | 총 소요시간에 마지막 장소→도착지 이동 포함. 프론트 `finalTravelMinutes` 와 대응 |
| `recommendation_type` (단일/코스) | 있음 | 삭제 | 사용자가 단일/코스를 고르지 않음. 장소 수로 판단 가능 |
| `recommendation_mode` | 있음 | `category_mode` (`DIRECT`/`RANDOM`) | 프론트 `CategoryMode` 와 통일 |
| `start_at`, `end_at` | 있음 | `available_minutes` | 조건은 시각이 아니라 이용 시간(0분~6시간 슬라이더) |
| `recommendation_history.member_id` | NOT NULL | NULL 허용 | 비회원 이용 중심 서비스 |
| 찜 테이블 | 없음 | `place_like` 추가 | 화면설계서의 찜(♡)·마이페이지 |
| `category_code` | 없음 | 추가 + 기본 데이터 | 대분류 영문 코드로 API·프론트와 연결 |
| `place.created_at` | 없음 | 추가 | |
| 하위 테이블 FK | 삭제 동작 없음 | `ON DELETE CASCADE` (`course_place`, 추천 기록 하위, `place_category`) | 저장한 추천 결과 삭제 시 장소 목록 함께 삭제 |
| 인덱스 | 없음 | 회원별 목록 조회용 (`member_id`, `created_at`) | 마이페이지 목록 |
| 엔진·문자셋 | 미지정 | InnoDB, utf8mb4 | 한글·이모지 |

## 7. 남은 결정 사항

- 전체 알림(`notification`) 테이블: 관리자 기능에 있으나 요구사항(발송 방식, 읽음 처리)이 정해지지 않아 넣지 않음 — 정종화
- `account_status`, `inquiry_status` 값 목록 확정
- 세분류 목록과 카카오 장소 분류 매핑

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-11-11 | 초안 추가 |
| 2026-11-11 | 테이블·컬럼 영문화, 용어표 정렬, 제약조건·찜 테이블·카테고리 기본 데이터 추가 |
