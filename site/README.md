# PICA HUB 로컬 서버 연동 버전

`site` 폴더의 기존 정적 HTML을 로컬 서버와 연결한 버전입니다. 메인/로그인/대시보드는 그대로 사용하면서, 공지사항과 게임순위 등 샘플 데이터는 `data/content.json`에서 읽고 관리자 백오피스에서 수정할 수 있습니다.

## 실행

```powershell
cd "C:\Users\jwh54\OneDrive\바탕 화면\업무효율화\PC방닷컴 리뉴얼"
node site\server\server.js
```

Codex 번들 Node를 사용할 경우:

```powershell
& "C:\Users\jwh54\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" site\server\server.js
```

## 접속 URL

- 메인: http://localhost:5174/
- 로그인: http://localhost:5174/login.html
- 대시보드: http://localhost:5174/dashboard.html
- 관리자 백오피스: http://localhost:5174/admin.html
- 콘텐츠 API: http://localhost:5174/api/content

## 외부 공개 배포

루트의 `package.json`, `render.yaml`, `DEPLOY.md`를 추가했습니다. Render 기준으로 GitHub 저장소 연결 후 Blueprint/Web Service로 배포할 수 있습니다.

관리자 저장값을 유지하려면 Persistent Disk가 필요하므로 `render.yaml`은 `starter` 플랜과 `/var/data/content.json` 저장 경로로 구성되어 있습니다. 무료 Web Service로도 페이지 공개는 가능하지만 재시작/재배포 후 관리자 저장값이 사라질 수 있습니다.

## 관리자 계정

- 아이디: `admin`
- 비밀번호: `admin1234`

환경변수로 변경할 수 있습니다.

```powershell
$env:ADMIN_USER="admin"
$env:ADMIN_PASS="새비밀번호"
node site\server\server.js
```

## 백오피스 관리 구역

- 게임순위
- 공지사항
- 프로그램/다운로드
- 커뮤니티
- 프로모션

저장 시 `site/data/content.json`에 반영됩니다. 현재는 로컬 파일 기반의 샘플 백오피스이며, 운영 DB나 실제 회원 인증 시스템이 붙기 전 단계의 구현입니다.

## 테스트 계정

- 점주: `owner` / `owner1234`
- PRO: `pro` / `pro1234`
- 일반 회원: `user` / `user1234`
