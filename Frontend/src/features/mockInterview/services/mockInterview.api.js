// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true,
// });

// // START INTERVIEW
// export const startInterviewApi = async (data) => {
//   const response = await API.post("/api/mock-interviews/start", data);

//   return response.data;
// };

// // SUBMIT ANSWER
// export const submitAnswerApi = async (sessionId, audioBlob) => {
//   const formData = new FormData();

//   formData.append("audio", audioBlob);

//   const response = await API.post(
//     `/api/mock-interviews/${sessionId}/answer`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     },
//   );

//   return response.data;
// };

// // GET SESSION
// export const getInterviewSessionApi = async (sessionId) => {
//   const response = await API.get(`/api/mock-interviews/${sessionId}`);

//   return response.data;
// };

// // GET ALL SESSIONS
// export const getAllInterviewSessionsApi = async () => {
//   const response = await API.get("/api/mock-interviews");

//   return response.data;
// // };
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true,
// });

// // START INTERVIEW
// export const startInterviewApi = async (data) => {
//   const response = await API.post("/api/mock-interviews/start", data);

//   return response.data;
// };

// // SUBMIT ANSWER
// export const submitAnswerApi = async (sessionId, audioBlob, answerDuration) => {
//   const formData = new FormData();

//   formData.append("audio", audioBlob, "interview-answer.webm");

//   formData.append("answerDuration", String(answerDuration));

//   const response = await API.post(
//     `/api/mock-interviews/${sessionId}/answer`,
//     formData,
//   );

//   return response.data;
// };

// // GET SINGLE SESSION
// export const getInterviewSessionApi = async (sessionId) => {
//   const response = await API.get(`/api/mock-interviews/${sessionId}`);

//   return response.data;
// };

// // GET ALL SESSIONS
// export const getAllInterviewSessionsApi = async (page = 1, limit = 10) => {
//   const response = await API.get("/api/mock-interviews", {
//     params: {
//       page,
//       limit,
//     },
//   });

//   return response.data;
// };

//uppr vala preplexity se pehle vala he

// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true,
// });

// // ============================================================
// // NEW: GET ACTIVE INTERVIEWS (Check before starting)
// // ============================================================

// export const getActiveInterviewsApi = async () => {
//   const response = await API.get("/api/mock-interviews/active");
//   return response.data;
// };

// // ============================================================
// // NEW: RESUME ABANDONED INTERVIEW
// // ============================================================

// export const resumeInterviewApi = async (sessionId) => {
//   const response = await API.post(`/api/mock-interviews/${sessionId}/resume`);
//   return response.data;
// };

// // ============================================================
// // NEW: ABANDON INTERVIEW
// // ============================================================

// export const abandonInterviewApi = async (sessionId) => {
//   const response = await API.post(`/api/mock-interviews/${sessionId}/abandon`);
//   return response.data;
// };

// // ============================================================
// // EXISTING: START INTERVIEW
// // ============================================================

// export const startInterviewApi = async (data) => {
//   const response = await API.post("/api/mock-interviews/start", data);
//   return response.data;
// };

// // ============================================================
// // EXISTING: SUBMIT ANSWER
// // ============================================================

// export const submitAnswerApi = async (sessionId, audioBlob, answerDuration) => {
//   const formData = new FormData();

//   formData.append("audio", audioBlob, "interview-answer.webm");
//   formData.append("answerDuration", String(answerDuration));

//   const response = await API.post(
//     `/api/mock-interviews/${sessionId}/answer`,
//     formData,
//   );

//   return response.data;
// };

// // ============================================================
// // EXISTING: GET SINGLE SESSION
// // ============================================================

// export const getInterviewSessionApi = async (sessionId) => {
//   const response = await API.get(`/api/mock-interviews/${sessionId}`);
//   return response.data;
// };

// // ============================================================
// // EXISTING: GET ALL SESSIONS
// // ============================================================

// export const getAllInterviewSessionsApi = async (page = 1, limit = 10) => {
//   const response = await API.get("/api/mock-interviews", {
//     params: {
//       page,
//       limit,
//     },
//   });

//   return response.data;
// };



import axios from "axios";

// ── Config ────────────────────────────────────────────────────
// Vite:  VITE_API_URL="https://api.example.com"
// CRA:   REACT_APP_API_URL="https://api.example.com"
const BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 60_000, // generous — AI calls can take up to 30s
});

// ── Response normalizer ───────────────────────────────────────
// Flattens Axios errors into a predictable shape so components can
// branch on `err.code` and `err.retryable` without digging into
// `err.response.data`.
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const payload = error?.response?.data;

    // Already-normalized server error — pass it through
    if (payload && typeof payload === "object") {
      const normalized = new Error(payload.message || "Request failed");
      normalized.code = payload.code || "REQUEST_FAILED";
      normalized.status = error.response.status;
      normalized.retryable = Boolean(payload.retryable);
      normalized.retryWithoutAudio = Boolean(payload.retryWithoutAudio);
      normalized.action = payload.action || null;
      normalized.userMessage = payload.userMessage || payload.message || null;
      normalized.serverQuestionIndex = payload.serverQuestionIndex ?? null;
      normalized.clientQuestionIndex = payload.clientQuestionIndex ?? null;
      normalized.raw = payload;
      return Promise.reject(normalized);
    }

    // Network / timeout — treat as retryable
    const normalized = new Error(error.message || "Network error");
    normalized.code = error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR";
    normalized.status = 0;
    normalized.retryable = true;
    normalized.userMessage =
      "We could not reach the server. Please check your connection and try again.";
    return Promise.reject(normalized);
  },
);

// ============================================================
// ACTIVE / RESUMABLE
// ============================================================

export const getActiveInterviewsApi = async () => {
  const response = await API.get("/api/mock-interviews/active");
  return response.data;
};

export const resumeInterviewApi = async (sessionId) => {
  const response = await API.post(`/api/mock-interviews/${sessionId}/resume`);
  return response.data;
};

export const abandonInterviewApi = async (sessionId) => {
  const response = await API.post(`/api/mock-interviews/${sessionId}/abandon`);
  return response.data;
};

// ============================================================
// START / READ
// ============================================================

export const startInterviewApi = async (data) => {
  const response = await API.post("/api/mock-interviews/start", data);
  return response.data;
};

export const getInterviewSessionApi = async (sessionId) => {
  const response = await API.get(`/api/mock-interviews/${sessionId}`);
  return response.data;
};

export const getAllInterviewSessionsApi = async (page = 1, limit = 10) => {
  const response = await API.get("/api/mock-interviews", {
    params: { page, limit },
  });
  return response.data;
};

// ============================================================
// SUBMIT ANSWER (audio required)
// ============================================================
//
// FIX: `questionIndex` is now REQUIRED. It enables the server-side
// idempotency guard, so a lost HTTP response cannot corrupt the next
// question's transcript.
//
export const submitAnswerApi = async (
  sessionId,
  audioBlob,
  answerDuration,
  questionIndex,
) => {
  const formData = new FormData();

  formData.append("audio", audioBlob, "interview-answer.webm");
  formData.append("answerDuration", String(answerDuration));
  formData.append("questionIndex", String(questionIndex)); // ← REQUIRED

  const response = await API.post(
    `/api/mock-interviews/${sessionId}/answer`,
    formData,
  );

  return response.data;
};

// ============================================================
// RETRY ADVANCE (no audio)
// ============================================================
//
// Used when the previous answer was saved + evaluated but the
// follow-up step (next question OR final report) failed.
//
// The client should call this on any of these server responses:
//   - NEXT_QUESTION_UNAVAILABLE
//   - FINAL_REPORT_UNAVAILABLE
//   - AI_RATE_LIMIT
//   - retryable: true
//
// If the server replies ANSWER_NOT_READY, the client must go back
// to submitAnswerApi with the audio blob.
//
export const retryAdvanceApi = async (sessionId, questionIndex) => {
  const response = await API.post(
    `/api/mock-interviews/${sessionId}/advance`,
    { questionIndex },
  );
  return response.data;
};