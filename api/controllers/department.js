const db = require("../../db/connect");

// 부서 로그인
// POST /api/departments/login
exports.loginDepartment = (req, res) => {
    const { name, password } = req.body;

    const query = `SELECT id, name FROM departments WHERE name = ? AND password = ?`;
    db.get(query, [name, password], (err, row) => {
        if (err) return res.status(500).json({ error: "Server error" });

        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        res.status(200).json({
            department_id: row.id,
            name: row.name,
        });
    });
};


