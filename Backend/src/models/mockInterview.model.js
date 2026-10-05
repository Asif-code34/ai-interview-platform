// //uppr vala correct he

// const mongoose = require("mongoose");

// // ============================================================
// // ANSWER FEEDBACK
// // ============================================================

// const answerFeedbackSchema = new mongoose.Schema(
//   {
//     technicalScore: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100,
//     },

//     communicationScore: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100,
//     },

//     confidenceScore: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100,
//     },

//     clarityScore: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100,
//     },

//     fillerWords: {
//       type: [String],
//       default: [],
//     },

//     strengths: {
//       type: [String],
//       default: [],
//     },

//     improvements: {
//       type: [String],
//       default: [],
//     },

//     aiAnalysis: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//   },
//   {
//     _id: false,
//   },
// );

// // ============================================================
// // INTERVIEW QUESTION
// // ============================================================

// const interviewQuestionSchema = new mongoose.Schema(
//   {
//     question: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 10,
//       maxlength: 2000,
//     },

//     category: {
//       type: String,
//       enum: ["technical", "behavioral", "system-design", "hr"],
//       required: true,
//     },

//     difficulty: {
//       type: String,
//       enum: ["easy", "medium", "hard"],
//       required: true,
//     },

//     // --------------------------------------------------------
//     // Candidate answer
//     // --------------------------------------------------------

//     transcript: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 20000,
//     },

//     audioUrl: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     answerDuration: {
//       type: Number,
//       min: 0,
//       max: 600,
//       default: 0,
//     },

//     // --------------------------------------------------------
//     // AI feedback
//     // --------------------------------------------------------

//     feedback: {
//       type: answerFeedbackSchema,
//       default: undefined,
//     },

//     // --------------------------------------------------------
//     // Answer processing state
//     // --------------------------------------------------------

//     answerStatus: {
//       type: String,
//       enum: ["pending", "processing", "transcribed", "evaluated", "failed"],
//       default: "pending",
//     },

//     // --------------------------------------------------------
//     // Processing lock
//     //
//     // Used by submitAnswerController to prevent duplicate
//     // concurrent submissions.
//     // --------------------------------------------------------

//     processingToken: {
//       type: String,
//       default: null,
//       select: false,
//     },

//     processingStartedAt: {
//       type: Date,
//       default: null,
//       select: false,
//     },

//     processingError: {
//       type: String,
//       default: null,
//       select: false,
//       maxlength: 500,
//     },

//     evaluationAttempts: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // FINAL INTERVIEW REPORT
// // ============================================================

// const averageScoresSchema = new mongoose.Schema(
//   {
//     technicalScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },

//     communicationScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },

//     confidenceScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },

//     clarityScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//   },
//   {
//     _id: false,
//   },
// );

// const finalReportSchema = new mongoose.Schema(
//   {
//     // --------------------------------------------------------
//     // Overall average scores
//     // --------------------------------------------------------

//     averageScores: {
//       type: averageScoresSchema,
//       default: undefined,
//     },

//     // --------------------------------------------------------
//     // AI insights
//     // --------------------------------------------------------

//     strengths: {
//       type: [String],
//       default: [],
//     },

//     weaknesses: {
//       type: [String],
//       default: [],
//     },

//     recommendation: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 5000,
//     },

//     communicationSummary: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 5000,
//     },

//     technicalSummary: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 5000,
//     },

//     finalVerdict: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 5000,
//     },
//   },
//   {
//     _id: false,
//   },
// );

// // ============================================================
// // MOCK INTERVIEW SESSION
// // ============================================================

// const mockInterviewSessionSchema = new mongoose.Schema(
//   {
//     // --------------------------------------------------------
//     // User
//     // --------------------------------------------------------

//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//       index: true,
//     },

//     // --------------------------------------------------------
//     // Interview configuration
//     // --------------------------------------------------------

//     role: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 100,
//     },

//     experienceLevel: {
//       type: String,
//       enum: ["fresher", "junior", "mid", "senior"],
//       required: true,
//     },

//     techStack: {
//       type: [String],
//       default: [],
//     },

//     interviewType: {
//       type: String,
//       enum: ["technical", "behavioral", "mixed"],
//       default: "mixed",
//     },

//     // --------------------------------------------------------
//     // Interview state
//     // --------------------------------------------------------

//     status: {
//       type: String,
//       enum: ["in-progress", "processing", "completed", "abandoned"],
//       default: "in-progress",
//       index: true,
//     },

//     currentQuestionIndex: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     totalQuestions: {
//       type: Number,
//       min: 1,
//       max: 20,
//       default: 5,
//     },

//     // --------------------------------------------------------
//     // Questions
//     // --------------------------------------------------------

//     questions: {
//       type: [interviewQuestionSchema],
//       default: [],
//     },

//     // --------------------------------------------------------
//     // Final score
//     // --------------------------------------------------------

//     overallScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },

//     // --------------------------------------------------------
//     // Final AI report
//     // --------------------------------------------------------

//     finalReport: {
//       type: finalReportSchema,
//       default: undefined,
//     },

//     // --------------------------------------------------------
//     // Lifecycle timestamps
//     // --------------------------------------------------------

//     startedAt: {
//       type: Date,
//       default: Date.now,
//     },

//     completedAt: {
//       type: Date,
//       default: null,
//     },

//     lastActivityAt: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },

//     // --------------------------------------------------------
//     // Optimistic/version tracking
//     // --------------------------------------------------------

//     version: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // INDEXES
// // ============================================================

// // Find a user's active interview quickly.
// mockInterviewSessionSchema.index({
//   user: 1,
//   status: 1,
// });

// // User's interview history.
// mockInterviewSessionSchema.index({
//   user: 1,
//   createdAt: -1,
// });

// // Useful for detecting stale sessions.
// mockInterviewSessionSchema.index({
//   status: 1,
//   lastActivityAt: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// const mockInterviewSessionModel = mongoose.model(
//   "MockInterviewSession",
//   mockInterviewSessionSchema,
// );

// module.exports = mockInterviewSessionModel;

const mongoose = require("mongoose");

// ============================================================
// ANSWER FEEDBACK
// ============================================================

const answerFeedbackSchema = new mongoose.Schema(
  {
    technicalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    communicationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    clarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    fillerWords: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    aiAnalysis: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// INTERVIEW QUESTION
// ============================================================

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: ["technical", "behavioral", "system-design", "hr"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    // --------------------------------------------------------
    // Candidate answer
    // --------------------------------------------------------

    transcript: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    audioUrl: {
      type: String,
      default: "",
      trim: true,
    },

    answerDuration: {
      type: Number,
      min: 0,
      max: 600,
      default: 0,
    },

    // --------------------------------------------------------
    // AI feedback
    // --------------------------------------------------------

    feedback: {
      type: answerFeedbackSchema,
      default: undefined,
    },

    // --------------------------------------------------------
    // Answer processing state
    // --------------------------------------------------------

    answerStatus: {
      type: String,
      enum: ["pending", "processing", "transcribed", "evaluated", "failed"],
      default: "pending",
    },

    // --------------------------------------------------------
    // Processing lock
    // --------------------------------------------------------

    processingToken: {
      type: String,
      default: null,
      select: false,
    },

    processingStartedAt: {
      type: Date,
      default: null,
      select: false,
    },

    processingError: {
      type: String,
      default: null,
      select: false,
      maxlength: 500,
    },

    evaluationAttempts: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// FINAL INTERVIEW REPORT
// ============================================================

const averageScoresSchema = new mongoose.Schema(
  {
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    clarityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const finalReportSchema = new mongoose.Schema(
  {
    averageScores: {
      type: averageScoresSchema,
      default: undefined,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    communicationSummary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    technicalSummary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    finalVerdict: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// MOCK INTERVIEW SESSION
// ============================================================

const mockInterviewSessionSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // User
    // --------------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // Interview configuration
    // --------------------------------------------------------

    role: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      required: true,
    },

    techStack: {
      type: [String],
      default: [],
    },

    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      default: "mixed",
    },

    // --------------------------------------------------------
    // Interview state
    // --------------------------------------------------------

    status: {
      type: String,
      enum: ["in-progress", "processing", "completed", "abandoned"],
      default: "in-progress",
      index: true,
    },

    currentQuestionIndex: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      min: 1,
      max: 20,
      default: 5,
    },

    // --------------------------------------------------------
    // Questions
    // --------------------------------------------------------

    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },

    // --------------------------------------------------------
    // Final score
    // --------------------------------------------------------

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // --------------------------------------------------------
    // Final AI report
    // --------------------------------------------------------

    finalReport: {
      type: finalReportSchema,
      default: undefined,
    },

    // --------------------------------------------------------
    // Lifecycle timestamps
    // --------------------------------------------------------

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // --------------------------------------------------------
    // Session tracking
    // --------------------------------------------------------

    explicitlyAbandoned: {
      type: Boolean,
      default: false,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

mockInterviewSessionSchema.index({ user: 1, status: 1 });
mockInterviewSessionSchema.index({ user: 1, createdAt: -1 });
mockInterviewSessionSchema.index({ status: 1, lastActivityAt: 1 });
mockInterviewSessionSchema.index({
  user: 1,
  status: 1,
  explicitlyAbandoned: 1,
  lastActivityAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const mockInterviewSessionModel = mongoose.model(
  "MockInterviewSession",
  mockInterviewSessionSchema,
);

module.exports = mockInterviewSessionModel;
