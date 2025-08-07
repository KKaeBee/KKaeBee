const express = require("express");
const app = express();
const cors = require("cors");

// 라우터
const departmentRoutes = require("./api/routes/department");
const noticeRoutes = require("./api/routes/notice");

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 등록
app.use("/api/departments", departmentRoutes);
app.use("/api/notices", noticeRoutes);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
