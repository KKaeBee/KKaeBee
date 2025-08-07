const express = require("express");
const router = express.Router();
const { loginDepartment } = require("../controllers/department");

// 부서 로그인
// POST /api/departments/login
router.post("/login", loginDepartment); 

module.exports = router;
