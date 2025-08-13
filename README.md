# 💵KKaeBee - GPT 기반 금융 규제 모니터링 및 준법 지원 서비스
금융감독원(FSS)·금융위원회(FSC) 크롤러에서 수집한 공개하는 입법예고·규정 개정 공지 데이터를 기반으로  
GPT API 기반 분석을 통해 부서별 맞춤 요약·체크리스트를 생성하여 실시간 알림 및 메일함 UI로 제공하는 데스크톱 애플리케이션입니다.

📦 실행 파일 다운로드: [v1.0.1](https://pine-shampoo-03a.notion.site/24cc1817c55e80a69e3df10729e9c95e)

---

### ✍️ 프로젝트 개요

- 프로젝트 기간: 2023.7 ~ 2023.8.13
- 프로젝트 형태: KB국민은행 제7회 AI Challenge
- 프로젝트 문서: [Notion](https://pine-shampoo-03a.notion.site/KB-AI-CHALLENGE-230c1817c55e8047a49fd06d822699ac?source=copy_link)

---

### 📌 주요 기능
- **33개 부서별 로그인**
- **메일함 기반 UI**
  - 부서별 / 중요 / 전체 메일함
  - 검색·즐겨찾기·담당자 지정 기능
- **메일 상세 페이지**
  - 제목, 본문, AI 생성 정보(관련 부서, 요약, 체크리스트)
- **알림 기능**
  - 최신 메일 알림 목록 및 토스트 알림 표시
- **멀티 환경 지원**
  - 브라우저 환경 실행
  - Electron 기반 데스크톱 앱

---
### 🧑‍💻 팀원 소개
| 이름  | 역할             | 담당 업무                           |
| --- | -------------- | ------------------------------- |
| 김송혜 | 프론트엔드 & UI 개발 | 메일함 UI, GPT API 연동   |
| 장서현 | 프론트엔드 & UI 개발   | 메일함 UI, 알림 시스템, CSS 스타일링 |
| 최현진 | 백엔드 & API 설계  | API 서버, DB 설계, Electron 메인 프로세스        |
---

### 📂 프로젝트 구조
```
KKaeBee/
├── api/ # 백엔드 API 라우팅
│ ├── controllers/ # API 컨트롤러
│ │ ├── department.js
│ │ └── notice.js
│ └── routes/ # API 라우트
│ ├── department.js
│ └── notice.js
│
├── data/ # 데이터 저장 디렉토리
│
├── db/ # sqlite3 기반 로컬 DB
│ ├── app.db
│ └── connect.js
│
├── public/ # 프론트엔드 정적 리소스
│ ├── btn/ # 버튼 이미지
│ ├── icon/ # 아이콘
│ ├── logo/ # 로고
│ │
│ ├── alarm.html # 알림 페이지 HTML
│ ├── alarm.js # 알림 페이지 스크립트
│ │
│ ├── all_mail.html # 전체 메일 페이지 HTML
│ ├── all_mail.js # 전체 메일 페이지 스크립트
│ │
│ ├── department.html # 부서별 메일 페이지 HTML
│ ├── department.js # 부서별 메일 페이지 스크립트
│ │
│ ├── gnb.js # 상단 네비게이션(GNB) 스크립트
│ │
│ ├── important.html # 중요 메일 페이지 HTML
│ ├── important.js # 중요 메일 페이지 스크립트
│ │
│ ├── index.css # 인덱스 페이지 스타일
│ ├── index.html # 인덱스 페이지 HTML
│ ├── index.js # 인덱스 페이지 스크립트
│ │
│ ├── mail_detail.html # 메일 상세 페이지 HTML
│ ├── mail_detail.js # 메일 상세 페이지 스크립트
│ │
│ ├── script.js # 공통 유틸리티 스크립트
│ └── style.css # 공통 스타일시트
│
├── app.js # 웹 서버 또는 Electron 초기화
├── forge.config.js # Electron Forge 설정
├── main.js # Electron 메인 프로세스
├── preload.js # Electron 프리로드 스크립트
└── README.md # 프로젝트 설명서
```

---
### 🚀실행 방법

1. 환경 설정
- Node.js 18 이상
```
node -v
```

2. 프로젝트 클론
```
git clone [repo_url]
cd KKaeBee
```

3.  라이브러리 설치
```
npm install
```
4. 브라우저 환경

```
npx serve public
```
5. Electron 환경
```
npm start
```
---
### ⚙️ 기술 스택
| 구분         | 사용 기술                                                                                                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 데이터    | ![ChatGPT](https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge\&logo=openai\&logoColor=white) <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white">                                                                                                                 |
| 프론트엔드  | <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">            |
| 백엔드    | <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"> <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white"> ![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge\&logo=sqlite\&logoColor=white) |
| 배포 | ![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge\&logo=Electron\&logoColor=white)                                                                                                                                                                                                                 |
