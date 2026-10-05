// const { GoogleGenAI } = require("@google/genai");

// if (!process.env.GOOGLE_GENAI_API_KEY) {
//   throw new Error("GOOGLE_GENAI_API_KEY is not set");
// }

// const ai = new GoogleGenAI({
//   apiKey: process.env.GOOGLE_GENAI_API_KEY,
// });

// // ======================================================
// // FALLBACK MODELS
// // ======================================================

// const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// // ======================================================
// // CONFIG
// // ======================================================

// const MAX_RETRIES_PER_MODEL = 2;
// const BASE_DELAY_MS = 1200;
// const MAX_DELAY_MS = 5000;
// const REQUEST_TIMEOUT_MS = 20000;

// // ======================================================
// // DELAY HELPER
// // ======================================================

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // ======================================================
// // GENERATE WITH FALLBACK
// // ======================================================

// async function generateWithFallback(prompt, config = {}) {
//   let lastError = null;

//   for (const modelName of models) {
//     for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
//       try {
//         console.log(`[AI] Trying model: ${modelName}, attempt: ${attempt + 1}`);

//         const response = await Promise.race([
//           ai.models.generateContent({
//             model: modelName,
//             contents: prompt,
//             config: {
//               temperature: 0.3,
//               ...config,
//             },
//           }),
//           new Promise((_, reject) =>
//             setTimeout(
//               () =>
//                 reject(
//                   new Error(`AI request timeout after ${REQUEST_TIMEOUT_MS}ms`),
//                 ),
//               REQUEST_TIMEOUT_MS,
//             ),
//           ),
//         ]);

//         if (!response || !response.text || typeof response.text !== "string") {
//           throw new Error(`Empty or invalid response from model: ${modelName}`);
//         }

//         return response;
//       } catch (error) {
//         lastError = error;

//         console.error(
//           `[AI] Model failed: ${modelName}, attempt: ${attempt + 1}, error: ${error.message}`,
//         );

//         const statusCode = error?.status || error?.statusCode || error?.code;
//         const errorMessage = String(error?.message || "").toLowerCase();

//         const isRetryable =
//           statusCode === 429 ||
//           statusCode === 500 ||
//           statusCode === 502 ||
//           statusCode === 503 ||
//           statusCode === 504 ||
//           errorMessage.includes("timeout") ||
//           errorMessage.includes("timed out") ||
//           errorMessage.includes("overloaded") ||
//           errorMessage.includes("resource exhausted") ||
//           errorMessage.includes("internal");

//         if (!isRetryable) {
//           break;
//         }

//         if (attempt < MAX_RETRIES_PER_MODEL) {
//           const backoff = Math.min(
//             BASE_DELAY_MS * Math.pow(2, attempt) +
//               Math.floor(Math.random() * 300),
//             MAX_DELAY_MS,
//           );

//           await delay(backoff);
//         }
//       }
//     }
//   }

//   throw new Error(lastError?.message || "All Gemini models failed");
// }

// // ======================================================
// // GENERATE FIRST QUESTION
// // ======================================================

// async function generateFirstQuestion({
//   role,
//   experienceLevel,
//   techStack,
//   interviewType,
// }) {
//   if (
//     !role ||
//     !experienceLevel ||
//     !Array.isArray(techStack) ||
//     techStack.length === 0 ||
//     !interviewType
//   ) {
//     throw new Error("Invalid input for generateFirstQuestion");
//   }

//   const prompt = `
// You are an expert technical interviewer conducting a REALISTIC job interview.

// Generate the FIRST interview question.

// IMPORTANT RULES:
// - Return ONLY valid JSON
// - Do NOT return markdown
// - Question should feel human and realistic
// - Question should match candidate experience level
// - Question should be relevant to provided tech stack
// - Keep interviewer tone professional
// - Return exactly one question
// - Do not add extra keys

// Candidate Details:
// Role: ${String(role).trim()}
// Experience Level: ${String(experienceLevel).trim()}
// Tech Stack: ${techStack.map((item) => String(item).trim()).join(", ")}
// Interview Type: ${String(interviewType).trim()}

// JSON FORMAT:
// {
//   "question": "string",
//   "category": "technical",
//   "difficulty": "easy"
// }
// `;

//   const response = await generateWithFallback(prompt, {
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         question: {
//           type: "string",
//         },
//         category: {
//           type: "string",
//           enum: ["technical", "behavioral", "system-design", "hr"],
//         },
//         difficulty: {
//           type: "string",
//           enum: ["easy", "medium", "hard"],
//         },
//       },
//       required: ["question", "category", "difficulty"],
//       additionalProperties: false,
//       propertyOrdering: ["question", "category", "difficulty"],
//     },
//   });

//   const parsed = JSON.parse(response.text);

//   if (
//     !parsed ||
//     typeof parsed.question !== "string" ||
//     !["technical", "behavioral", "system-design", "hr"].includes(
//       parsed.category,
//     ) ||
//     !["easy", "medium", "hard"].includes(parsed.difficulty)
//   ) {
//     throw new Error("Invalid AI JSON structure in generateFirstQuestion");
//   }

//   return parsed;
// }

// // ======================================================
// // EVALUATE ANSWER
// // ======================================================

// async function evaluateAnswer({
//   question,
//   answerTranscript,
//   role,
//   experienceLevel,
// }) {
//   if (!question || !answerTranscript || !role || !experienceLevel) {
//     throw new Error("Invalid input for evaluateAnswer");
//   }

//   const prompt = `
// You are an expert FAANG-level interviewer.

// Evaluate the candidate's interview answer.

// IMPORTANT:
// - Return ONLY valid JSON
// - Be realistic and critical
// - Evaluate actual technical understanding
// - Detect weak explanations
// - Detect communication issues
// - Detect filler words if present
// - Scores must be between 0 and 100
// - Do not add extra keys

// Candidate Role:
// ${String(role).trim()}

// Experience Level:
// ${String(experienceLevel).trim()}

// Interview Question:
// ${String(question).trim()}

// Candidate Answer:
// ${String(answerTranscript).trim()}

// JSON FORMAT:
// {
//   "technicalScore": 85,
//   "communicationScore": 70,
//   "confidenceScore": 65,
//   "clarityScore": 80,
//   "fillerWords": ["um", "like"],
//   "strengths": ["Good understanding of JWT"],
//   "improvements": ["Explain refresh tokens more clearly"],
//   "aiAnalysis": "Detailed evaluation summary"
// }
// `;

//   const response = await generateWithFallback(prompt, {
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         technicalScore: {
//           type: "number",
//         },
//         communicationScore: {
//           type: "number",
//         },
//         confidenceScore: {
//           type: "number",
//         },
//         clarityScore: {
//           type: "number",
//         },
//         fillerWords: {
//           type: "array",
//           items: {
//             type: "string",
//           },
//         },
//         strengths: {
//           type: "array",
//           items: {
//             type: "string",
//           },
//         },
//         improvements: {
//           type: "array",
//           items: {
//             type: "string",
//           },
//         },
//         aiAnalysis: {
//           type: "string",
//         },
//       },
//       required: [
//         "technicalScore",
//         "communicationScore",
//         "confidenceScore",
//         "clarityScore",
//         "fillerWords",
//         "strengths",
//         "improvements",
//         "aiAnalysis",
//       ],
//       additionalProperties: false,
//       propertyOrdering: [
//         "technicalScore",
//         "communicationScore",
//         "confidenceScore",
//         "clarityScore",
//         "fillerWords",
//         "strengths",
//         "improvements",
//         "aiAnalysis",
//       ],
//     },
//   });

//   const parsed = JSON.parse(response.text);

//   const scoreFields = [
//     "technicalScore",
//     "communicationScore",
//     "confidenceScore",
//     "clarityScore",
//   ];

//   for (const field of scoreFields) {
//     if (
//       typeof parsed[field] !== "number" ||
//       parsed[field] < 0 ||
//       parsed[field] > 100
//     ) {
//       throw new Error(`Invalid AI JSON structure in evaluateAnswer: ${field}`);
//     }
//   }

//   if (
//     !Array.isArray(parsed.fillerWords) ||
//     !Array.isArray(parsed.strengths) ||
//     !Array.isArray(parsed.improvements) ||
//     typeof parsed.aiAnalysis !== "string"
//   ) {
//     throw new Error("Invalid AI JSON structure in evaluateAnswer");
//   }

//   return parsed;
// }

// // ======================================================
// // GENERATE NEXT QUESTION
// // ======================================================

// async function generateNextQuestion({
//   previousQuestion,
//   previousAnswer,
//   previousFeedback,
//   role,
//   experienceLevel,
//   techStack,
// }) {
//   if (
//     !previousQuestion ||
//     !previousAnswer ||
//     !previousFeedback ||
//     !role ||
//     !experienceLevel ||
//     !Array.isArray(techStack) ||
//     techStack.length === 0
//   ) {
//     throw new Error("Invalid input for generateNextQuestion");
//   }

//   const prompt = `
// You are conducting a REALISTIC adaptive technical interview.

// Generate the NEXT interview question based on previous candidate performance.

// IMPORTANT:
// - Return ONLY valid JSON
// - Do NOT repeat concepts unless a follow-up is necessary
// - If candidate performed poorly:
//   - ask easier follow-up
// - If candidate performed well:
//   - ask deeper advanced question
// - Return exactly one question
// - Do not add extra keys

// Candidate Role:
// ${String(role).trim()}

// Experience Level:
// ${String(experienceLevel).trim()}

// Tech Stack:
// ${techStack.map((item) => String(item).trim()).join(", ")}

// Previous Question:
// ${String(previousQuestion).trim()}

// Candidate Answer:
// ${String(previousAnswer).trim()}

// Previous Feedback:
// ${JSON.stringify(previousFeedback)}

// JSON FORMAT:
// {
//   "question": "string",
//   "category": "technical",
//   "difficulty": "medium"
// }
// `;

//   const response = await generateWithFallback(prompt, {
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         question: {
//           type: "string",
//         },
//         category: {
//           type: "string",
//           enum: ["technical", "behavioral", "system-design", "hr"],
//         },
//         difficulty: {
//           type: "string",
//           enum: ["easy", "medium", "hard"],
//         },
//       },
//       required: ["question", "category", "difficulty"],
//       additionalProperties: false,
//       propertyOrdering: ["question", "category", "difficulty"],
//     },
//   });

//   const parsed = JSON.parse(response.text);

//   if (
//     !parsed ||
//     typeof parsed.question !== "string" ||
//     !["technical", "behavioral", "system-design", "hr"].includes(
//       parsed.category,
//     ) ||
//     !["easy", "medium", "hard"].includes(parsed.difficulty)
//   ) {
//     throw new Error("Invalid AI JSON structure in generateNextQuestion");
//   }

//   return parsed;
// }

// // ======================================================
// // FINAL INTERVIEW REPORT
// // ======================================================

// async function generateFinalInterviewReport(interviewSession) {
//   if (!interviewSession || typeof interviewSession !== "object") {
//     throw new Error("Invalid input for generateFinalInterviewReport");
//   }

//   const prompt = `
// You are a senior hiring manager.

// Generate a FINAL interview report.

// IMPORTANT:
// - Return ONLY valid JSON
// - Be realistic
// - Give honest hiring recommendation
// - Keep result concise and useful
// - Do not add extra keys

// Interview Data:
// ${JSON.stringify(interviewSession)}

// JSON FORMAT:
// {
//   "overallScore": 78,
//   "averageScores": {
//     "technicalScore": 80,
//     "communicationScore": 75,
//     "confidenceScore": 70,
//     "clarityScore": 82
//   },
//   "strengths": ["Strong backend fundamentals"],
//   "weaknesses": ["Weak system design knowledge"],
//   "recommendation": "Recommended for junior developer role",
//   "communicationSummary": "Good communication but needs more confidence",
//   "technicalSummary": "Strong MERN stack understanding",
//   "finalVerdict": "Hire"
// }
// `;

//   const response = await generateWithFallback(prompt, {
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         overallScore: {
//           type: "number",
//         },
//         averageScores: {
//           type: "object",
//           properties: {
//             technicalScore: {
//               type: "number",
//             },
//             communicationScore: {
//               type: "number",
//             },
//             confidenceScore: {
//               type: "number",
//             },
//             clarityScore: {
//               type: "number",
//             },
//           },
//           required: [
//             "technicalScore",
//             "communicationScore",
//             "confidenceScore",
//             "clarityScore",
//           ],
//           additionalProperties: false,
//           propertyOrdering: [
//             "technicalScore",
//             "communicationScore",
//             "confidenceScore",
//             "clarityScore",
//           ],
//         },
//         strengths: {
//           type: "array",
//           items: {
//             type: "string",
//           },
//         },
//         weaknesses: {
//           type: "array",
//           items: {
//             type: "string",
//           },
//         },
//         recommendation: {
//           type: "string",
//         },
//         communicationSummary: {
//           type: "string",
//         },
//         technicalSummary: {
//           type: "string",
//         },
//         finalVerdict: {
//           type: "string",
//         },
//       },
//       required: [
//         "overallScore",
//         "averageScores",
//         "strengths",
//         "weaknesses",
//         "recommendation",
//         "communicationSummary",
//         "technicalSummary",
//         "finalVerdict",
//       ],
//       additionalProperties: false,
//       propertyOrdering: [
//         "overallScore",
//         "averageScores",
//         "strengths",
//         "weaknesses",
//         "recommendation",
//         "communicationSummary",
//         "technicalSummary",
//         "finalVerdict",
//       ],
//     },
//   });

//   const parsed = JSON.parse(response.text);

//   if (
//     typeof parsed.overallScore !== "number" ||
//     parsed.overallScore < 0 ||
//     parsed.overallScore > 100 ||
//     !parsed.averageScores ||
//     typeof parsed.averageScores !== "object" ||
//     !Array.isArray(parsed.strengths) ||
//     !Array.isArray(parsed.weaknesses) ||
//     typeof parsed.recommendation !== "string" ||
//     typeof parsed.communicationSummary !== "string" ||
//     typeof parsed.technicalSummary !== "string" ||
//     typeof parsed.finalVerdict !== "string"
//   ) {
//     throw new Error(
//       "Invalid AI JSON structure in generateFinalInterviewReport",
//     );
//   }

//   const avgScoreFields = [
//     "technicalScore",
//     "communicationScore",
//     "confidenceScore",
//     "clarityScore",
//   ];

//   for (const field of avgScoreFields) {
//     if (
//       typeof parsed.averageScores[field] !== "number" ||
//       parsed.averageScores[field] < 0 ||
//       parsed.averageScores[field] > 100
//     ) {
//       throw new Error(
//         `Invalid AI JSON structure in generateFinalInterviewReport: ${field}`,
//       );
//     }
//   }

//   return parsed;
// }

// // ======================================================
// // EXPORTS
// // ======================================================

// module.exports = {
//   generateFirstQuestion,
//   evaluateAnswer,
//   generateNextQuestion,
//   generateFinalInterviewReport,
// };

// //uppr vala prfect he
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error("GOOGLE_GENAI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const QUESTION_MODEL =
  process.env.GEMINI_QUESTION_MODEL || "gemini-3.5-flash-lite";

const EVALUATION_MODEL =
  process.env.GEMINI_EVALUATION_MODEL || "gemini-3.6-flash";

const REPORT_MODEL = process.env.GEMINI_REPORT_MODEL || "gemini-3.6-flash";

const REQUEST_TIMEOUT_MS = 30_000;

const VALID_CATEGORIES = ["technical", "behavioral", "system-design", "hr"];

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

class AIServiceError extends Error {
  constructor(message, code, retryable = false) {
    super(message);

    this.name = "AIServiceError";
    this.code = code;
    this.retryable = retryable;

    Error.captureStackTrace?.(this, AIServiceError);
  }
}

/* =========================================================
   ERROR HELPERS
========================================================= */

function getStatusCode(error) {
  const status =
    error?.status ?? error?.statusCode ?? error?.response?.status ?? null;

  const numericStatus = Number(status);

  return Number.isInteger(numericStatus) ? numericStatus : null;
}

function classifyAIError(error) {
  if (error instanceof AIServiceError) {
    return error;
  }

  const status = getStatusCode(error);

  const message = String(error?.message || "").toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    message.includes("api key") ||
    message.includes("unauthorized")
  ) {
    return new AIServiceError(
      "AI authentication failed",
      "AI_AUTH_ERROR",
      false,
    );
  }

  if (status === 404) {
    return new AIServiceError(
      "Configured AI model is unavailable",
      "AI_MODEL_NOT_FOUND",
      false,
    );
  }

  if (status === 429) {
    return new AIServiceError(
      "AI service quota or rate limit exceeded",
      "AI_RATE_LIMIT",
      true,
    );
  }

  if (
    status === 408 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("temporarily unavailable") ||
    message.includes("unavailable")
  ) {
    return new AIServiceError(
      "AI service is temporarily unavailable",
      "AI_TEMPORARY_ERROR",
      true,
    );
  }

  return new AIServiceError(
    "AI service request failed",
    "AI_REQUEST_ERROR",
    false,
  );
}

/* =========================================================
   AI REQUEST
========================================================= */

async function generateAI(model, prompt, responseSchema) {
  if (!model) {
    throw new AIServiceError(
      "AI model is not configured",
      "AI_MODEL_NOT_CONFIGURED",
      false,
    );
  }

  if (!prompt || typeof prompt !== "string") {
    throw new AIServiceError("Invalid AI prompt", "AI_INVALID_PROMPT", false);
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model,

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema,
      },

      signal: controller.signal,
    });

    if (
      !response ||
      typeof response.text !== "string" ||
      !response.text.trim()
    ) {
      throw new AIServiceError(
        "AI returned an empty response",
        "AI_EMPTY_RESPONSE",
        true,
      );
    }

    try {
      return JSON.parse(response.text);
    } catch {
      throw new AIServiceError(
        "AI returned invalid JSON",
        "AI_INVALID_JSON",
        true,
      );
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new AIServiceError(
        "AI request timed out",
        "AI_TIMEOUT",
        true,
      );

      console.error("[AI ERROR]", {
        model,
        code: timeoutError.code,
      });

      throw timeoutError;
    }

    const normalized = classifyAIError(error);

    console.error("[AI ERROR]", {
      model,
      code: normalized.code,
      retryable: normalized.retryable,
      originalStatus: getStatusCode(error),
      message: error?.message,
    });

    throw normalized;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

function validateScore(value, fieldName) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new AIServiceError(
      `Invalid AI score: ${fieldName}`,
      "AI_INVALID_SCORE",
      false,
    );
  }
}

function validateQuestion(data) {
  if (
    !data ||
    typeof data.question !== "string" ||
    data.question.trim().length < 10
  ) {
    throw new AIServiceError(
      "AI generated an invalid question",
      "AI_INVALID_QUESTION",
      false,
    );
  }

  if (!VALID_CATEGORIES.includes(data.category)) {
    throw new AIServiceError(
      "AI generated an invalid question category",
      "AI_INVALID_QUESTION",
      false,
    );
  }

  if (!VALID_DIFFICULTIES.includes(data.difficulty)) {
    throw new AIServiceError(
      "AI generated an invalid question difficulty",
      "AI_INVALID_QUESTION",
      false,
    );
  }

  return {
    question: data.question.trim(),
    category: data.category,
    difficulty: data.difficulty,
  };
}

function validateFeedback(data) {
  if (!data || typeof data !== "object") {
    throw new AIServiceError(
      "Invalid AI feedback",
      "AI_INVALID_FEEDBACK",
      false,
    );
  }

  const scores = [
    "technicalScore",
    "communicationScore",
    "confidenceScore",
    "clarityScore",
  ];

  for (const field of scores) {
    validateScore(data[field], field);
  }

  if (!Array.isArray(data.fillerWords)) {
    throw new AIServiceError(
      "Invalid AI filler words",
      "AI_INVALID_FEEDBACK",
      false,
    );
  }

  if (!Array.isArray(data.strengths)) {
    throw new AIServiceError(
      "Invalid AI strengths",
      "AI_INVALID_FEEDBACK",
      false,
    );
  }

  if (!Array.isArray(data.improvements)) {
    throw new AIServiceError(
      "Invalid AI improvements",
      "AI_INVALID_FEEDBACK",
      false,
    );
  }

  if (typeof data.aiAnalysis !== "string" || !data.aiAnalysis.trim()) {
    throw new AIServiceError(
      "Invalid AI analysis",
      "AI_INVALID_FEEDBACK",
      false,
    );
  }

  return {
    technicalScore: data.technicalScore,
    communicationScore: data.communicationScore,
    confidenceScore: data.confidenceScore,
    clarityScore: data.clarityScore,
    fillerWords: data.fillerWords.map(String),
    strengths: data.strengths.map(String),
    improvements: data.improvements.map(String),
    aiAnalysis: data.aiAnalysis.trim(),
  };
}

function validateFinalReport(data) {
  if (!data || typeof data !== "object") {
    throw new AIServiceError(
      "Invalid final interview report",
      "AI_INVALID_REPORT",
      false,
    );
  }

  validateScore(data.overallScore, "overallScore");

  if (!data.averageScores || typeof data.averageScores !== "object") {
    throw new AIServiceError(
      "Invalid average scores",
      "AI_INVALID_REPORT",
      false,
    );
  }

  const averageScoreFields = [
    "technicalScore",
    "communicationScore",
    "confidenceScore",
    "clarityScore",
  ];

  for (const field of averageScoreFields) {
    validateScore(data.averageScores[field], `averageScores.${field}`);
  }

  if (!Array.isArray(data.strengths)) {
    throw new AIServiceError(
      "Invalid report strengths",
      "AI_INVALID_REPORT",
      false,
    );
  }

  if (!Array.isArray(data.weaknesses)) {
    throw new AIServiceError(
      "Invalid report weaknesses",
      "AI_INVALID_REPORT",
      false,
    );
  }

  const stringFields = [
    "recommendation",
    "communicationSummary",
    "technicalSummary",
    "finalVerdict",
  ];

  for (const field of stringFields) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new AIServiceError(
        `Invalid report field: ${field}`,
        "AI_INVALID_REPORT",
        false,
      );
    }
  }

  return {
    overallScore: data.overallScore,

    averageScores: {
      technicalScore: data.averageScores.technicalScore,
      communicationScore: data.averageScores.communicationScore,
      confidenceScore: data.averageScores.confidenceScore,
      clarityScore: data.averageScores.clarityScore,
    },

    strengths: data.strengths.map(String),
    weaknesses: data.weaknesses.map(String),

    recommendation: data.recommendation.trim(),

    communicationSummary: data.communicationSummary.trim(),

    technicalSummary: data.technicalSummary.trim(),

    finalVerdict: data.finalVerdict.trim(),
  };
}

/* =========================================================
   GEMINI SCHEMAS
========================================================= */

const questionSchema = {
  type: "object",

  properties: {
    question: {
      type: "string",
    },

    category: {
      type: "string",
      enum: VALID_CATEGORIES,
    },

    difficulty: {
      type: "string",
      enum: VALID_DIFFICULTIES,
    },
  },

  required: ["question", "category", "difficulty"],

  additionalProperties: false,
};

const feedbackSchema = {
  type: "object",

  properties: {
    technicalScore: {
      type: "number",
    },

    communicationScore: {
      type: "number",
    },

    confidenceScore: {
      type: "number",
    },

    clarityScore: {
      type: "number",
    },

    fillerWords: {
      type: "array",
      items: {
        type: "string",
      },
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },

    improvements: {
      type: "array",
      items: {
        type: "string",
      },
    },

    aiAnalysis: {
      type: "string",
    },
  },

  required: [
    "technicalScore",
    "communicationScore",
    "confidenceScore",
    "clarityScore",
    "fillerWords",
    "strengths",
    "improvements",
    "aiAnalysis",
  ],

  additionalProperties: false,
};

const finalReportSchema = {
  type: "object",

  properties: {
    overallScore: {
      type: "number",
    },

    averageScores: {
      type: "object",

      properties: {
        technicalScore: {
          type: "number",
        },

        communicationScore: {
          type: "number",
        },

        confidenceScore: {
          type: "number",
        },

        clarityScore: {
          type: "number",
        },
      },

      required: [
        "technicalScore",
        "communicationScore",
        "confidenceScore",
        "clarityScore",
      ],

      additionalProperties: false,
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },

    weaknesses: {
      type: "array",
      items: {
        type: "string",
      },
    },

    recommendation: {
      type: "string",
    },

    communicationSummary: {
      type: "string",
    },

    technicalSummary: {
      type: "string",
    },

    finalVerdict: {
      type: "string",
    },
  },

  required: [
    "overallScore",
    "averageScores",
    "strengths",
    "weaknesses",
    "recommendation",
    "communicationSummary",
    "technicalSummary",
    "finalVerdict",
  ],

  additionalProperties: false,
};

/* =========================================================
   FIRST QUESTION
========================================================= */

async function generateFirstQuestion({
  role,
  experienceLevel,
  techStack,
  interviewType,
}) {
  if (
    typeof role !== "string" ||
    !role.trim() ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim() ||
    !Array.isArray(techStack) ||
    techStack.length === 0 ||
    typeof interviewType !== "string" ||
    !interviewType.trim()
  ) {
    throw new AIServiceError(
      "Invalid input for generateFirstQuestion",
      "AI_INVALID_INPUT",
      false,
    );
  }

  const prompt = `
You are a professional interviewer.

Conduct a realistic ${interviewType} interview.

Candidate role:
${role}

Experience:
${experienceLevel}

Tech stack:
${techStack.join(", ")}

Generate the first interview question.

Rules:
- Match the candidate's experience.
- Match the role and technology.
- Do not ask a trivial question.
- Keep it conversational.
- Return exactly one question.
`;

  const result = await generateAI(QUESTION_MODEL, prompt, questionSchema);

  return validateQuestion(result);
}

/* =========================================================
   EVALUATE ANSWER
========================================================= */

async function evaluateAnswer({
  question,
  answerTranscript,
  role,
  experienceLevel,
}) {
  if (
    typeof question !== "string" ||
    !question.trim() ||
    typeof answerTranscript !== "string" ||
    !answerTranscript.trim() ||
    typeof role !== "string" ||
    !role.trim() ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim()
  ) {
    throw new AIServiceError(
      "Invalid input for evaluateAnswer",
      "AI_INVALID_INPUT",
      false,
    );
  }

  const prompt = `
You are a senior professional interviewer.

Evaluate the candidate's answer fairly.

Candidate role:
${role}

Experience level:
${experienceLevel}

Question:
${question}

Candidate answer:
${answerTranscript}

Evaluate:
1. Technical correctness
2. Communication
3. Confidence
4. Clarity
5. Filler words
6. Strengths
7. Improvements

Do not judge grammar alone.
Evaluate the actual quality of the answer.

Scores must be between 0 and 100.

Return JSON only.
`;

  const result = await generateAI(EVALUATION_MODEL, prompt, feedbackSchema);

  return validateFeedback(result);
}

/* =========================================================
   NEXT QUESTION
========================================================= */

async function generateNextQuestion({
  previousQuestion,
  previousAnswer,
  previousFeedback,
  role,
  experienceLevel,
  techStack,
  previousQuestions = [],
}) {
  if (
    typeof previousQuestion !== "string" ||
    !previousQuestion.trim() ||
    typeof previousAnswer !== "string" ||
    !previousAnswer.trim() ||
    !previousFeedback ||
    typeof role !== "string" ||
    !role.trim() ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim() ||
    !Array.isArray(techStack)
  ) {
    throw new AIServiceError(
      "Invalid input for generateNextQuestion",
      "AI_INVALID_INPUT",
      false,
    );
  }

  const prompt = `
You are conducting an adaptive professional interview.

Candidate role:
${role}

Experience:
${experienceLevel}

Tech stack:
${techStack.join(", ")}

Previous question:
${previousQuestion}

Candidate answer:
${previousAnswer}

Previous evaluation:
${JSON.stringify(previousFeedback)}

Previously asked questions:
${JSON.stringify(previousQuestions)}

Generate the next question.

Rules:
- Do not repeat a previous question.
- If the candidate performed well, increase difficulty.
- If performance was weak, ask a useful follow-up.
- Stay relevant to the role.
- Return exactly one question.
`;

  const result = await generateAI(QUESTION_MODEL, prompt, questionSchema);

  return validateQuestion(result);
}

/* =========================================================
   FINAL REPORT
========================================================= */

async function generateFinalInterviewReport(interviewSession) {
  if (!interviewSession || !Array.isArray(interviewSession.questions)) {
    throw new AIServiceError(
      "Invalid interview session",
      "AI_INVALID_SESSION",
      false,
    );
  }

  const answeredQuestions = interviewSession.questions.filter(
    (question) =>
      question && question.feedback && typeof question.transcript === "string",
  );

  if (answeredQuestions.length === 0) {
    throw new AIServiceError(
      "No evaluated answers available for final report",
      "AI_NO_ANSWERS",
      false,
    );
  }

  const prompt = `
You are a senior hiring manager.

Generate a professional interview performance report.

Role:
${interviewSession.role}

Experience:
${interviewSession.experienceLevel}

Interview type:
${interviewSession.interviewType}

Interview answers:
${JSON.stringify(answeredQuestions)}

Provide:
- overall score
- average scores
- strengths
- weaknesses
- recommendation
- communication summary
- technical summary
- final verdict

The verdict must be based only on the interview evidence.

Scores must be between 0 and 100.

Return JSON only.
`;

  const result = await generateAI(REPORT_MODEL, prompt, finalReportSchema);

  return validateFinalReport(result);
}

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  generateFirstQuestion,
  evaluateAnswer,
  generateNextQuestion,
  generateFinalInterviewReport,
  AIServiceError,
};
