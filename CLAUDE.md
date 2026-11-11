@AGENTS.md

# Claude Code 전용 지침

위 AGENTS.md 가 팀 공통 규칙이고, 아래는 Claude Code 에만 해당하는 내용입니다.

- 작업 시작 시 어느 도메인(feature) 작업인지 확인하고, 해당 폴더 위주로 읽는다. 저장소 전체를 훑지 않는다
- git commit, push, PR 생성은 사용자가 요청했을 때만 한다
- 개발 환경은 Windows 다. 백엔드 명령은 `gradlew.bat` 을 우선 사용하고, 경로 구분자에 주의한다
- 프론트 작업은 `frontend/` 를 열고 해도 이 파일이 상위 폴더에서 함께 읽힌다
- 백엔드 API를 프론트에서 연동할 때는 해당 도메인의 `dto` 와 `controller` 를 먼저 읽고 요청·응답 형식을 맞춘다
- 개인 취향 설정(말투, 설명 깊이 등)은 커밋하지 않는 `CLAUDE.local.md` 에 둔다
