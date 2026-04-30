# PICA HUB 베타 외부 공개 배포 가이드

가장 빠른 베타 공개 경로는 Render Web Service입니다. 이 프로젝트는 별도 npm 패키지 설치 없이 Node 기본 모듈만 사용합니다.

관리자 백오피스에서 저장한 내용까지 유지하려면 Render의 유료 Web Service와 Persistent Disk가 필요합니다. 무료 Web Service도 외부 공개는 가능하지만, 서비스 재시작/재배포/슬립 이후 로컬 파일 변경분이 사라질 수 있습니다.

## 1. 공개 전 필수 변경

관리자 비밀번호는 반드시 호스트 환경변수로 설정하세요.

- `ADMIN_USER`: 관리자 아이디
- `ADMIN_PASS`: 관리자 비밀번호
- `DATA_FILE`: 콘텐츠 JSON 저장 파일 경로

로컬 `.env`는 참고용이며, 실제 서버에는 호스팅 서비스의 Environment 메뉴에서 입력하는 것이 안전합니다.

## 2. Render 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. Render에서 **New > Blueprint** 또는 **New > Web Service**를 선택합니다.
3. Blueprint를 쓰면 `render.yaml`을 자동 인식합니다.
4. `ADMIN_PASS` 값을 Render 대시보드에서 직접 입력합니다.
5. 배포 후 발급된 `https://...onrender.com` 주소로 접속합니다.

`render.yaml`은 `/var/data/content.json`을 데이터 저장 경로로 사용하도록 되어 있습니다. 영구 저장을 위해 Render Disk 설정을 포함했고, Web Service 플랜은 `starter`로 지정했습니다.

## 3. 직접 Web Service로 만들 때

- Runtime: Node
- Build Command: 비워두기
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Plan: `starter` 이상 권장

환경변수:

```text
NODE_ENV=production
ADMIN_USER=admin
ADMIN_PASS=강한비밀번호
DATA_FILE=/var/data/content.json
```

## 4. 운영 전환 전 남은 일

현재 구현은 베타 공유용입니다. 운영 전환 전에는 다음을 권장합니다.

- 관리자 로그인 세션 만료/로그아웃 처리 강화
- DB 또는 Supabase/Postgres 연동
- 관리자 접근 IP 제한 또는 2차 인증
- 실제 회원 인증 시스템 연결
- 외부 링크/공지/랭킹 데이터 수집 자동화
