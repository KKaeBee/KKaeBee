const express = require("express");
const router = express.Router();
const { getNoticesByDepartment, toggleStar, markAsRead, getNoticeById, getSortedNotices, searchNotices, getNoticeJson} = require("../controllers/notice");

// 제목 기준 검색
// GET /api/notices/search?department_id=10&keyword=보험업감독업무&scope=inbox
router.get("/search", searchNotices);

// 메일 정렬 (즐겨찾기/안읽은메일/최신순/담당자있음)
// GET /api/notices/sort?department_id=10&sort=starred
router.get('/sort', getSortedNotices);

// 즐겨찾기(IMPORTANT) 토글
// POST /api/notices/:id/star
router.post('/:id/star', toggleStar);

// 메일 읽음 처리
// POST /api/notices/:id/read
router.post('/:id/read', markAsRead);

// 메일 기본 내용 조회 (title, date, source, url, type)
// GET /api/notices/:notice_id
router.get('/:notice_id', getNoticeById);

// 메일 상세 내용 조회 (부서/요약/체크리스트)
// GET /api/notices/:id/json
router.get("/:id/json", getNoticeJson);

// 부서별 메일 목록 조회
// GET /api/notices?department_id=10
router.get("/", getNoticesByDepartment);

module.exports = router;
