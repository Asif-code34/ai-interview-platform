

// const express = require("express");

// const router = express.Router();

// const {
//   startInterviewController,
//   submitAnswerController,
//   getInterviewSessionController,
//   getAllInterviewSessionsController,
//   getActiveInterviewsController,
//   abandonInterviewController,
//   resumeInterviewController,
// } = require("../controllers/mockInterview.controller");

// const { authUser } = require("../middlewares/auth.middleware");
// const upload = require("../middlewares/file.middleware");

// // NEW: Check for active/resumable interviews
// router.get("/active", authUser, getActiveInterviewsController);

// // Existing routes
// router.post("/start", authUser, startInterviewController);

// router.post(
//   "/:sessionId/answer",
//   authUser,
//   upload.single("audio"),
//   submitAnswerController,
// );

// // POST /api/interviews/:sessionId/resume - Resume abandoned interview
// router.post("/:sessionId/resume", authUser, resumeInterviewController);

// // NEW: Abandon interview
// router.post("/:sessionId/abandon", authUser, abandonInterviewController);

// router.get("/:sessionId", authUser, getInterviewSessionController);

// router.get("/", authUser, getAllInterviewSessionsController);

// module.exports = router;


const express = require("express");

const router = express.Router();

const {
  startInterviewController,
  submitAnswerController,
  retryAdvanceController,       // NEW
  getInterviewSessionController,
  getAllInterviewSessionsController,
  getActiveInterviewsController,
  abandonInterviewController,
  resumeInterviewController,
} = require("../controllers/mockInterview.controller");

const { authUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

// ── Active / resumable interviews ────────────────────────────
// MUST be declared before `/:sessionId` so "active" isn't parsed as an id.
router.get("/active", authUser, getActiveInterviewsController);

// ── Start a new interview ────────────────────────────────────
router.post("/start", authUser, startInterviewController);

// ── Submit a fresh answer (audio required) ───────────────────
router.post(
  "/:sessionId/answer",
  authUser,
  upload.single("audio"),
  submitAnswerController,
);

// ── Retry an already-saved answer (NO audio required) ────────
// Used when the client gets NEXT_QUESTION_UNAVAILABLE,
// FINAL_REPORT_UNAVAILABLE, or AI_RATE_LIMIT after the answer
// itself was successfully transcribed + evaluated.
router.post("/:sessionId/advance", authUser, retryAdvanceController);

// ── Resume / abandon ─────────────────────────────────────────
router.post("/:sessionId/resume", authUser, resumeInterviewController);
router.post("/:sessionId/abandon", authUser, abandonInterviewController);

// ── Read ─────────────────────────────────────────────────────
router.get("/:sessionId", authUser, getInterviewSessionController);
router.get("/", authUser, getAllInterviewSessionsController);

module.exports = router;