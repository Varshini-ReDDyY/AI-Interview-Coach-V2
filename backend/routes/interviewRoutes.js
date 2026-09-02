const express = require("express");
const multer = require("multer");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInterview,
  uploadResume,
  generateQuestions,
  submitInterview,
   getHistory,
   getIdealAnswer,
   deleteInterview,
   finishLearning
} = require("../controllers/interviewController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

router.use(protect);

router.post("/create", createInterview);
router.post(
  "/upload-resume",
  upload.single("resume"),
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  },
  uploadResume
);
router.post("/generate", generateQuestions);
router.post("/submit", submitInterview);
router.get("/history", getHistory);
router.post("/ideal-answer", getIdealAnswer);
router.delete("/delete/:id", deleteInterview);
router.post("/finish-learning", finishLearning);

module.exports = router;