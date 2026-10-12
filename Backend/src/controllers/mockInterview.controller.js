// const mongoose = require("mongoose");
// const mockInterviewSessionModel = require("../models/mockInterview.model");

// const {
//   generateFirstQuestion,
//   evaluateAnswer,
//   generateNextQuestion,
//   generateFinalInterviewReport,
// } = require("../services/interview.service");

// const { transcribeInterviewAudio } = require("../services/speech.service");

// async function startInterviewController(req, res, next) {
//   try {
//     const { role, experienceLevel, techStack, interviewType } = req.body;

//     if (!role || !experienceLevel) {
//       return res.status(400).json({
//         message: "Role and experience level are required",
//       });
//     }

//     const validExperienceLevels = ["fresher", "junior", "mid", "senior"];

//     if (!validExperienceLevels.includes(experienceLevel)) {
//       return res.status(400).json({
//         message: "Invalid experience level",
//       });
//     }

//     const validInterviewTypes = ["technical", "behavioral", "mixed"];

//     if (interviewType && !validInterviewTypes.includes(interviewType)) {
//       return res.status(400).json({
//         message: "Invalid interview type",
//       });
//     }

//     if (techStack && !Array.isArray(techStack)) {
//       return res.status(400).json({
//         message: "Tech stack must be an array",
//       });
//     }

//     const activeInterview = await mockInterviewSessionModel.findOne({
//       user: req.user.id,
//       status: "in-progress",
//     });

//     if (activeInterview) {
//       return res.status(400).json({
//         message: "Please complete your existing interview first",
//       });
//     }

//     const firstQuestion = await generateFirstQuestion({
//       role,
//       experienceLevel,
//       techStack: techStack || [],
//       interviewType: interviewType || "mixed",
//     });

//     const interviewSession = await mockInterviewSessionModel.create({
//       user: req.user.id,
//       role,
//       experienceLevel,
//       techStack: techStack || [],
//       interviewType: interviewType || "mixed",
//       questions: [
//         {
//           question: firstQuestion.question,
//           category: firstQuestion.category,
//           difficulty: firstQuestion.difficulty,
//         },
//       ],
//     });

//     return res.status(201).json({
//       message: "Interview session started successfully",
//       interviewSession,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function submitAnswerController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         message: "Invalid session id",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         message: "Audio file is required",
//       });
//     }

//     const allowedMimeTypes = [
//       "audio/webm",
//       "audio/wav",
//       "audio/mpeg",
//       "audio/mp3",
//     ];

//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       return res.status(400).json({
//         message: "Invalid audio format",
//       });
//     }

//     const answerTranscript = await transcribeInterviewAudio(
//       req.file.buffer,
//       req.file.mimetype,
//     );

//     if (!answerTranscript?.trim()) {
//       return res.status(400).json({
//         message: "Could not transcribe audio properly",
//       });
//     }

//     const interviewSession = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//     });

//     if (!interviewSession) {
//       return res.status(404).json({
//         message: "Interview session not found",
//       });
//     }

//     if (interviewSession.status === "completed") {
//       return res.status(400).json({
//         message: "Interview already completed",
//       });
//     }

//     const currentQuestion =
//       interviewSession.questions[interviewSession.currentQuestionIndex];

//     if (!currentQuestion) {
//       return res.status(400).json({
//         message: "Invalid current interview question",
//       });
//     }

//     if (currentQuestion.transcript) {
//       return res.status(400).json({
//         message: "Answer already submitted for this question",
//       });
//     }

//     currentQuestion.transcript = answerTranscript;

//     currentQuestion.answerDuration = Number(req.body.answerDuration) || 0;

//     const feedback = await evaluateAnswer({
//       question: currentQuestion.question,
//       answerTranscript,
//       role: interviewSession.role,
//       experienceLevel: interviewSession.experienceLevel,
//     });

//     currentQuestion.feedback = feedback;

//     const TOTAL_QUESTIONS = 5;

//     const isLastQuestion =
//       interviewSession.currentQuestionIndex >= TOTAL_QUESTIONS - 1;

//     if (isLastQuestion) {
//       await interviewSession.save();

//       const finalReport = await generateFinalInterviewReport(interviewSession);

//       interviewSession.finalReport = finalReport;

//       interviewSession.overallScore = finalReport.overallScore;

//       interviewSession.status = "completed";

//       interviewSession.completedAt = new Date();

//       await interviewSession.save();

//       return res.status(200).json({
//         message: "Interview completed successfully",
//         completed: true,
//         transcript: answerTranscript,
//         feedback,
//         finalReport,
//       });
//     }

//     const nextQuestion = await generateNextQuestion({
//       previousQuestion: currentQuestion.question,
//       previousAnswer: answerTranscript,
//       previousFeedback: feedback,
//       role: interviewSession.role,
//       experienceLevel: interviewSession.experienceLevel,
//       techStack: interviewSession.techStack,
//     });

//     interviewSession.questions.push({
//       question: nextQuestion.question,
//       category: nextQuestion.category,
//       difficulty: nextQuestion.difficulty,
//     });

//     interviewSession.currentQuestionIndex += 1;

//     await interviewSession.save();

//     return res.status(200).json({
//       message: "Answer submitted successfully",
//       completed: false,
//       transcript: answerTranscript,
//       feedback,
//       nextQuestion,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function getInterviewSessionController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         message: "Invalid session id",
//       });
//     }

//     const interviewSession = await mockInterviewSessionModel
//       .findOne({
//         _id: sessionId,
//         user: req.user.id,
//       })
//       .lean();

//     if (!interviewSession) {
//       return res.status(404).json({
//         message: "Interview session not found",
//       });
//     }

//     return res.status(200).json({
//       interviewSession,
//     });
//   } catch (error) {
//     next(error);
//   }
// }
// async function getAllInterviewSessionsController(req, res, next) {
//   try {
//     const page = Number(req.query.page) || 1;

//     const limit = Number(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     const interviewSessions = await mockInterviewSessionModel
//       .find({
//         user: req.user.id,
//       })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     return res.status(200).json({
//       count: interviewSessions.length,
//       page,
//       limit,
//       interviewSessions,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//   startInterviewController,
//   submitAnswerController,
//   getInterviewSessionController,
//   getAllInterviewSessionsController,
// };

//uppr vala correct he

// const mongoose = require("mongoose");
// const crypto = require("crypto");

// const mockInterviewSessionModel = require("../models/mockInterview.model");

// const {
//   generateFirstQuestion,
//   evaluateAnswer,
//   generateNextQuestion,
//   generateFinalInterviewReport,
//   AIServiceError,
// } = require("../services/interview.service");

// const { transcribeInterviewAudio } = require("../services/speech.service");

// const TOTAL_QUESTIONS = 5;

// const MAX_ROLE_LENGTH = 100;
// const MAX_TECH_STACK_ITEMS = 20;

// const MIN_ANSWER_DURATION = 1;
// const MAX_ANSWER_DURATION = 600;

// const PROCESSING_LOCK_TIMEOUT_MS = 2 * 60 * 1000;

// const VALID_EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior"];

// const VALID_INTERVIEW_TYPES = ["technical", "behavioral", "mixed"];

// function normalizeString(value) {
//   return typeof value === "string" ? value.trim() : "";
// }

// function normalizeTechStack(value) {
//   if (!Array.isArray(value)) {
//     return [];
//   }

//   return [
//     ...new Set(value.map((item) => normalizeString(item)).filter(Boolean)),
//   ].slice(0, MAX_TECH_STACK_ITEMS);
// }

// function parseAnswerDuration(value) {
//   const duration = Number(value);

//   if (!Number.isFinite(duration)) {
//     return 0;
//   }

//   return Math.round(duration);
// }

// function createProcessingToken() {
//   return crypto.randomBytes(32).toString("hex");
// }

// function isLockStale(date) {
//   if (!date) {
//     return true;
//   }

//   return Date.now() - new Date(date).getTime() > PROCESSING_LOCK_TIMEOUT_MS;
// }

// async function startInterviewController(req, res, next) {
//   try {
//     const role = normalizeString(req.body.role);

//     const experienceLevel = normalizeString(
//       req.body.experienceLevel,
//     ).toLowerCase();

//     const interviewType = normalizeString(
//       req.body.interviewType || "mixed",
//     ).toLowerCase();

//     const techStack = normalizeTechStack(req.body.techStack);

//     if (!role) {
//       return res.status(400).json({
//         success: false,
//         message: "Role is required",
//       });
//     }

//     if (role.length > MAX_ROLE_LENGTH) {
//       return res.status(400).json({
//         success: false,
//         message: `Role cannot exceed ${MAX_ROLE_LENGTH} characters`,
//       });
//     }

//     if (!VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid experience level",
//       });
//     }

//     if (!VALID_INTERVIEW_TYPES.includes(interviewType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid interview type",
//       });
//     }

//     if (techStack.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one technology is required",
//       });
//     }

//     const activeInterview = await mockInterviewSessionModel.findOne({
//       user: req.user.id,
//       status: {
//         $in: ["in-progress", "processing"],
//       },
//     });

//     if (activeInterview) {
//       return res.status(409).json({
//         success: false,
//         message: "You already have an active interview",
//         sessionId: activeInterview._id,
//       });
//     }

//     const firstQuestion = await generateFirstQuestion({
//       role,
//       experienceLevel,
//       techStack,
//       interviewType,
//     });

//     const interviewSession = await mockInterviewSessionModel.create({
//       user: req.user.id,
//       role,
//       experienceLevel,
//       techStack,
//       interviewType,

//       status: "in-progress",

//       totalQuestions: TOTAL_QUESTIONS,

//       questions: [
//         {
//           question: firstQuestion.question,
//           category: firstQuestion.category,
//           difficulty: firstQuestion.difficulty,
//           answerStatus: "pending",
//         },
//       ],

//       lastActivityAt: new Date(),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Interview started",
//       interviewSession,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function submitAnswerController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Audio file is required",
//       });
//     }

//     const allowedMimeTypes = [
//       "audio/webm",
//       "audio/wav",
//       "audio/mpeg",
//       "audio/mp3",
//       "audio/ogg",
//       "audio/mp4",
//     ];

//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       return res.status(415).json({
//         success: false,
//         message: "Unsupported audio format",
//       });
//     }

//     const answerDuration = parseAnswerDuration(req.body.answerDuration);

//     if (
//       answerDuration < MIN_ANSWER_DURATION ||
//       answerDuration > MAX_ANSWER_DURATION
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `Answer duration must be between ${MIN_ANSWER_DURATION} and ${MAX_ANSWER_DURATION} seconds`,
//       });
//     }

//     let session = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//     });

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview session not found",
//       });
//     }

//     if (session.status === "completed") {
//       return res.status(409).json({
//         success: false,
//         message: "Interview already completed",
//       });
//     }

//     if (session.status === "abandoned") {
//       return res.status(409).json({
//         success: false,
//         message: "Interview has been abandoned",
//       });
//     }

//     const questionIndex = session.currentQuestionIndex;

//     const currentQuestion = session.questions[questionIndex];

//     if (!currentQuestion) {
//       return res.status(409).json({
//         success: false,
//         message: "No active question found",
//       });
//     }

//     if (
//       currentQuestion.answerStatus === "processing" &&
//       !isLockStale(currentQuestion.processingStartedAt)
//     ) {
//       return res.status(409).json({
//         success: false,
//         message: "This answer is already being processed",
//       });
//     }

//     if (currentQuestion.transcript && currentQuestion.feedback) {
//       return res.status(409).json({
//         success: false,
//         message: "Answer has already been processed",
//       });
//     }

//     const processingToken = createProcessingToken();

//     // Atomic claim.
//     const claimedSession = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,

//         status: "in-progress",

//         [`questions.${questionIndex}.answerStatus`]: {
//           $in: ["pending", "failed", "processing"],
//         },

//         $or: [
//           {
//             [`questions.${questionIndex}.answerStatus`]: {
//               $ne: "processing",
//             },
//           },

//           {
//             [`questions.${questionIndex}.processingStartedAt`]: {
//               $lt: new Date(Date.now() - PROCESSING_LOCK_TIMEOUT_MS),
//             },
//           },

//           {
//             [`questions.${questionIndex}.processingStartedAt`]: null,
//           },
//         ],
//       },

//       {
//         $set: {
//           status: "processing",

//           [`questions.${questionIndex}.answerStatus`]: "processing",

//           [`questions.${questionIndex}.processingToken`]: processingToken,

//           [`questions.${questionIndex}.processingStartedAt`]: new Date(),

//           [`questions.${questionIndex}.processingError`]: null,

//           lastActivityAt: new Date(),
//         },
//       },

//       {
//         new: true,
//       },
//     );

//     if (!claimedSession) {
//       return res.status(409).json({
//         success: false,
//         message: "This answer is already being processed",
//       });
//     }

//     session = claimedSession;

//     let transcript;

//     try {
//       transcript = await transcribeInterviewAudio(
//         req.file.buffer,
//         req.file.mimetype,
//       );
//     } catch (error) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         error.message,
//       );

//       return res.status(503).json({
//         success: false,
//         message: "We could not process your audio. Please try again.",
//       });
//     }

//     if (!transcript) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         "Empty transcript",
//       );

//       return res.status(422).json({
//         success: false,
//         message: "We could not understand your answer. Please try again.",
//       });
//     }

//     // Save transcript BEFORE AI evaluation.
//     const updated = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,

//         [`questions.${questionIndex}.processingToken`]: processingToken,
//       },

//       {
//         $set: {
//           [`questions.${questionIndex}.transcript`]: transcript,

//           [`questions.${questionIndex}.answerDuration`]: answerDuration,

//           [`questions.${questionIndex}.answerStatus`]: "transcribed",

//           lastActivityAt: new Date(),
//         },
//       },

//       {
//         new: true,
//       },
//     );

//     if (!updated) {
//       return res.status(409).json({
//         success: false,
//         message: "Answer processing state changed. Please refresh.",
//       });
//     }

//     const question = updated.questions[questionIndex];

//     let feedback;

//     try {
//       feedback = await evaluateAnswer({
//         question: question.question,
//         answerTranscript: transcript,
//         role: updated.role,
//         experienceLevel: updated.experienceLevel,
//       });
//     } catch (error) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         error.message,
//       );

//       if (error instanceof AIServiceError && error.code === "AI_RATE_LIMIT") {
//         return res.status(503).json({
//           success: false,
//           code: "AI_RATE_LIMIT",
//           message:
//             "Interview evaluation is temporarily unavailable. Your answer has been saved. Please retry.",
//           transcript,
//           retryable: true,
//         });
//       }

//       return res.status(503).json({
//         success: false,
//         message:
//           "Your answer was saved, but AI evaluation is temporarily unavailable.",
//         transcript,
//         retryable: true,
//       });
//     }

//     const feedbackSaved = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,

//         [`questions.${questionIndex}.processingToken`]: processingToken,
//       },

//       {
//         $set: {
//           [`questions.${questionIndex}.feedback`]: feedback,

//           [`questions.${questionIndex}.answerStatus`]: "evaluated",

//           [`questions.${questionIndex}.processingToken`]: null,

//           [`questions.${questionIndex}.processingStartedAt`]: null,

//           [`questions.${questionIndex}.processingError`]: null,

//           lastActivityAt: new Date(),
//         },
//       },

//       {
//         new: true,
//       },
//     );

//     if (!feedbackSaved) {
//       return res.status(409).json({
//         success: false,
//         message: "Could not finalize answer processing",
//       });
//     }

//     session = feedbackSaved;

//     const isLastQuestion = questionIndex >= session.totalQuestions - 1;

//     if (isLastQuestion) {
//       return completeInterview(session, res);
//     }

//     // Generate next question.
//     let nextQuestion;

//     try {
//       nextQuestion = await generateNextQuestion({
//         previousQuestion: question.question,

//         previousAnswer: transcript,

//         previousFeedback: feedback,

//         role: session.role,

//         experienceLevel: session.experienceLevel,

//         techStack: session.techStack,

//         previousQuestions: session.questions.map((item) => item.question),
//       });
//     } catch (error) {
//       // Answer remains safely stored.
//       return res.status(503).json({
//         success: false,
//         code: "NEXT_QUESTION_UNAVAILABLE",
//         message:
//           "Your answer was evaluated, but the next question is temporarily unavailable. Please retry.",
//         transcript,
//         feedback,
//         retryable: true,
//       });
//     }

//     session.questions.push({
//       question: nextQuestion.question,
//       category: nextQuestion.category,
//       difficulty: nextQuestion.difficulty,
//       answerStatus: "pending",
//     });

//     session.currentQuestionIndex = questionIndex + 1;

//     session.status = "in-progress";

//     session.lastActivityAt = new Date();

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       completed: false,
//       transcript,
//       feedback,
//       nextQuestion,
//       currentQuestionIndex: session.currentQuestionIndex,
//       totalQuestions: session.totalQuestions,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function markQuestionFailed(
//   sessionId,
//   questionIndex,
//   processingToken,
//   errorMessage,
// ) {
//   await mockInterviewSessionModel.updateOne(
//     {
//       _id: sessionId,

//       [`questions.${questionIndex}.processingToken`]: processingToken,
//     },

//     {
//       $set: {
//         status: "in-progress",

//         [`questions.${questionIndex}.answerStatus`]: "failed",

//         [`questions.${questionIndex}.processingError`]: String(
//           errorMessage,
//         ).slice(0, 500),

//         [`questions.${questionIndex}.processingToken`]: null,

//         [`questions.${questionIndex}.processingStartedAt`]: null,

//         lastActivityAt: new Date(),
//       },
//     },
//   );
// }

// async function completeInterview(session, res) {
//   try {
//     session.status = "processing";
//     session.lastActivityAt = new Date();

//     await session.save();

//     const finalReport = await generateFinalInterviewReport(session);

//     session.finalReport = finalReport;

//     session.overallScore = finalReport.overallScore;

//     session.status = "completed";

//     session.completedAt = new Date();

//     session.lastActivityAt = new Date();

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       completed: true,
//       transcript: session.questions[session.currentQuestionIndex].transcript,

//       feedback: session.questions[session.currentQuestionIndex].feedback,

//       finalReport,
//     });
//   } catch (error) {
//     session.status = "in-progress";

//     await session.save();

//     return res.status(503).json({
//       success: false,
//       code: "FINAL_REPORT_UNAVAILABLE",

//       message:
//         "Your interview answers were saved, but the final report is temporarily unavailable. Please retry.",

//       retryable: true,
//     });
//   }
// }

// async function getInterviewSessionController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     const session = await mockInterviewSessionModel
//       .findOne({
//         _id: sessionId,
//         user: req.user.id,
//       })
//       .lean();

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview session not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       interviewSession: session,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function getAllInterviewSessionsController(req, res, next) {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);

//     const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

//     const skip = (page - 1) * limit;

//     const filter = {
//       user: req.user.id,
//     };

//     const [sessions, total] = await Promise.all([
//       mockInterviewSessionModel
//         .find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       mockInterviewSessionModel.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,

//       data: {
//         sessions,

//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages: Math.ceil(total / limit),

//           hasNextPage: page < Math.ceil(total / limit),

//           hasPreviousPage: page > 1,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//   startInterviewController,
//   submitAnswerController,
//   getInterviewSessionController,
//   getAllInterviewSessionsController,
// };

//uppr vala perplexity se phle vala

//one user can give multiple interview



// const mongoose = require("mongoose");
// const crypto = require("crypto");

// const mockInterviewSessionModel = require("../models/mockInterview.model");

// const {
//   generateFirstQuestion,
//   evaluateAnswer,
//   generateNextQuestion,
//   generateFinalInterviewReport,
//   AIServiceError,
// } = require("../services/interview.service");

// const { transcribeInterviewAudio } = require("../services/speech.service");

// // ============================================================
// // CONFIGURATION
// // ============================================================

// const TOTAL_QUESTIONS = 5;
// const MAX_ROLE_LENGTH = 100;
// const MAX_TECH_STACK_ITEMS = 20;
// const MIN_ANSWER_DURATION = 1;
// const MAX_ANSWER_DURATION = 600;
// const PROCESSING_LOCK_TIMEOUT_MS = 2 * 60 * 1000;
// const SESSION_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
// const MAX_CONCURRENT_ACTIVE_INTERVIEWS = 2;

// const VALID_EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior"];
// const VALID_INTERVIEW_TYPES = ["technical", "behavioral", "mixed"];

// // ============================================================
// // UTILITY FUNCTIONS
// // ============================================================

// function normalizeString(value) {
//   return typeof value === "string" ? value.trim() : "";
// }

// function normalizeTechStack(value) {
//   if (!Array.isArray(value)) {
//     return [];
//   }

//   return [
//     ...new Set(value.map((item) => normalizeString(item)).filter(Boolean)),
//   ].slice(0, MAX_TECH_STACK_ITEMS);
// }

// function parseAnswerDuration(value) {
//   const duration = Number(value);

//   if (!Number.isFinite(duration)) {
//     return 0;
//   }

//   return Math.round(duration);
// }

// function createProcessingToken() {
//   return crypto.randomBytes(32).toString("hex");
// }

// function isLockStale(date) {
//   if (!date) {
//     return true;
//   }

//   return Date.now() - new Date(date).getTime() > PROCESSING_LOCK_TIMEOUT_MS;
// }

// async function markQuestionFailed(
//   sessionId,
//   questionIndex,
//   processingToken,
//   errorMessage,
// ) {
//   await mockInterviewSessionModel.updateOne(
//     {
//       _id: sessionId,
//       [`questions.${questionIndex}.processingToken`]: processingToken,
//     },
//     {
//       $set: {
//         status: "in-progress",
//         [`questions.${questionIndex}.answerStatus`]: "failed",
//         [`questions.${questionIndex}.processingError`]: String(
//           errorMessage,
//         ).slice(0, 500),
//         [`questions.${questionIndex}.processingToken`]: null,
//         [`questions.${questionIndex}.processingStartedAt`]: null,
//         lastActivityAt: new Date(),
//       },
//     },
//   );
// }

// async function completeInterview(session, res) {
//   try {
//     session.status = "processing";
//     session.lastActivityAt = new Date();

//     await session.save();

//     const finalReport = await generateFinalInterviewReport(session);

//     session.finalReport = finalReport;
//     session.overallScore = finalReport.overallScore;
//     session.status = "completed";
//     session.completedAt = new Date();
//     session.lastActivityAt = new Date();

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       completed: true,
//       transcript: session.questions[session.currentQuestionIndex].transcript,
//       feedback: session.questions[session.currentQuestionIndex].feedback,
//       finalReport,
//     });
//   } catch (error) {
//     session.status = "in-progress";
//     await session.save();

//     return res.status(503).json({
//       success: false,
//       code: "FINAL_REPORT_UNAVAILABLE",
//       message:
//         "Your interview answers were saved, but the final report is temporarily unavailable. Please retry.",
//       retryable: true,
//     });
//   }
// }

// // ============================================================
// // CONTROLLER: Get Active/Resumable Interviews
// // ============================================================

// async function getActiveInterviewsController(req, res, next) {
//   try {
//     const staleThreshold = new Date(Date.now() - SESSION_STALE_THRESHOLD_MS);

//     const sessions = await mockInterviewSessionModel
//       .find({
//         user: req.user.id,
//         status: { $in: ["in-progress", "processing", "abandoned"] },
//       })
//       .sort({ lastActivityAt: -1 })
//       .select(
//         "_id role experienceLevel techStack interviewType status currentQuestionIndex totalQuestions createdAt lastActivityAt explicitlyAbandoned",
//       )
//       .lean();

//     const activeSessions = sessions.filter(
//       (s) =>
//         (s.status === "in-progress" || s.status === "processing") &&
//         s.lastActivityAt >= staleThreshold,
//     );

//     const abandonedSessions = sessions.filter(
//       (s) =>
//         s.status === "abandoned" &&
//         !s.explicitlyAbandoned &&
//         s.lastActivityAt >= staleThreshold,
//     );

//     const canResume = activeSessions.length > 0 || abandonedSessions.length > 0;
//     const canStartNew = sessions.length < MAX_CONCURRENT_ACTIVE_INTERVIEWS;

//     return res.status(200).json({
//       success: true,
//       data: {
//         canResume,
//         canStartNew,
//         activeInterviewsCount: sessions.length,
//         resumableSessions: activeSessions,
//         abandonedSessions,
//         maxConcurrentInterviews: MAX_CONCURRENT_ACTIVE_INTERVIEWS,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Start Interview
// // ============================================================

// async function startInterviewController(req, res, next) {
//   try {
//     const role = normalizeString(req.body.role);
//     const experienceLevel = normalizeString(
//       req.body.experienceLevel,
//     ).toLowerCase();
//     const interviewType = normalizeString(
//       req.body.interviewType || "mixed",
//     ).toLowerCase();
//     const techStack = normalizeTechStack(req.body.techStack);
//     const forceNew = req.body.forceNew === true;

//     // Validation
//     if (!role) {
//       return res.status(400).json({
//         success: false,
//         message: "Role is required",
//       });
//     }

//     if (role.length > MAX_ROLE_LENGTH) {
//       return res.status(400).json({
//         success: false,
//         message: `Role cannot exceed ${MAX_ROLE_LENGTH} characters`,
//       });
//     }

//     if (!VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid experience level",
//       });
//     }

//     if (!VALID_INTERVIEW_TYPES.includes(interviewType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid interview type",
//       });
//     }

//     if (techStack.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one technology is required",
//       });
//     }

//     // Check and cleanup stale sessions
//     const staleThreshold = new Date(Date.now() - SESSION_STALE_THRESHOLD_MS);

//     const activeSessions = await mockInterviewSessionModel
//       .find({
//         user: req.user.id,
//         status: { $in: ["in-progress", "processing"] },
//       })
//       .select("_id status lastActivityAt");

//     // Auto-abandon stale sessions
//     for (const session of activeSessions) {
//       if (session.lastActivityAt < staleThreshold) {
//         await mockInterviewSessionModel.findByIdAndUpdate(session._id, {
//           status: "abandoned",
//           explicitlyAbandoned: false,
//           lastActivityAt: new Date(),
//         });
//       }
//     }

//     // Re-fetch active sessions after cleanup
//     const freshActiveSessions = await mockInterviewSessionModel
//       .find({
//         user: req.user.id,
//         status: { $in: ["in-progress", "processing"] },
//       })
//       .select("_id");

//     // Check max concurrent limit
//     if (freshActiveSessions.length >= MAX_CONCURRENT_ACTIVE_INTERVIEWS) {
//       return res.status(409).json({
//         success: false,
//         message: `You can have maximum ${MAX_CONCURRENT_ACTIVE_INTERVIEWS} active interviews at a time. Please complete or abandon an existing interview.`,
//         code: "MAX_INTERVIEWS_REACHED",
//         activeSessions: freshActiveSessions,
//       });
//     }

//     // If active sessions exist and not forcing new, return info for frontend decision
//     if (!forceNew && freshActiveSessions.length > 0) {
//       return res.status(200).json({
//         success: true,
//         message: "You have active interviews",
//         code: "ACTIVE_INTERVIEWS_EXIST",
//         activeSessions: freshActiveSessions,
//         canStartNew:
//           freshActiveSessions.length < MAX_CONCURRENT_ACTIVE_INTERVIEWS,
//       });
//     }

//     // Generate first question
//     const firstQuestion = await generateFirstQuestion({
//       role,
//       experienceLevel,
//       techStack,
//       interviewType,
//     });

//     // Create interview session
//     const interviewSession = await mockInterviewSessionModel.create({
//       user: req.user.id,
//       role,
//       experienceLevel,
//       techStack,
//       interviewType,
//       status: "in-progress",
//       totalQuestions: TOTAL_QUESTIONS,
//       questions: [
//         {
//           question: firstQuestion.question,
//           category: firstQuestion.category,
//           difficulty: firstQuestion.difficulty,
//           answerStatus: "pending",
//         },
//       ],
//       lastActivityAt: new Date(),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Interview started successfully",
//       interviewSession,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Resume Abandoned Interview (NEW - FIXES RESUME BUG)
// // ============================================================

// async function resumeInterviewController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     const session = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//       status: "abandoned",
//     });

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "No abandoned interview found to resume",
//       });
//     }

//     session.status = "in-progress";
//     session.explicitlyAbandoned = false;
//     session.lastActivityAt = new Date();
//     await session.save();

//     return res.status(200).json({
//       success: true,
//       message: "Interview resumed successfully",
//       interviewSession: session,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Submit Answer (FIXED - ALLOWS RESUMING ABANDONED)
// // ============================================================

// async function submitAnswerController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Audio file is required",
//       });
//     }

//     const allowedMimeTypes = [
//       "audio/webm",
//       "audio/wav",
//       "audio/mpeg",
//       "audio/mp3",
//       "audio/ogg",
//       "audio/mp4",
//     ];

//     if (!allowedMimeTypes.includes(req.file.mimetype)) {
//       return res.status(415).json({
//         success: false,
//         message: "Unsupported audio format",
//       });
//     }

//     const answerDuration = parseAnswerDuration(req.body.answerDuration);

//     if (
//       answerDuration < MIN_ANSWER_DURATION ||
//       answerDuration > MAX_ANSWER_DURATION
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `Answer duration must be between ${MIN_ANSWER_DURATION} and ${MAX_ANSWER_DURATION} seconds`,
//       });
//     }

//     let session = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//     });

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview session not found",
//       });
//     }

//     if (session.status === "completed") {
//       return res.status(409).json({
//         success: false,
//         message: "Interview already completed",
//       });
//     }

//     // ✅ FIXED: Allow resuming abandoned interviews
//     if (session.status === "abandoned") {
//       session.status = "in-progress";
//       session.lastActivityAt = new Date();
//       await session.save();
//       // Continue with answer submission
//     }

//     const questionIndex = session.currentQuestionIndex;
//     const currentQuestion = session.questions[questionIndex];

//     if (!currentQuestion) {
//       return res.status(409).json({
//         success: false,
//         message: "No active question found",
//       });
//     }

//     if (
//       currentQuestion.answerStatus === "processing" &&
//       !isLockStale(currentQuestion.processingStartedAt)
//     ) {
//       return res.status(409).json({
//         success: false,
//         message: "This answer is already being processed",
//       });
//     }

//     if (currentQuestion.transcript && currentQuestion.feedback) {
//       return res.status(409).json({
//         success: false,
//         message: "Answer has already been processed",
//       });
//     }

//     // Atomic claim with processing lock
//     const processingToken = createProcessingToken();

//     const claimedSession = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,
//         status: "in-progress",
//         [`questions.${questionIndex}.answerStatus`]: {
//           $in: ["pending", "failed", "processing"],
//         },
//         $or: [
//           {
//             [`questions.${questionIndex}.answerStatus`]: {
//               $ne: "processing",
//             },
//           },
//           {
//             [`questions.${questionIndex}.processingStartedAt`]: {
//               $lt: new Date(Date.now() - PROCESSING_LOCK_TIMEOUT_MS),
//             },
//           },
//           {
//             [`questions.${questionIndex}.processingStartedAt`]: null,
//           },
//         ],
//       },
//       {
//         $set: {
//           status: "processing",
//           [`questions.${questionIndex}.answerStatus`]: "processing",
//           [`questions.${questionIndex}.processingToken`]: processingToken,
//           [`questions.${questionIndex}.processingStartedAt`]: new Date(),
//           [`questions.${questionIndex}.processingError`]: null,
//           lastActivityAt: new Date(),
//         },
//       },
//       {
//         new: true,
//       },
//     );

//     if (!claimedSession) {
//       return res.status(409).json({
//         success: false,
//         message: "This answer is already being processed",
//       });
//     }

//     session = claimedSession;

//     // Transcribe audio
//     let transcript;
//     try {
//       transcript = await transcribeInterviewAudio(
//         req.file.buffer,
//         req.file.mimetype,
//       );
//     } catch (error) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         error.message,
//       );

//       return res.status(503).json({
//         success: false,
//         message: "We could not process your audio. Please try again.",
//       });
//     }

//     if (!transcript) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         "Empty transcript",
//       );

//       return res.status(422).json({
//         success: false,
//         message: "We could not understand your answer. Please try again.",
//       });
//     }

//     // Save transcript
//     const updated = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,
//         [`questions.${questionIndex}.processingToken`]: processingToken,
//       },
//       {
//         $set: {
//           [`questions.${questionIndex}.transcript`]: transcript,
//           [`questions.${questionIndex}.answerDuration`]: answerDuration,
//           [`questions.${questionIndex}.answerStatus`]: "transcribed",
//           lastActivityAt: new Date(),
//         },
//       },
//       {
//         new: true,
//       },
//     );

//     if (!updated) {
//       return res.status(409).json({
//         success: false,
//         message: "Answer processing state changed. Please refresh.",
//       });
//     }

//     // Evaluate answer
//     const question = updated.questions[questionIndex];
//     let feedback;
//     try {
//       feedback = await evaluateAnswer({
//         question: question.question,
//         answerTranscript: transcript,
//         role: updated.role,
//         experienceLevel: updated.experienceLevel,
//       });
//     } catch (error) {
//       await markQuestionFailed(
//         sessionId,
//         questionIndex,
//         processingToken,
//         error.message,
//       );

//       if (error instanceof AIServiceError && error.code === "AI_RATE_LIMIT") {
//         return res.status(503).json({
//           success: false,
//           code: "AI_RATE_LIMIT",
//           message:
//             "Interview evaluation is temporarily unavailable. Your answer has been saved. Please retry.",
//           transcript,
//           retryable: true,
//         });
//       }

//       return res.status(503).json({
//         success: false,
//         message:
//           "Your answer was saved, but AI evaluation is temporarily unavailable.",
//         transcript,
//         retryable: true,
//       });
//     }

//     // Save feedback
//     const feedbackSaved = await mockInterviewSessionModel.findOneAndUpdate(
//       {
//         _id: sessionId,
//         user: req.user.id,
//         [`questions.${questionIndex}.processingToken`]: processingToken,
//       },
//       {
//         $set: {
//           [`questions.${questionIndex}.feedback`]: feedback,
//           [`questions.${questionIndex}.answerStatus`]: "evaluated",
//           [`questions.${questionIndex}.processingToken`]: null,
//           [`questions.${questionIndex}.processingStartedAt`]: null,
//           [`questions.${questionIndex}.processingError`]: null,
//           lastActivityAt: new Date(),
//         },
//       },
//       {
//         new: true,
//       },
//     );

//     if (!feedbackSaved) {
//       return res.status(409).json({
//         success: false,
//         message: "Could not finalize answer processing",
//       });
//     }

//     session = feedbackSaved;

//     const isLastQuestion = questionIndex >= session.totalQuestions - 1;

//     if (isLastQuestion) {
//       return completeInterview(session, res);
//     }

//     // Generate next question
//     let nextQuestion;
//     try {
//       nextQuestion = await generateNextQuestion({
//         previousQuestion: question.question,
//         previousAnswer: transcript,
//         previousFeedback: feedback,
//         role: session.role,
//         experienceLevel: session.experienceLevel,
//         techStack: session.techStack,
//         previousQuestions: session.questions.map((item) => item.question),
//       });
//     } catch (error) {
//       return res.status(503).json({
//         success: false,
//         code: "NEXT_QUESTION_UNAVAILABLE",
//         message:
//           "Your answer was evaluated, but the next question is temporarily unavailable. Please retry.",
//         transcript,
//         feedback,
//         retryable: true,
//       });
//     }

//     session.questions.push({
//       question: nextQuestion.question,
//       category: nextQuestion.category,
//       difficulty: nextQuestion.difficulty,
//       answerStatus: "pending",
//     });

//     session.currentQuestionIndex = questionIndex + 1;
//     session.status = "in-progress";
//     session.lastActivityAt = new Date();

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       completed: false,
//       transcript,
//       feedback,
//       nextQuestion,
//       currentQuestionIndex: session.currentQuestionIndex,
//       totalQuestions: session.totalQuestions,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Abandon Interview
// // ============================================================

// async function abandonInterviewController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     const session = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//       status: { $in: ["in-progress", "processing"] },
//     });

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "Active interview session not found",
//       });
//     }

//     session.status = "abandoned";
//     session.explicitlyAbandoned = true;
//     session.lastActivityAt = new Date();

//     await session.save();

//     return res.status(200).json({
//       success: true,
//       message:
//         "Interview abandoned successfully. You can resume it later or start a new interview.",
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Get Interview Session (WITH ABANDONED WARNING)
// // ============================================================

// async function getInterviewSessionController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid session id",
//       });
//     }

//     const session = await mockInterviewSessionModel
//       .findOne({
//         _id: sessionId,
//         user: req.user.id,
//       })
//       .lean();

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview session not found",
//       });
//     }

//     // Add warning for abandoned sessions
//     if (session.status === "abandoned") {
//       return res.status(200).json({
//         success: true,
//         interviewSession: session,
//         isAbandoned: true,
//         warning: "This interview was abandoned. Resume to continue.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       interviewSession: session,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // CONTROLLER: Get All Interview Sessions
// // ============================================================

// async function getAllInterviewSessionsController(req, res, next) {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
//     const skip = (page - 1) * limit;

//     const filter = {
//       user: req.user.id,
//     };

//     const [sessions, total] = await Promise.all([
//       mockInterviewSessionModel
//         .find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       mockInterviewSessionModel.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: {
//         sessions,
//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages: Math.ceil(total / limit),
//           hasNextPage: page < Math.ceil(total / limit),
//           hasPreviousPage: page > 1,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ============================================================
// // UTILITY: Cleanup Stale Sessions
// // ============================================================

// async function cleanupStaleSessions() {
//   try {
//     const staleThreshold = new Date(Date.now() - SESSION_STALE_THRESHOLD_MS);

//     const result = await mockInterviewSessionModel.updateMany(
//       {
//         status: { $in: ["in-progress", "processing"] },
//         lastActivityAt: { $lt: staleThreshold },
//         explicitlyAbandoned: false,
//       },
//       {
//         $set: {
//           status: "abandoned",
//           lastActivityAt: new Date(),
//         },
//       },
//     );

//     console.log(
//       `✅ Cleaned up ${result.modifiedCount} stale interview sessions`,
//     );
//     return result;
//   } catch (error) {
//     console.error("❌ Error cleaning up stale sessions:", error);
//     throw error;
//   }
// }

// // ============================================================
// // EXPORTS (UPDATED)
// // ============================================================

// module.exports = {
//   startInterviewController,
//   submitAnswerController,
//   getInterviewSessionController,
//   getAllInterviewSessionsController,
//   getActiveInterviewsController,
//   abandonInterviewController,
//   resumeInterviewController, // NEW - For explicit resume
//   cleanupStaleSessions,
// };


const mongoose = require("mongoose");
const crypto = require("crypto");

const mockInterviewSessionModel = require("../models/mockInterview.model");

const {
  generateFirstQuestion,
  evaluateAnswer,
  generateNextQuestion,
  generateFinalInterviewReport,
  AIServiceError,
} = require("../services/interview.service");

const { transcribeInterviewAudio } = require("../services/speech.service");

// ============================================================
// CONFIGURATION
// ============================================================

const TOTAL_QUESTIONS = 5;
const MAX_ROLE_LENGTH = 100;
const MAX_TECH_STACK_ITEMS = 20;
const MIN_ANSWER_DURATION = 1;
const MAX_ANSWER_DURATION = 600;
const PROCESSING_LOCK_TIMEOUT_MS = 2 * 60 * 1000;
const SESSION_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CONCURRENT_ACTIVE_INTERVIEWS = 2;

const VALID_EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior"];
const VALID_INTERVIEW_TYPES = ["technical", "behavioral", "mixed"];

const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/mp4",
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTechStack(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(value.map((item) => normalizeString(item)).filter(Boolean)),
  ].slice(0, MAX_TECH_STACK_ITEMS);
}

function parseAnswerDuration(value) {
  const duration = Number(value);
  if (!Number.isFinite(duration)) return 0;
  return Math.round(duration);
}

function createProcessingToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isLockStale(date) {
  if (!date) return true;
  return Date.now() - new Date(date).getTime() > PROCESSING_LOCK_TIMEOUT_MS;
}

async function markQuestionFailed(
  sessionId,
  questionIndex,
  processingToken,
  errorMessage,
) {
  await mockInterviewSessionModel.updateOne(
    {
      _id: sessionId,
      [`questions.${questionIndex}.processingToken`]: processingToken,
    },
    {
      $set: {
        status: "in-progress",
        [`questions.${questionIndex}.answerStatus`]: "failed",
        [`questions.${questionIndex}.processingError`]: String(
          errorMessage,
        ).slice(0, 500),
        [`questions.${questionIndex}.processingToken`]: null,
        [`questions.${questionIndex}.processingStartedAt`]: null,
        lastActivityAt: new Date(),
      },
    },
  );
}

// ============================================================
// HELPERS — Advance & Complete
// ============================================================

/**
 * Generate (or return) the next question and advance the session,
 * OR complete the interview if we're on the last question.
 *
 * This is the single source of truth for "advancing" a session, so any
 * retry path can call it safely without re-running the answer pipeline.
 */
async function advanceSession(session, res, questionIndex, extras = {}) {
  const currentQuestion = session.questions[questionIndex];
  const transcript = extras.transcript || currentQuestion.transcript || "";
  const feedback = extras.feedback || currentQuestion.feedback || null;
  const isLastQuestion = questionIndex >= session.totalQuestions - 1;

  // Last question → finalize
  if (isLastQuestion) {
    return completeInterview(session, res, { transcript, feedback });
  }

  // Idempotent: next question already generated by a previous attempt
  if (session.questions[questionIndex + 1]) {
    const next = session.questions[questionIndex + 1];

    // FIX 5: if we got here from an abandoned session, mark it in-progress
    // so the response is honest about the actual server state.
    if (session.status === "abandoned") {
      session.status = "in-progress";
      session.lastActivityAt = new Date();
      await session.save();
    }

    return res.status(200).json({
      success: true,
      completed: false,
      transcript,
      feedback,
      nextQuestion: {
        question: next.question,
        category: next.category,
        difficulty: next.difficulty,
      },
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.totalQuestions,
      idempotent: true,
    });
  }

  // Generate a fresh next question
  let nextQuestion;
  try {
    nextQuestion = await generateNextQuestion({
      previousQuestion: currentQuestion.question,
      previousAnswer: transcript,
      previousFeedback: feedback,
      role: session.role,
      experienceLevel: session.experienceLevel,
      techStack: session.techStack,
      previousQuestions: session.questions.map((item) => item.question),
    });
  } catch (error) {
    // FIX 2: reset session status to "in-progress" so the client doesn't
    // see a permanent "processing" spinner. The answered question's
    // transcript + feedback are already saved and will be reused on retry.
    await mockInterviewSessionModel.updateOne(
      { _id: session._id, user: session.user, status: "processing" },
      { $set: { status: "in-progress", lastActivityAt: new Date() } },
    );

    // FIX 6: richer payload so the frontend can render a friendly retry UI
    // without needing to re-upload audio.
    return res.status(503).json({
      success: false,
      code: "NEXT_QUESTION_UNAVAILABLE",
      message:
        "Your answer was evaluated, but the next question is temporarily unavailable.",
      userMessage:
        "Your answer was saved. Tap retry to continue where you left off.",
      retryable: true,
      retryWithoutAudio: true,
      action: "retry-next-question",
      currentQuestionIndex: questionIndex,
      totalQuestions: session.totalQuestions,
      transcript,
      feedback,
    });
  }

  session.questions.push({
    question: nextQuestion.question,
    category: nextQuestion.category,
    difficulty: nextQuestion.difficulty,
    answerStatus: "pending",
  });

  session.currentQuestionIndex = questionIndex + 1;
  session.status = "in-progress";
  session.lastActivityAt = new Date();

  await session.save();

  return res.status(200).json({
    success: true,
    completed: false,
    transcript,
    feedback,
    nextQuestion,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.totalQuestions,
  });
}

async function completeInterview(
  session,
  res,
  { transcript = "", feedback = null } = {},
) {
  // Idempotent — already completed, return the report
  if (session.status === "completed" && session.finalReport) {
    return res.status(200).json({
      success: true,
      completed: true,
      transcript,
      feedback,
      finalReport: session.finalReport,
      overallScore: session.overallScore,
      idempotent: true,
    });
  }

  try {
    // Optimistic flip to "processing" (accepts abandoned / in-progress)
    await mockInterviewSessionModel.updateOne(
      { _id: session._id, user: session.user, status: { $ne: "completed" } },
      { $set: { status: "processing", lastActivityAt: new Date() } },
    );

    const finalReport = await generateFinalInterviewReport(session);

    // Atomic save of the final state
    const updated = await mockInterviewSessionModel.findOneAndUpdate(
      { _id: session._id, user: session.user, status: "processing" },
      {
        $set: {
          finalReport,
          overallScore: finalReport?.overallScore ?? 0,
          status: "completed",
          completedAt: new Date(),
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updated) {
      // Someone else already completed it — treat as success
      const fresh = await mockInterviewSessionModel.findById(session._id);
      return res.status(200).json({
        success: true,
        completed: true,
        transcript,
        feedback,
        finalReport: fresh?.finalReport,
        overallScore: fresh?.overallScore ?? 0,
        idempotent: true,
      });
    }

    return res.status(200).json({
      success: true,
      completed: true,
      transcript,
      feedback,
      finalReport,
      overallScore: finalReport?.overallScore ?? 0,
    });
  } catch (error) {
    // Revert to in-progress so the client can retry safely
    await mockInterviewSessionModel.updateOne(
      { _id: session._id, user: session.user, status: "processing" },
      { $set: { status: "in-progress", lastActivityAt: new Date() } },
    );

    return res.status(503).json({
      success: false,
      code: "FINAL_REPORT_UNAVAILABLE",
      message:
        "Your interview answers were saved, but the final report is temporarily unavailable.",
      userMessage:
        "All your answers are saved. Tap retry to generate your final report.",
      retryable: true,
      retryWithoutAudio: true,
      action: "retry-final-report",
    });
  }
}

// ============================================================
// CONTROLLER: Get Active / Resumable Interviews
// ============================================================

async function getActiveInterviewsController(req, res, next) {
  try {
    // FIX 4: no staleness filter — any non-completed session remains
    // visible and resumable. Cleanup still marks truly dead sessions
    // as abandoned, but they stay resumable.
    const sessions = await mockInterviewSessionModel
      .find({
        user: req.user.id,
        status: { $in: ["in-progress", "processing", "abandoned"] },
      })
      .sort({ lastActivityAt: -1 })
      .select(
        "_id role experienceLevel techStack interviewType status currentQuestionIndex totalQuestions createdAt lastActivityAt explicitlyAbandoned",
      )
      .lean();

    const activeSessions = sessions.filter(
      (s) => s.status === "in-progress" || s.status === "processing",
    );

    const abandonedSessions = sessions.filter(
      (s) => s.status === "abandoned" && !s.explicitlyAbandoned,
    );

    // Explicitly-abandoned sessions don't count toward the slot limit
    const countingSessions = sessions.filter((s) => !s.explicitlyAbandoned);

    const canResume =
      activeSessions.length > 0 || abandonedSessions.length > 0;
    const canStartNew =
      countingSessions.length < MAX_CONCURRENT_ACTIVE_INTERVIEWS;

    return res.status(200).json({
      success: true,
      data: {
        canResume,
        canStartNew,
        activeInterviewsCount: countingSessions.length,
        resumableSessions: activeSessions,
        abandonedSessions,
        maxConcurrentInterviews: MAX_CONCURRENT_ACTIVE_INTERVIEWS,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Start Interview
// ============================================================

async function startInterviewController(req, res, next) {
  try {
    const role = normalizeString(req.body.role);
    const experienceLevel = normalizeString(
      req.body.experienceLevel,
    ).toLowerCase();
    const interviewType = normalizeString(
      req.body.interviewType || "mixed",
    ).toLowerCase();
    const techStack = normalizeTechStack(req.body.techStack);
    const forceNew = req.body.forceNew === true;

    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });
    }
    if (role.length > MAX_ROLE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Role cannot exceed ${MAX_ROLE_LENGTH} characters`,
      });
    }
    if (!VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid experience level" });
    }
    if (!VALID_INTERVIEW_TYPES.includes(interviewType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interview type" });
    }
    if (techStack.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one technology is required" });
    }

    const staleThreshold = new Date(Date.now() - SESSION_STALE_THRESHOLD_MS);

    // Auto-abandon truly stale sessions (still resumable via resume endpoint)
    await mockInterviewSessionModel.updateMany(
      {
        user: req.user.id,
        status: { $in: ["in-progress", "processing"] },
        lastActivityAt: { $lt: staleThreshold },
      },
      {
        $set: { status: "abandoned", explicitlyAbandoned: false },
      },
    );

    // Count only active in-progress / processing sessions
    const freshActiveSessions = await mockInterviewSessionModel
      .find({
        user: req.user.id,
        status: { $in: ["in-progress", "processing"] },
      })
      .select("_id status currentQuestionIndex totalQuestions lastActivityAt")
      .lean();

    if (freshActiveSessions.length >= MAX_CONCURRENT_ACTIVE_INTERVIEWS) {
      return res.status(409).json({
        success: false,
        message: `You can have maximum ${MAX_CONCURRENT_ACTIVE_INTERVIEWS} active interviews at a time. Please complete or abandon an existing interview.`,
        code: "MAX_INTERVIEWS_REACHED",
        activeSessions: freshActiveSessions,
      });
    }

    if (!forceNew && freshActiveSessions.length > 0) {
      return res.status(200).json({
        success: true,
        message: "You have active interviews",
        code: "ACTIVE_INTERVIEWS_EXIST",
        activeSessions: freshActiveSessions,
        canStartNew:
          freshActiveSessions.length < MAX_CONCURRENT_ACTIVE_INTERVIEWS,
      });
    }

    const firstQuestion = await generateFirstQuestion({
      role,
      experienceLevel,
      techStack,
      interviewType,
    });

    const interviewSession = await mockInterviewSessionModel.create({
      user: req.user.id,
      role,
      experienceLevel,
      techStack,
      interviewType,
      status: "in-progress",
      totalQuestions: TOTAL_QUESTIONS,
      questions: [
        {
          question: firstQuestion.question,
          category: firstQuestion.category,
          difficulty: firstQuestion.difficulty,
          answerStatus: "pending",
        },
      ],
      lastActivityAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Interview started successfully",
      interviewSession,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Resume Interview
// ============================================================

async function resumeInterviewController(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session id" });
    }

    // FIX 3: accept BOTH "abandoned" AND "in-progress" so that reopening
    // the app on the next day works reliably, regardless of whether the
    // cleanup job has run. No staleness gate — the user asked for a
    // resumable session, and cleanup only marks sessions, never deletes.
    const session = await mockInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user.id,
        status: { $in: ["abandoned", "in-progress"] },
      },
      {
        $set: {
          status: "in-progress",
          explicitlyAbandoned: false,
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "No resumable interview found. It may be completed or missing.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview resumed successfully",
      interviewSession: session,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Submit Answer
// ============================================================

async function submitAnswerController(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session id" });
    }

    // Optional client-provided question index for idempotent retries
    const clientQuestionIndex =
      req.body.questionIndex !== undefined && req.body.questionIndex !== null
        ? Number(req.body.questionIndex)
        : null;

    let session = await mockInterviewSessionModel.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Interview session not found" });
    }

    // Idempotent — if completed, return the final state instead of an error
    if (session.status === "completed") {
      const lastQuestion = session.questions[session.currentQuestionIndex];
      return res.status(200).json({
        success: true,
        completed: true,
        transcript: lastQuestion?.transcript || "",
        feedback: lastQuestion?.feedback || null,
        finalReport: session.finalReport,
        overallScore: session.overallScore,
        idempotent: true,
      });
    }

    // Reject stale client retries
    if (
      clientQuestionIndex !== null &&
      clientQuestionIndex !== session.currentQuestionIndex
    ) {
      return res.status(409).json({
        success: false,
        code: "QUESTION_INDEX_MISMATCH",
        message: "Your client is out of sync with the server. Please refresh.",
        serverQuestionIndex: session.currentQuestionIndex,
        clientQuestionIndex,
      });
    }

    const questionIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[questionIndex];

    if (!currentQuestion) {
      return res
        .status(409)
        .json({ success: false, message: "No active question found" });
    }

    // ── FIX 1: RETRY PATH (runs BEFORE the audio check) ────────────
    // If this question is already evaluated, the client is retrying a
    // previously-failed advance. We don't need new audio — just try to
    // advance again (idempotently generating the next question or final
    // report). This is what makes "AI failed after answering" recoverable
    // without forcing the user to re-record.
    if (currentQuestion.transcript && currentQuestion.feedback) {
      // FIX 5: wake an abandoned session before advancing
      if (session.status === "abandoned") {
        session.status = "in-progress";
        session.lastActivityAt = new Date();
        await session.save();
      }

      return advanceSession(session, res, questionIndex);
    }

    // ── FRESH PATH — audio required from here on ───────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: "AUDIO_REQUIRED",
        message: "Audio file is required",
      });
    }

    if (!ALLOWED_AUDIO_MIME_TYPES.includes(req.file.mimetype)) {
      return res
        .status(415)
        .json({ success: false, message: "Unsupported audio format" });
    }

    const answerDuration = parseAnswerDuration(req.body.answerDuration);
    if (
      answerDuration < MIN_ANSWER_DURATION ||
      answerDuration > MAX_ANSWER_DURATION
    ) {
      return res.status(400).json({
        success: false,
        message: `Answer duration must be between ${MIN_ANSWER_DURATION} and ${MAX_ANSWER_DURATION} seconds`,
      });
    }

    // Lock check (in-memory; the atomic claim below is authoritative)
    if (
      currentQuestion.answerStatus === "processing" &&
      !isLockStale(currentQuestion.processingStartedAt)
    ) {
      return res.status(409).json({
        success: false,
        message: "This answer is already being processed",
      });
    }

    const processingToken = createProcessingToken();

    // Atomic claim — accepts "in-progress" and "abandoned" in one shot.
    // FIX 7: also increments evaluationAttempts for observability.
    const claimedSession = await mockInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user.id,
        status: { $in: ["in-progress", "abandoned"] },
        [`questions.${questionIndex}.answerStatus`]: {
          $in: ["pending", "failed", "processing"],
        },
        $or: [
          { [`questions.${questionIndex}.answerStatus`]: { $ne: "processing" } },
          {
            [`questions.${questionIndex}.processingStartedAt`]: {
              $lt: new Date(Date.now() - PROCESSING_LOCK_TIMEOUT_MS),
            },
          },
          { [`questions.${questionIndex}.processingStartedAt`]: null },
        ],
      },
      {
        $set: {
          status: "processing",
          [`questions.${questionIndex}.answerStatus`]: "processing",
          [`questions.${questionIndex}.processingToken`]: processingToken,
          [`questions.${questionIndex}.processingStartedAt`]: new Date(),
          [`questions.${questionIndex}.processingError`]: null,
          lastActivityAt: new Date(),
        },
        $inc: {
          [`questions.${questionIndex}.evaluationAttempts`]: 1,
        },
      },
      { new: true },
    );

    if (!claimedSession) {
      return res.status(409).json({
        success: false,
        message: "This answer is already being processed",
      });
    }

    session = claimedSession;

    // Transcribe
    let transcript;
    try {
      transcript = await transcribeInterviewAudio(
        req.file.buffer,
        req.file.mimetype,
      );
    } catch (error) {
      await markQuestionFailed(
        sessionId,
        questionIndex,
        processingToken,
        error.message,
      );
      return res.status(503).json({
        success: false,
        message: "We could not process your audio. Please try again.",
      });
    }

    if (!transcript) {
      await markQuestionFailed(
        sessionId,
        questionIndex,
        processingToken,
        "Empty transcript",
      );
      return res.status(422).json({
        success: false,
        message: "We could not understand your answer. Please try again.",
      });
    }

    // Save transcript
    const updated = await mockInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user.id,
        [`questions.${questionIndex}.processingToken`]: processingToken,
      },
      {
        $set: {
          [`questions.${questionIndex}.transcript`]: transcript,
          [`questions.${questionIndex}.answerDuration`]: answerDuration,
          [`questions.${questionIndex}.answerStatus`]: "transcribed",
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "Answer processing state changed. Please refresh.",
      });
    }

    // Evaluate
    const question = updated.questions[questionIndex];
    let feedback;
    try {
      feedback = await evaluateAnswer({
        question: question.question,
        answerTranscript: transcript,
        role: updated.role,
        experienceLevel: updated.experienceLevel,
      });
    } catch (error) {
      await markQuestionFailed(
        sessionId,
        questionIndex,
        processingToken,
        error.message,
      );

      if (error instanceof AIServiceError && error.code === "AI_RATE_LIMIT") {
        return res.status(503).json({
          success: false,
          code: "AI_RATE_LIMIT",
          message:
            "Interview evaluation is temporarily unavailable. Your answer has been saved.",
          userMessage:
            "Your answer was saved. Tap retry to continue where you left off.",
          transcript,
          retryable: true,
          retryWithoutAudio: true,
          action: "retry-evaluation",
        });
      }

      return res.status(503).json({
        success: false,
        message:
          "Your answer was saved, but AI evaluation is temporarily unavailable.",
        userMessage:
          "Your answer was saved. Tap retry to continue where you left off.",
        transcript,
        retryable: true,
        retryWithoutAudio: true,
        action: "retry-evaluation",
      });
    }

    // Save feedback
    const feedbackSaved = await mockInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user.id,
        [`questions.${questionIndex}.processingToken`]: processingToken,
      },
      {
        $set: {
          [`questions.${questionIndex}.feedback`]: feedback,
          [`questions.${questionIndex}.answerStatus`]: "evaluated",
          [`questions.${questionIndex}.processingToken`]: null,
          [`questions.${questionIndex}.processingStartedAt`]: null,
          [`questions.${questionIndex}.processingError`]: null,
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );

    if (!feedbackSaved) {
      return res.status(409).json({
        success: false,
        message: "Could not finalize answer processing",
      });
    }

    // Single source of truth for advancing the session
    return advanceSession(feedbackSaved, res, questionIndex, {
      transcript,
      feedback,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Abandon Interview
// ============================================================

async function abandonInterviewController(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session id" });
    }

    const session = await mockInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        user: req.user.id,
        status: { $in: ["in-progress", "processing"] },
      },
      {
        $set: {
          status: "abandoned",
          explicitlyAbandoned: true,
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Active interview session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Interview abandoned successfully. You can resume it later or start a new interview.",
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Get Interview Session
// ============================================================

async function getInterviewSessionController(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session id" });
    }

    const session = await mockInterviewSessionModel
      .findOne({ _id: sessionId, user: req.user.id })
      .lean();

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Interview session not found" });
    }

    if (session.status === "abandoned") {
      return res.status(200).json({
        success: true,
        interviewSession: session,
        isAbandoned: true,
        warning: "This interview was abandoned. Resume to continue.",
      });
    }

    return res.status(200).json({
      success: true,
      interviewSession: session,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// CONTROLLER: Get All Interview Sessions
// ============================================================

async function getAllInterviewSessionsController(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    const [sessions, total] = await Promise.all([
      mockInterviewSessionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      mockInterviewSessionModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// UTILITY: Cleanup Stale Sessions
// ============================================================

async function cleanupStaleSessions() {
  try {
    const staleThreshold = new Date(Date.now() - SESSION_STALE_THRESHOLD_MS);

    const result = await mockInterviewSessionModel.updateMany(
      {
        status: { $in: ["in-progress", "processing"] },
        lastActivityAt: { $lt: staleThreshold },
        explicitlyAbandoned: false,
      },
      {
        $set: {
          status: "abandoned",
          // NOTE: deliberately NOT touching lastActivityAt — keep the real
          // user-activity timestamp so the session history stays accurate.
        },
      },
    );

    console.log(
      `✅ Cleaned up ${result.modifiedCount} stale interview sessions`,
    );
    return result;
  } catch (error) {
    console.error("❌ Error cleaning up stale sessions:", error);
    throw error;
  }
}

// ============================================================
// CONTROLLER: Retry Advance (no audio)
// ============================================================
//
// Used when the client's previous answer was successfully saved and
// evaluated, but the follow-up step (next question generation or final
// report generation) failed. The client retries this endpoint instead
// of re-uploading the audio.
//
// Requirements:
// - Session must NOT be completed
// - Current question must have `transcript` AND `feedback` set
// - Otherwise the client must go back to `POST /:sessionId/answer`

// async function retryAdvanceController(req, res, next) {
//   try {
//     const { sessionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid session id" });
//     }

//     const clientQuestionIndex =
//       req.body.questionIndex !== undefined && req.body.questionIndex !== null
//         ? Number(req.body.questionIndex)
//         : null;

//     const session = await mockInterviewSessionModel.findOne({
//       _id: sessionId,
//       user: req.user.id,
//     });

//     if (!session) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Interview session not found" });
//     }

//     if (session.status === "completed") {
//       const lastQuestion = session.questions[session.currentQuestionIndex];
//       return res.status(200).json({
//         success: true,
//         completed: true,
//         transcript: lastQuestion?.transcript || "",
//         feedback: lastQuestion?.feedback || null,
//         finalReport: session.finalReport,
//         overallScore: session.overallScore,
//         idempotent: true,
//       });
//     }

//     if (
//       clientQuestionIndex !== null &&
//       clientQuestionIndex !== session.currentQuestionIndex
//     ) {
//       return res.status(409).json({
//         success: false,
//         code: "QUESTION_INDEX_MISMATCH",
//         message: "Your client is out of sync with the server. Please refresh.",
//         serverQuestionIndex: session.currentQuestionIndex,
//         clientQuestionIndex,
//       });
//     }

//     const questionIndex = session.currentQuestionIndex;
//     const currentQuestion = session.questions[questionIndex];

//     if (!currentQuestion) {
//       return res
//         .status(409)
//         .json({ success: false, message: "No active question found" });
//     }

//     // Guard: the answer must already be saved + evaluated before we can
//     // skip straight to advancing. Otherwise the client must re-upload.
//     if (!currentQuestion.transcript || !currentQuestion.feedback) {
//       return res.status(409).json({
//         success: false,
//         code: "ANSWER_NOT_READY",
//         message:
//           "The current answer has not been evaluated yet. Please re-submit with audio.",
//         action: "resubmit-answer",
//       });
//     }

//     // Wake abandoned sessions before advancing
//     if (session.status === "abandoned") {
//       session.status = "in-progress";
//       session.lastActivityAt = new Date();
//       await session.save();
//     }

//     return advanceSession(session, res, questionIndex);
//   } catch (error) {
//     next(error);
//   }
// }
async function retryAdvanceController(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session id" });
    }

    const clientQuestionIndex =
      req.body.questionIndex !== undefined && req.body.questionIndex !== null
        ? Number(req.body.questionIndex)
        : null;

    const session = await mockInterviewSessionModel.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Interview session not found" });
    }

    // Already completed → return the final state
    if (session.status === "completed") {
      const lastQuestion = session.questions[session.currentQuestionIndex];
      return res.status(200).json({
        success: true,
        completed: true,
        transcript: lastQuestion?.transcript || "",
        feedback: lastQuestion?.feedback || null,
        finalReport: session.finalReport,
        overallScore: session.overallScore,
        idempotent: true,
      });
    }

    if (
      clientQuestionIndex !== null &&
      clientQuestionIndex !== session.currentQuestionIndex
    ) {
      return res.status(409).json({
        success: false,
        code: "QUESTION_INDEX_MISMATCH",
        message: "Your client is out of sync with the server. Please refresh.",
        serverQuestionIndex: session.currentQuestionIndex,
        clientQuestionIndex,
      });
    }

    const questionIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[questionIndex];

    if (!currentQuestion) {
      return res
        .status(409)
        .json({ success: false, message: "No active question found" });
    }

    // ── Case 1: no transcript at all → user must re-record ─────────
    if (!currentQuestion.transcript) {
      return res.status(409).json({
        success: false,
        code: "ANSWER_NOT_READY",
        message:
          "This answer has no transcript yet. Please record your answer again.",
        action: "resubmit-answer",
      });
    }

    // ── Case 2: transcript exists but no feedback → run evaluation ─
    // This is the AI_RATE_LIMIT path. We already have the transcript,
    // so we only re-run the evaluation step. No audio, no re-transcription.
    if (!currentQuestion.feedback) {
      let feedback;

      try {
        feedback = await evaluateAnswer({
          question: currentQuestion.question,
          answerTranscript: currentQuestion.transcript,
          role: session.role,
          experienceLevel: session.experienceLevel,
        });
      } catch (error) {
        // Still rate-limited → bubble up as retryable
        return res.status(503).json({
          success: false,
          code:
            error instanceof AIServiceError && error.code === "AI_RATE_LIMIT"
              ? "AI_RATE_LIMIT"
              : "EVALUATION_UNAVAILABLE",
          message:
            "The AI is still busy. Please wait a moment and try again.",
          userMessage:
            "The AI is still busy. Tap retry to continue.",
          retryable: true,
          retryWithoutAudio: true,
          action: "retry-evaluation",
        });
      }

      // Persist the feedback and re-fetch so `advanceSession` sees it
      const updated = await mockInterviewSessionModel.findOneAndUpdate(
        {
          _id: sessionId,
          user: req.user.id,
          [`questions.${questionIndex}.answerStatus`]: {
            $in: ["transcribed", "failed", "processing"],
          },
        },
        {
          $set: {
            [`questions.${questionIndex}.feedback`]: feedback,
            [`questions.${questionIndex}.answerStatus`]: "evaluated",
            [`questions.${questionIndex}.processingToken`]: null,
            [`questions.${questionIndex}.processingStartedAt`]: null,
            [`questions.${questionIndex}.processingError`]: null,
            lastActivityAt: new Date(),
          },
        },
        { new: true },
      );

      if (!updated) {
        return res.status(409).json({
          success: false,
          code: "STATE_CHANGED",
          message:
            "The session changed while we were processing. Please refresh.",
        });
      }

      return advanceSession(updated, res, questionIndex, { feedback });
    }

    // ── Case 3: transcript + feedback both present → just advance ──
    if (session.status === "abandoned") {
      session.status = "in-progress";
      session.lastActivityAt = new Date();
      await session.save();
    }

    return advanceSession(session, res, questionIndex);
  } catch (error) {
    next(error);
  }
}
// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  startInterviewController,
  submitAnswerController,
  getInterviewSessionController,
  getAllInterviewSessionsController,
  getActiveInterviewsController,
  abandonInterviewController,
  resumeInterviewController,
  cleanupStaleSessions,
    retryAdvanceController,  
};