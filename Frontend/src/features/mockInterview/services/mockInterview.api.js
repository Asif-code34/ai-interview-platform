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

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// ============================================================
// NEW: GET ACTIVE INTERVIEWS (Check before starting)
// ============================================================

export const getActiveInterviewsApi = async () => {
  const response = await API.get("/api/mock-interviews/active");
  return response.data;
};

// ============================================================
// NEW: RESUME ABANDONED INTERVIEW
// ============================================================

export const resumeInterviewApi = async (sessionId) => {
  const response = await API.post(`/api/mock-interviews/${sessionId}/resume`);
  return response.data;
};

// ============================================================
// NEW: ABANDON INTERVIEW
// ============================================================

export const abandonInterviewApi = async (sessionId) => {
  const response = await API.post(`/api/mock-interviews/${sessionId}/abandon`);
  return response.data;
};

// ============================================================
// EXISTING: START INTERVIEW
// ============================================================

export const startInterviewApi = async (data) => {
  const response = await API.post("/api/mock-interviews/start", data);
  return response.data;
};

// ============================================================
// EXISTING: SUBMIT ANSWER
// ============================================================

export const submitAnswerApi = async (sessionId, audioBlob, answerDuration) => {
  const formData = new FormData();

  formData.append("audio", audioBlob, "interview-answer.webm");
  formData.append("answerDuration", String(answerDuration));

  const response = await API.post(
    `/api/mock-interviews/${sessionId}/answer`,
    formData,
  );

  return response.data;
};

// ============================================================
// EXISTING: GET SINGLE SESSION
// ============================================================

export const getInterviewSessionApi = async (sessionId) => {
  const response = await API.get(`/api/mock-interviews/${sessionId}`);
  return response.data;
};

// ============================================================
// EXISTING: GET ALL SESSIONS
// ============================================================

export const getAllInterviewSessionsApi = async (page = 1, limit = 10) => {
  const response = await API.get("/api/mock-interviews", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};
