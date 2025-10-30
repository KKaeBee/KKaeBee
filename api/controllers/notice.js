const db = require("../../db/connect");
const fs = require("fs");
const path = require("path");

// 부서별 메일 목록 조회
// GET /api/notices?department_id=10
exports.getNoticesByDepartment = (req, res) => {
    const departmentId = req.query.department_id;

    const query = `
        SELECT
        n.id, n.title, n.date, n.source, n.type, n.url,
        ns.is_read, ns.is_starred, ns.assigned_to
        FROM notice n
        JOIN notice_targets nt ON n.id = nt.notice_id
        JOIN notice_status ns ON ns.notice_id = n.id AND ns.department_id = nt.department_id
        WHERE nt.department_id = ?
        ORDER BY n.date DESC;
    `;

    db.all(query, [departmentId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Server error" });
        const formatted = rows.map(row => ({
            ...row,
            is_read: !!row.is_read,
            is_starred: !!row.is_starred,
        }));
        res.status(200).json(formatted);
    });
};

// 즐겨찾기(IMPORTANT) 토글
// POST /api/notices/:id/star
exports.toggleStar = (req, res) => {
    const noticeId = req.params.id;
    const departmentId = req.body.department_id;

    if (!noticeId || !departmentId) {
        return res.status(400).json({ error: 'Missing notice_id or department_id' });
    }

    const checkQuery = `
        SELECT is_starred FROM notice_status
        WHERE notice_id = ? AND department_id = ?
    `;

    db.get(checkQuery, [noticeId, departmentId], (err, row) => {
        if (err) {
            console.error("DB 조회 오류:", err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Notice status not found' });
        }

        const newStarred = row.is_starred ? 0 : 1;

        const updateQuery = `
            UPDATE notice_status
            SET is_starred = ?
            WHERE notice_id = ? AND department_id = ?
        `;

        db.run(updateQuery, [newStarred, noticeId, departmentId], function (err) {
            if (err) {
                console.error("DB 업데이트 오류:", err.message);
                return res.status(500).json({ error: 'Update failed' });
            }

            return res.json({ is_starred: !!newStarred });
        });
    });
};

// 메일 읽음 처리
// POST /api/notices/:id/read
exports.markAsRead = (req, res) => {
    const noticeId = req.params.id;
    const departmentId = req.body.department_id;

    if (!noticeId || !departmentId) {
        return res.status(400).json({ error: 'Missing notice_id or department_id' });
    }

    const updateQuery = `
        UPDATE notice_status
        SET is_read = 1
        WHERE notice_id = ? AND department_id = ?
    `;

    db.run(updateQuery, [noticeId, departmentId], function (err) {
        if (err) {
            console.error("DB 오류:", err.message);
            return res.status(500).json({ error: 'Failed to update read status' });
        }

        return res.json({ success: true });
    });
};

// 메일 기본 내용 조회 (title, date, source, url, type)
// GET /api/notices/:notice_id
exports.getNoticeById = (req, res) => {
    const noticeId = req.params.notice_id;

    const query = `
        SELECT id, title, date, source, type, url
        FROM notice
        WHERE id = ?
    `;

    db.get(query, [noticeId], (err, row) => {
        if (err) {
            console.error("DB 오류:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (!row) {
            return res.status(404).json({ error: "Notice not found" });
        }

        return res.status(200).json(row);
    });
};

// 메일 정렬 (즐겨찾기/안읽은메일/최신순/담당자있음)
// GET /api/notices/sort?department_id=10&sort=starred
exports.getSortedNotices = (req, res) => {
    const departmentId = req.query.department_id;
    const sort = req.query.sort || null;

    if (!departmentId) {
        return res.status(400).json({ error: "Missing department_id" });
    }

    let baseQuery = `
        SELECT
            n.id,
            n.title,
            n.date,
            n.source,
            n.type,
            n.url,
            ns.is_read,
            ns.is_starred,
            ns.assigned_to
        FROM notice n
        JOIN notice_status ns ON n.id = ns.notice_id
    `;

    const params = [];

    if (sort === 'unread') {
        // 읽지 않은 메일은 부서에 매핑된 메일로 제한
        baseQuery += `
            JOIN notice_targets nt ON nt.notice_id = n.id AND nt.department_id = ?
            WHERE ns.department_id = ? AND ns.is_read = 0
        `;
        params.push(departmentId, departmentId);
    } else if (sort === 'starred') {
        baseQuery += `WHERE ns.department_id = ? AND ns.is_starred = 1`;
        params.push(departmentId);
    } else if (sort === 'assigned') {
        baseQuery += `WHERE ns.department_id = ? AND ns.assigned_to IS NOT NULL AND ns.assigned_to != ""`;
        params.push(departmentId);
    } else {
        // 최신순 기본 정렬
        baseQuery += `WHERE ns.department_id = ?`;
        params.push(departmentId);
    }

    baseQuery += ` ORDER BY n.date DESC`;

    db.all(baseQuery, params, (err, rows) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        const formatted = rows.map(row => ({
            ...row,
            is_read: !!row.is_read,
            is_starred: !!row.is_starred,
        }));

        return res.status(200).json(formatted);
    });
};

// 제목 기준 검색
// GET /api/notices/search?department_id=10&keyword=보험업감독업무&scope=inbox
exports.searchNotices = (req, res) => {
    const departmentId = req.query.department_id;
    const keyword = req.query.keyword;
    const scope = req.query.scope || 'all';

    if (!departmentId || !keyword) {
        return res.status(400).json({ error: "Missing department_id or keyword" });
    }

    const likeKeyword = `%${keyword}%`;

    // 공통 SELECT 구문
    let baseQuery = `
        SELECT
        n.id, n.title, n.date, n.source,
        ns.is_read, ns.is_starred, ns.assigned_to
        FROM notice n
        JOIN notice_status ns ON n.id = ns.notice_id
    `;

    // 조건절
    let whereClauses = [`ns.department_id = ?`, `n.title LIKE ?`];
    const params = [departmentId, likeKeyword];

    // scope에 따른 조건 분기
    if (scope === 'inbox') {
        baseQuery += `
            JOIN notice_targets nt ON nt.notice_id = n.id
        `;
        whereClauses.push(`nt.department_id = ?`);
        params.push(departmentId);
    } else if (scope === 'starred') {
        whereClauses.push(`ns.is_starred = 1`);
    } else if (scope === 'unread') {
        baseQuery += `
            JOIN notice_targets nt ON nt.notice_id = n.id
        `;
        whereClauses.push(`nt.department_id = ?`, `ns.is_read = 0`);
        params.push(departmentId);
    } else if (scope === 'assigned') {
        whereClauses.push(`ns.assigned_to IS NOT NULL`, `ns.assigned_to != ''`);
    }

    // 최종 쿼리
    const finalQuery = `${baseQuery} WHERE ${whereClauses.join(' AND ')} ORDER BY n.date DESC`;

    db.all(finalQuery, params, (err, rows) => {
        if (err) {
            console.error("DB 오류:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        const formatted = rows.map(row => ({
            ...row,
            is_read: !!row.is_read,
            is_starred: !!row.is_starred,
        }));

        return res.status(200).json(formatted);
    });
};

// 메일 상세 내용 조회 (부서/요약/체크리스트)
// GET /api/notices/:id/json
exports.getNoticeJson = (req, res) => {
    const noticeId = req.params.id;

    const query = `SELECT json_path, url FROM notice WHERE id = ?`;

    db.get(query, [noticeId], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(404).json({ error: "Notice not found" });

        const jsonFullPath = path.join(__dirname, "../..", row.json_path); // 절대 경로
        const targetUrl = row.url;

        fs.readFile(jsonFullPath, "utf-8", (err, data) => {
            if (err) return res.status(500).json({ error: "JSON file not found" });

            try {
                const parsed = JSON.parse(data);

                if (!Array.isArray(parsed)) {
                    return res.status(500).json({ error: "Invalid JSON format (expected array)" });
                }

                const matched = parsed.find(item => item.url === targetUrl);

                if (!matched) {
                    return res.status(404).json({ error: "Matching notice not found in JSON" });
                }

                const { department, summary, checklist } = matched;

                return res.status(200).json({
                    department: department || [],
                    summary: summary || {},
                    checklist: checklist || []
                });
            } catch (e) {
                return res.status(500).json({ error: "Failed to parse JSON" });
            }
        });
    });
};

// 전체 메일 목록 조회
// GET /api/notices/all?department_id=10
exports.getAllNoticesWithStatus = (req, res) => {
    const departmentId = Number(req.query.department_id);
    if (!departmentId) {
        return res.status(400).json({ error: "department_id is required" });
    }

    const sql = `
    SELECT
        n.id, n.title, n.date, n.source, n.type, n.url,
        -- 부서 상태(없으면 0/NULL 처리)
        COALESCE(ns.is_read, 0)   AS is_read,
        COALESCE(ns.is_starred, 0) AS is_starred,
        ns.assigned_to
    FROM notice n
    LEFT JOIN notice_status ns
        ON ns.notice_id = n.id
        AND ns.department_id = ?
        ORDER BY n.date DESC;
    `;

    db.all(sql, [departmentId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Server error" });

        const formatted = rows.map(r => ({
            ...r,
            is_read: !!r.is_read,
            is_starred: !!r.is_starred,
            assigned_to: r.assigned_to ?? null
        }));

        return res.status(200).json(formatted);
    });
};