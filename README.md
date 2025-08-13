# 📢 공지 뷰어 FE

금융감독원(FSS)·금융위원회(FSC) 크롤러에서 수집한 데이터를 기반으로  
부서별 메일 목록 조회, 상세, 검색, 필터링, 첨부 미리보기 등을 제공하는  
Vanilla JS + HTML 기반 프론트엔드입니다.

---

## 주요 기능
- 로그인 및 세션 유지
- 최신순 정렬, 페이지네이션
- 검색(제목·본문), 필터(전체/안읽음/즐겨찾기)
- 메일 상세 보기  
  (제목, 본문, AI 생성 정보: 관련 부서, 요약, 체크리스트)
- 상태 동기화  
  (읽음/즐겨찾기 상태 변경 시 모든 페이지에 반영)
- 알림 기능  
  (최신 메일 알림 목록 및 토스트 알림 표시)
- 알림 클릭 시 상세 페이지 이동
- 공통 UI  
  (상단 네비게이션 GNB와 사이드바로 페이지 이동, 로고 클릭 시 기본 페이지 이동)


## 프로젝트 구조
```
FRONT/
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
├── db/ # 로컬 DB
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
│ ├── department.html # 로그인/부서 선택 페이지 HTML
│ ├── department.js # 로그인/부서 선택 페이지 스크립트
│ │
│ ├── gnb.js # 상단 네비게이션(GNB) 스크립트
│ │
│ ├── important.html # 즐겨찾기 페이지 HTML
│ ├── important.js # 즐겨찾기 페이지 스크립트
│ │
│ ├── index.css # 인덱스 페이지 스타일
│ ├── index.html # 진입 페이지 HTML
│ ├── index.js # 진입 페이지 스크립트
│ │
│ ├── mail_detail.html # 메일 상세 페이지 HTML
│ ├── mail_detail.js # 메일 상세 페이지 스크립트
│ │
│ ├── script.js # 공통 유틸리티 스크립트
│ ├── style.css # 공통 스타일시트
│
├── .gitignore # Git 무시 규칙
├── app.js # 서버 또는 Electron 초기화
├── forge.config.js # Electron Forge 설정
├── main.js # Electron 메인 프로세스
├── preload.js # Electron 프리로드 스크립트
├── package.json # 프로젝트 메타 정보
└── README.md # 프로젝트 설명서
```


##  실행 방법

### 환경 설정
- Node.js 18+
- npm 또는 yarn
- (Electron 환경) OS별 빌드 도구 설치

### 라이브러리 설치
```
npm install
```
실행
브라우저 환경

```
npx serve public
```
Electron 환경
```
npm start
```


### API 연동 예시
- 목록 조회
```
GET /api/notices?department_id=<id>&q=<query>&page=<n>&size=<n>&filter=<all|unread|starred>
```
- 상세 조회
```
GET /api/notices/:id?department_id=<id>
```
- 읽음 처리
```
POST /api/notices/:id/read
{ "department_id": 3 }
```

- 즐겨찾기 변경
```
POST /api/notices/:id/star { "department_id": 3, "value": true }
```
