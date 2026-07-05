const express = require("express");
const router = express.Router();

const {
  createInterview,
  generateQuestions,
  submitInterview,
   getHistory,
   getIdealAnswer,
   deleteInterview,
   finishLearning
} = require("../controllers/interviewController");

router.post("/create", createInterview);
router.post("/generate", generateQuestions);
router.post("/submit", submitInterview);
router.get("/history/:userId", getHistory);
router.post("/ideal-answer", getIdealAnswer);
router.delete("/delete/:id", deleteInterview);
router.post("/finish-learning", finishLearning);

module.exports = router;