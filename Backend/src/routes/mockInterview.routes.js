// const express = require("express");

// const router = express.Router();

// const {
//   startInterviewController,
//   submitAnswerController,
//   getInterviewSessionController,
//   getAllInterviewSessionsController,
// } = require("../controllers/mockInterview.controller");

// const { authUser } = require("../middlewares/auth.middleware");
// const upload = require("../middlewares/file.middleware");

// router.post("/start", authUser, startInterviewController);
// router.post(
//   "/:sessionId/answer",
//   authUser,
//   upload.single("audio"),
//   submitAnswerController,
// );
// // router.post("/:sessionId/answer", authUser, submitAnswerController);
// router.get("/:sessionId", authUser, getInterviewSessionController);
// router.get("/", authUser, getAllInterviewSessionsController);

// module.exports = router;

const express = require("express");

const router = express.Router();

const {
  startInterviewController,
  submitAnswerController,
  getInterviewSessionController,
  getAllInterviewSessionsController,
  getActiveInterviewsController,
  abandonInterviewController,
  resumeInterviewController,
} = require("../controllers/mockInterview.controller");

const { authUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

// NEW: Check for active/resumable interviews
router.get("/active", authUser, getActiveInterviewsController);

// Existing routes
router.post("/start", authUser, startInterviewController);

router.post(
  "/:sessionId/answer",
  authUser,
  upload.single("audio"),
  submitAnswerController,
);

// POST /api/interviews/:sessionId/resume - Resume abandoned interview
router.post("/:sessionId/resume", authUser, resumeInterviewController);

// NEW: Abandon interview
router.post("/:sessionId/abandon", authUser, abandonInterviewController);

router.get("/:sessionId", authUser, getInterviewSessionController);

router.get("/", authUser, getAllInterviewSessionsController);

module.exports = router;
