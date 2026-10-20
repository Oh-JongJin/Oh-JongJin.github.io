# 🍎 macOS Web Portfolio

macOS Sonoma 데스크톱 UI와 인터랙션을 웹 브라우저 상에 재현한 인터랙티브 포트폴리오 웹사이트입니다.

## ✨ 주요 기능
- **상단 메뉴바 (Menu Bar)**: 실시간 디지털 시계, 배터리/와이파이 상태, 현재 포커스된 앱 메뉴 연동
- **바탕화면 (Desktop)**: 고해상도 배경화면 및 클릭/더블클릭 가능한 바로가기 아이콘
- **윈도우 창 시스템 (Window System)**:
  - 빨강/노랑/초록 신호등 제어 버튼 (닫기, 최소화, 전체화면)
  - 마우스 드래그 이동 및 더블클릭 전체화면 토글
  - 다중 창 z-index 포커스 관리
- **하단 독 (Dock)**: Framer Motion의 물리 스프링 애니메이션 기반 마그니피케이션(돋보기 확대) 효과 및 실행 표시점
- **내장 앱**:
  - `About Me`: 개발자 프로필, 기술 스택, 소개
  - `Projects`: 진행한 프로젝트 카드 목록
  - `Photos`: 미니 사진 갤러리 뷰어
  - `Terminal`: `help`, `whoami`, `projects`, `clear` 등의 명령어를 지원하는 인터랙티브 터미널

---

## 🚀 로컬에서 실행하기

### Option A. Node.js (권장)
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

### Option B. Deno 2 (Node 없이 바로 실행)
```bash
# 로컬 개발 서버 실행
deno run --allow-all npm:vite
```

---

## 🌐 GitHub Pages 배포하기

1. **GitHub 저장소 생성 및 푸시**
   ```bash
   git init
   git add .
   git commit -m "feat: Initial macOS web portfolio"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```

2. **GitHub 저장소 Pages 설정**
   - 저장소 페이지의 **Settings** -> **Pages** 로 이동합니다.
   - **Build and deployment** 항목의 **Source**를 **`GitHub Actions`**로 선택합니다.
   - 잠시 후 Actions 탭에서 빌드가 완료되면 `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/` 주소로 사이트가 배포됩니다.
