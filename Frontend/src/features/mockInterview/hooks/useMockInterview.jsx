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

import {
  startInterviewApi,
  submitAnswerApi,
  getInterviewSessionApi,
  getAllInterviewSessionsApi,
  getActiveInterviewsApi,
  resumeInterviewApi,
  abandonInterviewApi,
} from "../services/mockInterview.api.js";

export const useMockInterview = () => {
  return {
    // Existing APIs
    startInterviewApi,
    submitAnswerApi,
    getInterviewSessionApi,
    getAllInterviewSessionsApi,

    // NEW: For multiple interviews & resume functionality
    getActiveInterviewsApi,
    resumeInterviewApi,
    abandonInterviewApi,
  };
};
