// import {
//   startInterviewApi,
//   submitAnswerApi,
//   getInterviewSessionApi,
// } from "../services/mockInterview.api.js";

// export const useMockInterview = () => {
//   return {
//     startInterviewApi,
//     submitAnswerApi,
//     getInterviewSessionApi,
//   };
// };

// import {
//   startInterviewApi,
//   submitAnswerApi,
//   getInterviewSessionApi,
//   getAllInterviewSessionsApi,
// } from "../services/mockInterview.api.js";

// export const useMockInterview = () => {
//   return {
//     startInterviewApi,
//     submitAnswerApi,
//     getInterviewSessionApi,
//     getAllInterviewSessionsApi,
//   };
// };

// import {
//   startInterviewApi,
//   submitAnswerApi,
//   getInterviewSessionApi,
//   getAllInterviewSessionsApi,
//   getActiveInterviewsApi,
//   resumeInterviewApi,
//   abandonInterviewApi,
// } from "../services/mockInterview.api.js";

// export const useMockInterview = () => {
//   return {
//     // Existing APIs
//     startInterviewApi,
//     submitAnswerApi,
//     getInterviewSessionApi,
//     getAllInterviewSessionsApi,

//     // NEW: For multiple interviews & resume functionality
//     getActiveInterviewsApi,
//     resumeInterviewApi,
//     abandonInterviewApi,
//   };
// };



import {
  startInterviewApi,
  submitAnswerApi,
  retryAdvanceApi,           // ← NEW
  getInterviewSessionApi,
  getAllInterviewSessionsApi,
  getActiveInterviewsApi,
  resumeInterviewApi,
  abandonInterviewApi,
} from "../services/mockInterview.api.js";

export const useMockInterview = () => {
  return {
    // ── Existing APIs ─────────────────────────────────────────
    startInterviewApi,
    submitAnswerApi,           // NOTE: signature now takes questionIndex
    getInterviewSessionApi,
    getAllInterviewSessionsApi,

    // ── Resume / lifecycle ────────────────────────────────────
    getActiveInterviewsApi,
    resumeInterviewApi,
    abandonInterviewApi,

    // ── NEW: retry advance (no audio) ─────────────────────────
    // Call this when the server returns NEXT_QUESTION_UNAVAILABLE,
    // FINAL_REPORT_UNAVAILABLE, AI_RATE_LIMIT, or retryable: true.
    retryAdvanceApi,
  };
};