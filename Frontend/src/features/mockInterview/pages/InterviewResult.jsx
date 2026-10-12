// import React, { useEffect, useState } from "react";
// import "../style/interviewResult.scss";

// import { useNavigate, useParams } from "react-router";

// import { useMockInterview } from "../hooks/useMockInterview";

// const InterviewResult = () => {
//   const { sessionId } = useParams();

//   const navigate = useNavigate();

//   const { getInterviewSessionApi } = useMockInterview();

//   const [loading, setLoading] = useState(true);

//   const [session, setSession] = useState(null);

//   // =========================================
//   // LOAD SESSION
//   // =========================================

//   useEffect(() => {
//     loadSession();
//   }, []);

//   const loadSession = async () => {
//     try {
//       const response = await getInterviewSessionApi(sessionId);

//       setSession(response.interviewSession);

//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // =========================================
//   // LOADING
//   // =========================================

//   if (loading || !session) {
//     return (
//       <div className="result-loading">
//         <div className="loader-ring"></div>

//         <h1>Generating AI Feedback...</h1>
//       </div>
//     );
//   }

//   // =========================================
//   // FINAL REPORT
//   // =========================================

//   const report = session.finalReport;

//   return (
//     <div className="result-page">
//       {/* BACKGROUND GLOW */}
//       <div className="result-glow result-glow--1"></div>

//       <div className="result-glow result-glow--2"></div>

//       {/* HEADER */}
//       <header className="result-header">
//         <div>
//           <p className="result-label">AI Interview Analysis</p>

//           <h1>Interview Performance Report</h1>
//         </div>

//         <button
//           onClick={() => navigate("/start-interview")}
//           className="new-interview-btn"
//         >
//           + Start New Interview
//         </button>
//       </header>

//       {/* HERO SCORE */}
//       <section className="hero-score glass-card">
//         <div className="hero-score__left">
//           <p className="hero-score__label">Overall AI Score</p>

//           <div className="score-ring">
//             <span>{session.overallScore}</span>
//             <small>%</small>
//           </div>

//           <h2>
//             {session.overallScore >= 80
//               ? "Excellent Performance"
//               : session.overallScore >= 60
//                 ? "Good Performance"
//                 : "Needs Improvement"}
//           </h2>

//           <p>
//             AI analyzed your technical depth, communication skills, confidence,
//             and clarity during the interview.
//           </p>
//         </div>

//         <div className="hero-score__right">
//           <div className="mini-score-card">
//             <span>Technical</span>

//             <h3>{report.averageScores?.technicalScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Communication</span>

//             <h3>{report.averageScores?.communicationScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Confidence</span>

//             <h3>{report.averageScores?.confidenceScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Clarity</span>

//             <h3>{report.averageScores?.clarityScore}%</h3>
//           </div>
//         </div>
//       </section>

//       {/* ANALYSIS GRID */}
//       <div className="analysis-grid">
//         {/* STRENGTHS */}
//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Strengths</h2>

//             <span>AI Insights</span>
//           </div>

//           <div className="analysis-list">
//             {report.strengths?.map((item, index) => (
//               <div className="analysis-item analysis-item--good" key={index}>
//                 <div className="analysis-icon">✓</div>

//                 <p>{item}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* IMPROVEMENTS */}
//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Improvements</h2>

//             <span>Growth Areas</span>
//           </div>

//           <div className="analysis-list">
//             {report.weaknesses?.map((item, index) => (
//               <div className="analysis-item analysis-item--bad" key={index}>
//                 <div className="analysis-icon">!</div>

//                 <p>{item}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* QUESTION FEEDBACK */}
//       <section className="question-feedback">
//         <div className="section-header">
//           <h2>Question-by-Question Analysis</h2>

//           <p>Detailed AI evaluation of each response</p>
//         </div>

//         <div className="question-feedback__list">
//           {session.questions.map((question, index) => (
//             <div className="feedback-card glass-card" key={index}>
//               <div className="feedback-card__top">
//                 <span>Question {index + 1}</span>

//                 <div className="difficulty">{question.difficulty}</div>
//               </div>

//               <h3>{question.question}</h3>

//               <div className="feedback-transcript">
//                 <span>Your Answer</span>

//                 <p>{question.transcript}</p>
//               </div>

//               <div className="feedback-analysis">
//                 <span>AI Analysis</span>

//                 <p>{question.feedback?.aiAnalysis}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default InterviewResult;

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import "../style/interviewResult.scss";

// import { useNavigate, useParams } from "react-router";
// import { useMockInterview } from "../hooks/useMockInterview";

// const InterviewResult = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();

//   const { getInterviewSessionApi } = useMockInterview();

//   const [loading, setLoading] = useState(true);
//   const [session, setSession] = useState(null);
//   const [error, setError] = useState("");

//   // =========================================
//   // HELPERS
//   // =========================================

//   const getScore = (value) => {
//     const score = Number(value);

//     if (!Number.isFinite(score)) {
//       return 0;
//     }

//     return Math.min(100, Math.max(0, Math.round(score)));
//   };

//   const getErrorMessage = (error) => {
//     return (
//       error?.response?.data?.message ||
//       error?.message ||
//       "Unable to load your interview report."
//     );
//   };

//   // =========================================
//   // LOAD SESSION
//   // =========================================

//   const loadSession = useCallback(async () => {
//     if (!sessionId) {
//       setError("Invalid interview session.");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getInterviewSessionApi(sessionId);

//       const interviewSession = response?.interviewSession;

//       if (!interviewSession) {
//         throw new Error("Interview session data was not returned.");
//       }

//       setSession(interviewSession);
//     } catch (error) {
//       console.error("INTERVIEW RESULT ERROR:", error);

//       setError(getErrorMessage(error));
//     } finally {
//       setLoading(false);
//     }
//   }, [sessionId, getInterviewSessionApi]);

//   useEffect(() => {
//     loadSession();
//   }, [loadSession]);

//   // =========================================
//   // CALCULATE AVERAGE SCORES
//   // =========================================

//   const averageScores = useMemo(() => {
//     const questions = session?.questions || [];

//     const feedbackQuestions = questions.filter(
//       (question) => question?.feedback,
//     );

//     if (feedbackQuestions.length === 0) {
//       return {
//         technicalScore: 0,
//         communicationScore: 0,
//         confidenceScore: 0,
//         clarityScore: 0,
//       };
//     }

//     const totals = feedbackQuestions.reduce(
//       (accumulator, question) => {
//         const feedback = question.feedback;

//         accumulator.technicalScore += getScore(feedback?.technicalScore);

//         accumulator.communicationScore += getScore(
//           feedback?.communicationScore,
//         );

//         accumulator.confidenceScore += getScore(feedback?.confidenceScore);

//         accumulator.clarityScore += getScore(feedback?.clarityScore);

//         return accumulator;
//       },
//       {
//         technicalScore: 0,
//         communicationScore: 0,
//         confidenceScore: 0,
//         clarityScore: 0,
//       },
//     );

//     return {
//       technicalScore: Math.round(
//         totals.technicalScore / feedbackQuestions.length,
//       ),

//       communicationScore: Math.round(
//         totals.communicationScore / feedbackQuestions.length,
//       ),

//       confidenceScore: Math.round(
//         totals.confidenceScore / feedbackQuestions.length,
//       ),

//       clarityScore: Math.round(totals.clarityScore / feedbackQuestions.length),
//     };
//   }, [session]);

//   // =========================================
//   // DERIVED DATA
//   // =========================================

//   const report = session?.finalReport || {};

//   const questions = session?.questions || [];

//   const overallScore = getScore(session?.overallScore);

//   const completedQuestions = questions.filter(
//     (question) => question?.transcript && question.transcript.trim().length > 0,
//   ).length;

//   const performanceLabel =
//     overallScore >= 80
//       ? "Excellent Performance"
//       : overallScore >= 60
//         ? "Good Performance"
//         : "Needs Improvement";

//   // =========================================
//   // LOADING
//   // =========================================

//   if (loading) {
//     return (
//       <div className="result-loading">
//         <div className="loader-ring"></div>

//         <h1>Generating AI Feedback...</h1>

//         <p>We're preparing your interview performance report.</p>
//       </div>
//     );
//   }

//   // =========================================
//   // ERROR
//   // =========================================

//   if (error || !session) {
//     return (
//       <div className="result-loading">
//         <h1>Unable to Load Report</h1>

//         <p>{error || "Your interview report could not be loaded."}</p>

//         <div className="result-error-actions">
//           <button
//             type="button"
//             onClick={loadSession}
//             className="new-interview-btn"
//           >
//             Try Again
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/start-interview")}
//             className="new-interview-btn"
//           >
//             Start New Interview
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // =========================================
//   // RENDER
//   // =========================================

//   return (
//     <div className="result-page">
//       {/* BACKGROUND GLOW */}

//       <div className="result-glow result-glow--1"></div>

//       <div className="result-glow result-glow--2"></div>

//       {/* =========================================
//           HEADER
//       ========================================= */}

//       <header className="result-header">
//         <div>
//           <p className="result-label">AI Interview Analysis</p>

//           <h1>Interview Performance Report</h1>

//           <p>
//             {session.role} · {session.experienceLevel}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate("/start-interview")}
//           className="new-interview-btn"
//         >
//           + Start New Interview
//         </button>
//       </header>

//       {/* =========================================
//           HERO SCORE
//       ========================================= */}

//       <section className="hero-score glass-card">
//         <div className="hero-score__left">
//           <p className="hero-score__label">Overall AI Score</p>

//           <div className="score-ring">
//             <span>{overallScore}</span>

//             <small>%</small>
//           </div>

//           <h2>{performanceLabel}</h2>

//           <p>
//             AI analyzed your technical knowledge, communication, confidence, and
//             clarity throughout the interview.
//           </p>

//           <div className="interview-summary">
//             <span>
//               {completedQuestions} / {questions.length} questions completed
//             </span>
//           </div>
//         </div>

//         {/* =========================================
//             SCORE BREAKDOWN
//         ========================================= */}

//         <div className="hero-score__right">
//           <div className="mini-score-card">
//             <span>Technical</span>

//             <h3>{averageScores.technicalScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Communication</span>

//             <h3>{averageScores.communicationScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Confidence</span>

//             <h3>{averageScores.confidenceScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Clarity</span>

//             <h3>{averageScores.clarityScore}%</h3>
//           </div>
//         </div>
//       </section>

//       {/* =========================================
//           FINAL VERDICT
//       ========================================= */}

//       {report.finalVerdict && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Final Verdict</h2>

//             <span>AI Assessment</span>
//           </div>

//           <p>{report.finalVerdict}</p>
//         </section>
//       )}

//       {/* =========================================
//           STRENGTHS / WEAKNESSES
//       ========================================= */}

//       <div className="analysis-grid">
//         {/* STRENGTHS */}

//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Strengths</h2>

//             <span>AI Insights</span>
//           </div>

//           <div className="analysis-list">
//             {report.strengths?.length > 0 ? (
//               report.strengths.map((item, index) => (
//                 <div
//                   className="analysis-item analysis-item--good"
//                   key={`strength-${index}`}
//                 >
//                   <div className="analysis-icon">✓</div>

//                   <p>{item}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No specific strengths were generated.</p>
//             )}
//           </div>
//         </div>

//         {/* WEAKNESSES */}

//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Areas to Improve</h2>

//             <span>Growth Areas</span>
//           </div>

//           <div className="analysis-list">
//             {report.weaknesses?.length > 0 ? (
//               report.weaknesses.map((item, index) => (
//                 <div
//                   className="analysis-item analysis-item--bad"
//                   key={`weakness-${index}`}
//                 >
//                   <div className="analysis-icon">!</div>

//                   <p>{item}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No major weaknesses were identified.</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* =========================================
//           TECHNICAL SUMMARY
//       ========================================= */}

//       {report.technicalSummary && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Technical Summary</h2>

//             <span>AI Analysis</span>
//           </div>

//           <p>{report.technicalSummary}</p>
//         </section>
//       )}

//       {/* =========================================
//           COMMUNICATION SUMMARY
//       ========================================= */}

//       {report.communicationSummary && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Communication Summary</h2>

//             <span>AI Analysis</span>
//           </div>

//           <p>{report.communicationSummary}</p>
//         </section>
//       )}

//       {/* =========================================
//           RECOMMENDATION
//       ========================================= */}

//       {report.recommendation && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>AI Recommendation</h2>

//             <span>Next Steps</span>
//           </div>

//           <p>{report.recommendation}</p>
//         </section>
//       )}

//       {/* =========================================
//           QUESTION FEEDBACK
//       ========================================= */}

//       <section className="question-feedback">
//         <div className="section-header">
//           <h2>Question-by-Question Analysis</h2>

//           <p>Detailed AI evaluation of each response</p>
//         </div>

//         <div className="question-feedback__list">
//           {questions.length > 0 ? (
//             questions.map((question, index) => {
//               const questionFeedback = question?.feedback;

//               return (
//                 <div
//                   className="feedback-card glass-card"
//                   key={question?._id || `question-${index}`}
//                 >
//                   {/* TOP */}

//                   <div className="feedback-card__top">
//                     <span>Question {index + 1}</span>

//                     <div className="difficulty">
//                       {question?.difficulty || "Not specified"}
//                     </div>
//                   </div>

//                   {/* CATEGORY */}

//                   {question?.category && (
//                     <div className="question-category">{question.category}</div>
//                   )}

//                   {/* QUESTION */}

//                   <h3>{question?.question || "Question unavailable"}</h3>

//                   {/* ANSWER */}

//                   <div className="feedback-transcript">
//                     <span>Your Answer</span>

//                     <p>
//                       {question?.transcript?.trim()
//                         ? question.transcript
//                         : "No answer was recorded for this question."}
//                     </p>
//                   </div>

//                   {/* SCORE BREAKDOWN */}

//                   {questionFeedback && (
//                     <div className="question-scores">
//                       <div>
//                         <span>Technical</span>

//                         <strong>
//                           {getScore(questionFeedback.technicalScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Communication</span>

//                         <strong>
//                           {getScore(questionFeedback.communicationScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Confidence</span>

//                         <strong>
//                           {getScore(questionFeedback.confidenceScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Clarity</span>

//                         <strong>
//                           {getScore(questionFeedback.clarityScore)}%
//                         </strong>
//                       </div>
//                     </div>
//                   )}

//                   {/* AI ANALYSIS */}

//                   {questionFeedback?.aiAnalysis && (
//                     <div className="feedback-analysis">
//                       <span>AI Analysis</span>

//                       <p>{questionFeedback.aiAnalysis}</p>
//                     </div>
//                   )}

//                   {/* STRENGTHS */}

//                   {questionFeedback?.strengths?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Strengths</span>

//                       <ul>
//                         {questionFeedback.strengths.map(
//                           (item, strengthIndex) => (
//                             <li
//                               key={`question-${index}-strength-${strengthIndex}`}
//                             >
//                               {item}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   )}

//                   {/* IMPROVEMENTS */}

//                   {questionFeedback?.improvements?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Improvements</span>

//                       <ul>
//                         {questionFeedback.improvements.map(
//                           (item, improvementIndex) => (
//                             <li
//                               key={`question-${index}-improvement-${improvementIndex}`}
//                             >
//                               {item}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   )}

//                   {/* FILLER WORDS */}

//                   {questionFeedback?.fillerWords?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Filler Words</span>

//                       <p>{questionFeedback.fillerWords.join(", ")}</p>
//                     </div>
//                   )}

//                   {/* DURATION */}

//                   {Number(question?.answerDuration) > 0 && (
//                     <div className="answer-duration">
//                       Answer duration: {Math.round(question.answerDuration)}{" "}
//                       seconds
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="feedback-card glass-card">
//               <p>No question analysis is available.</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* =========================================
//           BOTTOM ACTIONS
//       ========================================= */}

//       <div className="result-actions">
//         <button
//           type="button"
//           className="new-interview-btn"
//           onClick={() => navigate("/start-interview")}
//         >
//           Start Another Interview
//         </button>

//         <button
//           type="button"
//           className="new-interview-btn"
//           onClick={() => navigate("/")}
//         >
//           Back to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InterviewResult;

// uppr vala perplexity vala

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import "../style/interviewResult.scss";
// import { useNavigate, useParams } from "react-router";
// import { useMockInterview } from "../hooks/useMockInterview";

// const InterviewResult = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();

//   const { getInterviewSessionApi, resumeInterviewApi } = useMockInterview();

//   const [loading, setLoading] = useState(true);
//   const [session, setSession] = useState(null);
//   const [error, setError] = useState("");
//   const [isAbandoned, setIsAbandoned] = useState(false);
//   const [resuming, setResuming] = useState(false);

//   // =========================================
//   // HELPERS
//   // =========================================

//   const getScore = (value) => {
//     const score = Number(value);

//     if (!Number.isFinite(score)) {
//       return 0;
//     }

//     return Math.min(100, Math.max(0, Math.round(score)));
//   };

//   const getErrorMessage = (error) => {
//     return (
//       error?.response?.data?.message ||
//       error?.message ||
//       "Unable to load your interview report."
//     );
//   };

//   // =========================================
//   // LOAD SESSION
//   // =========================================

//   const loadSession = useCallback(async () => {
//     if (!sessionId) {
//       setError("Invalid interview session.");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await getInterviewSessionApi(sessionId);
//       const interviewSession = response?.interviewSession;

//       if (!interviewSession) {
//         throw new Error("Interview session data was not returned.");
//       }

//       // Check if session is abandoned
//       if (interviewSession.status === "abandoned") {
//         setIsAbandoned(true);
//       }

//       setSession(interviewSession);
//       setIsAbandoned(response?.isAbandoned || false);
//     } catch (error) {
//       console.error("INTERVIEW RESULT ERROR:", error);

//       setError(getErrorMessage(error));
//     } finally {
//       setLoading(false);
//     }
//   }, [sessionId, getInterviewSessionApi]);

//   useEffect(() => {
//     loadSession();
//   }, [loadSession]);

//   // =========================================
//   // RESUME ABANDONED INTERVIEW
//   // =========================================

//   const handleResumeInterview = async () => {
//     try {
//       setResuming(true);
//       setError("");

//       await resumeInterviewApi(sessionId);

//       // Reload session (should now be in-progress)
//       await loadSession();
//     } catch (error) {
//       console.error("RESUME INTERVIEW ERROR:", error);
//       setError(getErrorMessage(error, "Failed to resume interview."));
//     } finally {
//       setResuming(false);
//     }
//   };

//   // =========================================
//   // CALCULATE AVERAGE SCORES
//   // =========================================

//   const averageScores = useMemo(() => {
//     const questions = session?.questions || [];

//     const feedbackQuestions = questions.filter(
//       (question) => question?.feedback,
//     );

//     if (feedbackQuestions.length === 0) {
//       return {
//         technicalScore: 0,
//         communicationScore: 0,
//         confidenceScore: 0,
//         clarityScore: 0,
//       };
//     }

//     const totals = feedbackQuestions.reduce(
//       (accumulator, question) => {
//         const feedback = question.feedback;

//         accumulator.technicalScore += getScore(feedback?.technicalScore);
//         accumulator.communicationScore += getScore(
//           feedback?.communicationScore,
//         );
//         accumulator.confidenceScore += getScore(feedback?.confidenceScore);
//         accumulator.clarityScore += getScore(feedback?.clarityScore);

//         return accumulator;
//       },
//       {
//         technicalScore: 0,
//         communicationScore: 0,
//         confidenceScore: 0,
//         clarityScore: 0,
//       },
//     );

//     return {
//       technicalScore: Math.round(
//         totals.technicalScore / feedbackQuestions.length,
//       ),
//       communicationScore: Math.round(
//         totals.communicationScore / feedbackQuestions.length,
//       ),
//       confidenceScore: Math.round(
//         totals.confidenceScore / feedbackQuestions.length,
//       ),
//       clarityScore: Math.round(totals.clarityScore / feedbackQuestions.length),
//     };
//   }, [session]);

//   // =========================================
//   // DERIVED DATA
//   // =========================================

//   const report = session?.finalReport || {};
//   const questions = session?.questions || [];
//   const overallScore = getScore(session?.overallScore);

//   const completedQuestions = questions.filter(
//     (question) => question?.transcript && question.transcript.trim().length > 0,
//   ).length;

//   const performanceLabel =
//     overallScore >= 80
//       ? "Excellent Performance"
//       : overallScore >= 60
//         ? "Good Performance"
//         : "Needs Improvement";

//   // =========================================
//   // LOADING
//   // =========================================

//   if (loading) {
//     return (
//       <div className="result-loading">
//         <div className="loader-ring"></div>

//         <h1>Generating AI Feedback...</h1>

//         <p>We're preparing your interview performance report.</p>
//       </div>
//     );
//   }

//   // =========================================
//   // ERROR
//   // =========================================

//   if (error || !session) {
//     return (
//       <div className="result-loading">
//         <h1>Unable to Load Report</h1>

//         <p>{error || "Your interview report could not be loaded."}</p>

//         <div className="result-error-actions">
//           <button
//             type="button"
//             onClick={loadSession}
//             className="new-interview-btn"
//           >
//             Try Again
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/start-interview")}
//             className="new-interview-btn"
//           >
//             Start New Interview
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // =========================================
//   // ABANDONED INTERVIEW WARNING
//   // =========================================

//   if (isAbandoned && session) {
//     return (
//       <div className="result-loading">
//         <div className="abandoned-icon">⏸️</div>
//         <h1>Interview Was Abandoned</h1>
//         <p>
//           This interview session was previously abandoned. You can resume it to
//           continue or view your current progress.
//         </p>

//         <div className="abandoned-details">
//           <p>
//             <strong>Role:</strong> {session.role}
//           </p>
//           <p>
//             <strong>Experience:</strong> {session.experienceLevel}
//           </p>
//           <p>
//             <strong>Progress:</strong> {completedQuestions} / {questions.length}{" "}
//             questions completed
//           </p>
//         </div>

//         <div className="result-error-actions">
//           <button
//             type="button"
//             onClick={handleResumeInterview}
//             className="new-interview-btn"
//             disabled={resuming}
//           >
//             {resuming ? "Resuming..." : "Resume Interview"}
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/interviews")}
//             className="new-interview-btn"
//           >
//             View All Interviews
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // =========================================
//   // RENDER
//   // =========================================

//   return (
//     <div className="result-page">
//       {/* BACKGROUND GLOW */}

//       <div className="result-glow result-glow--1"></div>

//       <div className="result-glow result-glow--2"></div>

//       {/* =========================================
//           HEADER
//       ========================================= */}

//       <header className="result-header">
//         <div>
//           <p className="result-label">AI Interview Analysis</p>

//           <h1>Interview Performance Report</h1>

//           <p>
//             {session.role} · {session.experienceLevel}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate("/start-interview")}
//           className="new-interview-btn"
//         >
//           + Start New Interview
//         </button>
//       </header>

//       {/* =========================================
//           HERO SCORE
//       ========================================= */}

//       <section className="hero-score glass-card">
//         <div className="hero-score__left">
//           <p className="hero-score__label">Overall AI Score</p>

//           <div className="score-ring">
//             <span>{overallScore}</span>

//             <small>%</small>
//           </div>

//           <h2>{performanceLabel}</h2>

//           <p>
//             AI analyzed your technical knowledge, communication, confidence, and
//             clarity throughout the interview.
//           </p>

//           <div className="interview-summary">
//             <span>
//               {completedQuestions} / {questions.length} questions completed
//             </span>
//           </div>
//         </div>

//         {/* =========================================
//             SCORE BREAKDOWN
//         ========================================= */}

//         <div className="hero-score__right">
//           <div className="mini-score-card">
//             <span>Technical</span>

//             <h3>{averageScores.technicalScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Communication</span>

//             <h3>{averageScores.communicationScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Confidence</span>

//             <h3>{averageScores.confidenceScore}%</h3>
//           </div>

//           <div className="mini-score-card">
//             <span>Clarity</span>

//             <h3>{averageScores.clarityScore}%</h3>
//           </div>
//         </div>
//       </section>

//       {/* =========================================
//           FINAL VERDICT
//       ========================================= */}

//       {report.finalVerdict && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Final Verdict</h2>

//             <span>AI Assessment</span>
//           </div>

//           <p>{report.finalVerdict}</p>
//         </section>
//       )}

//       {/* =========================================
//           STRENGTHS / WEAKNESSES
//       ========================================= */}

//       <div className="analysis-grid">
//         {/* STRENGTHS */}

//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Strengths</h2>

//             <span>AI Insights</span>
//           </div>

//           <div className="analysis-list">
//             {report.strengths?.length > 0 ? (
//               report.strengths.map((item, index) => (
//                 <div
//                   className="analysis-item analysis-item--good"
//                   key={`strength-${index}`}
//                 >
//                   <div className="analysis-icon">✓</div>

//                   <p>{item}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No specific strengths were generated.</p>
//             )}
//           </div>
//         </div>

//         {/* WEAKNESSES */}

//         <div className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Areas to Improve</h2>

//             <span>Growth Areas</span>
//           </div>

//           <div className="analysis-list">
//             {report.weaknesses?.length > 0 ? (
//               report.weaknesses.map((item, index) => (
//                 <div
//                   className="analysis-item analysis-item--bad"
//                   key={`weakness-${index}`}
//                 >
//                   <div className="analysis-icon">!</div>

//                   <p>{item}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No major weaknesses were identified.</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* =========================================
//           TECHNICAL SUMMARY
//       ========================================= */}

//       {report.technicalSummary && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Technical Summary</h2>

//             <span>AI Analysis</span>
//           </div>

//           <p>{report.technicalSummary}</p>
//         </section>
//       )}

//       {/* =========================================
//           COMMUNICATION SUMMARY
//       ========================================= */}

//       {report.communicationSummary && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>Communication Summary</h2>

//             <span>AI Analysis</span>
//           </div>

//           <p>{report.communicationSummary}</p>
//         </section>
//       )}

//       {/* =========================================
//           RECOMMENDATION
//       ========================================= */}

//       {report.recommendation && (
//         <section className="analysis-card glass-card">
//           <div className="analysis-card__header">
//             <h2>AI Recommendation</h2>

//             <span>Next Steps</span>
//           </div>

//           <p>{report.recommendation}</p>
//         </section>
//       )}

//       {/* =========================================
//           QUESTION FEEDBACK
//       ========================================= */}

//       <section className="question-feedback">
//         <div className="section-header">
//           <h2>Question-by-Question Analysis</h2>

//           <p>Detailed AI evaluation of each response</p>
//         </div>

//         <div className="question-feedback__list">
//           {questions.length > 0 ? (
//             questions.map((question, index) => {
//               const questionFeedback = question?.feedback;

//               return (
//                 <div
//                   className="feedback-card glass-card"
//                   key={question?._id || `question-${index}`}
//                 >
//                   {/* TOP */}

//                   <div className="feedback-card__top">
//                     <span>Question {index + 1}</span>

//                     <div className="difficulty">
//                       {question?.difficulty || "Not specified"}
//                     </div>
//                   </div>

//                   {/* CATEGORY */}

//                   {question?.category && (
//                     <div className="question-category">{question.category}</div>
//                   )}

//                   {/* QUESTION */}

//                   <h3>{question?.question || "Question unavailable"}</h3>

//                   {/* ANSWER */}

//                   <div className="feedback-transcript">
//                     <span>Your Answer</span>

//                     <p>
//                       {question?.transcript?.trim()
//                         ? question.transcript
//                         : "No answer was recorded for this question."}
//                     </p>
//                   </div>

//                   {/* SCORE BREAKDOWN */}

//                   {questionFeedback && (
//                     <div className="question-scores">
//                       <div>
//                         <span>Technical</span>

//                         <strong>
//                           {getScore(questionFeedback.technicalScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Communication</span>

//                         <strong>
//                           {getScore(questionFeedback.communicationScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Confidence</span>

//                         <strong>
//                           {getScore(questionFeedback.confidenceScore)}%
//                         </strong>
//                       </div>

//                       <div>
//                         <span>Clarity</span>

//                         <strong>
//                           {getScore(questionFeedback.clarityScore)}%
//                         </strong>
//                       </div>
//                     </div>
//                   )}

//                   {/* AI ANALYSIS */}

//                   {questionFeedback?.aiAnalysis && (
//                     <div className="feedback-analysis">
//                       <span>AI Analysis</span>

//                       <p>{questionFeedback.aiAnalysis}</p>
//                     </div>
//                   )}

//                   {/* STRENGTHS */}

//                   {questionFeedback?.strengths?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Strengths</span>

//                       <ul>
//                         {questionFeedback.strengths.map(
//                           (item, strengthIndex) => (
//                             <li
//                               key={`question-${index}-strength-${strengthIndex}`}
//                             >
//                               {item}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   )}

//                   {/* IMPROVEMENTS */}

//                   {questionFeedback?.improvements?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Improvements</span>

//                       <ul>
//                         {questionFeedback.improvements.map(
//                           (item, improvementIndex) => (
//                             <li
//                               key={`question-${index}-improvement-${improvementIndex}`}
//                             >
//                               {item}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   )}

//                   {/* FILLER WORDS */}

//                   {questionFeedback?.fillerWords?.length > 0 && (
//                     <div className="feedback-analysis">
//                       <span>Filler Words</span>

//                       <p>{questionFeedback.fillerWords.join(", ")}</p>
//                     </div>
//                   )}

//                   {/* DURATION */}

//                   {Number(question?.answerDuration) > 0 && (
//                     <div className="answer-duration">
//                       Answer duration: {Math.round(question.answerDuration)}{" "}
//                       seconds
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="feedback-card glass-card">
//               <p>No question analysis is available.</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* =========================================
//           BOTTOM ACTIONS
//       ========================================= */}

//       <div className="result-actions">
//         <button
//           type="button"
//           className="new-interview-btn"
//           onClick={() => navigate("/start-interview")}
//         >
//           Start Another Interview
//         </button>

//         <button
//           type="button"
//           className="new-interview-btn"
//           onClick={() => navigate("/interviews")}
//         >
//           View All Interviews
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InterviewResult;



import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../style/interviewResult.scss";
import { useNavigate, useParams } from "react-router";
import { useMockInterview } from "../hooks/useMockInterview";

const InterviewResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { getInterviewSessionApi, resumeInterviewApi } = useMockInterview();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [isAbandoned, setIsAbandoned] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [resuming, setResuming] = useState(false);

  // =========================================
  // HELPERS
  // =========================================

  const getScore = (value) => {
    const score = Number(value);

    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  // Prefer the normalized axios error shape (.userMessage), then fall
  // back to .message, then to a generic sentence.
  const getErrorMessage = (err, fallback = "Unable to load your interview report.") => {
    return err?.userMessage || err?.message || fallback;
  };

  // =========================================
  // LOAD SESSION
  // =========================================

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setError("Invalid interview session.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getInterviewSessionApi(sessionId);
      const interviewSession = response?.interviewSession;

      if (!interviewSession) {
        throw new Error("Interview session data was not returned.");
      }

      setSession(interviewSession);

      // Single source of truth for status flags. Use BOTH the session
      // status AND the server-provided flag, but never let one override
      // the other back to `false`.
      const abandoned =
        interviewSession.status === "abandoned" ||
        response?.isAbandoned === true;

      const inProgress =
        interviewSession.status === "in-progress" ||
        interviewSession.status === "processing";

      setIsAbandoned(abandoned);
      setIsInProgress(inProgress);
    } catch (err) {
      console.error("INTERVIEW RESULT ERROR:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [sessionId, getInterviewSessionApi]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // =========================================
  // RESUME ABANDONED INTERVIEW
  // =========================================

  const handleResumeInterview = async () => {
    try {
      setResuming(true);
      setError("");

      await resumeInterviewApi(sessionId);

      // Reload session (should now be in-progress)
      await loadSession();
    } catch (err) {
      console.error("RESUME INTERVIEW ERROR:", err);
      setError(
        getErrorMessage(err, "Failed to resume interview."),
      );
    } finally {
      setResuming(false);
    }
  };

  // =========================================
  // CALCULATE AVERAGE SCORES
  // =========================================

  const averageScores = useMemo(() => {
    const questions = session?.questions || [];

    const feedbackQuestions = questions.filter(
      (question) => question?.feedback,
    );

    if (feedbackQuestions.length === 0) {
      return {
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        clarityScore: 0,
      };
    }

    const totals = feedbackQuestions.reduce(
      (accumulator, question) => {
        const feedback = question.feedback;

        accumulator.technicalScore += getScore(feedback?.technicalScore);
        accumulator.communicationScore += getScore(
          feedback?.communicationScore,
        );
        accumulator.confidenceScore += getScore(feedback?.confidenceScore);
        accumulator.clarityScore += getScore(feedback?.clarityScore);

        return accumulator;
      },
      {
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        clarityScore: 0,
      },
    );

    return {
      technicalScore: Math.round(
        totals.technicalScore / feedbackQuestions.length,
      ),
      communicationScore: Math.round(
        totals.communicationScore / feedbackQuestions.length,
      ),
      confidenceScore: Math.round(
        totals.confidenceScore / feedbackQuestions.length,
      ),
      clarityScore: Math.round(totals.clarityScore / feedbackQuestions.length),
    };
  }, [session]);

  // =========================================
  // DERIVED DATA
  // =========================================

  const report = session?.finalReport || {};
  const questions = session?.questions || [];
  const overallScore = getScore(session?.overallScore);

  const completedQuestions = questions.filter(
    (question) => question?.transcript && question.transcript.trim().length > 0,
  ).length;

  const performanceLabel =
    overallScore >= 80
      ? "Excellent Performance"
      : overallScore >= 60
        ? "Good Performance"
        : "Needs Improvement";

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="result-loading">
        <div className="loader-ring"></div>

        <h1>Generating AI Feedback...</h1>

        <p>We're preparing your interview performance report.</p>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error || !session) {
    return (
      <div className="result-loading">
        <h1>Unable to Load Report</h1>

        <p>{error || "Your interview report could not be loaded."}</p>

        <div className="result-error-actions">
          <button
            type="button"
            onClick={loadSession}
            className="new-interview-btn"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate("/start-interview")}
            className="new-interview-btn"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // INTERVIEW STILL IN PROGRESS
  // =========================================
  //
  // User landed on the result URL while the interview is still running.
  // Show a dedicated state instead of an empty report.

  if (isInProgress) {
    return (
      <div className="result-loading">
        <div className="abandoned-icon">🎙️</div>

        <h1>Interview Still in Progress</h1>

        <p>
          This interview hasn&apos;t been completed yet. Continue where you
          left off to generate your final AI report.
        </p>

        <div className="abandoned-details">
          <p>
            <strong>Role:</strong> {session.role}
          </p>
          <p>
            <strong>Experience:</strong> {session.experienceLevel}
          </p>
          <p>
            <strong>Progress:</strong> {completedQuestions} / {questions.length}{" "}
            questions completed
          </p>
        </div>

        <div className="result-error-actions">
          <button
            type="button"
            onClick={() => navigate(`/interview/live/${sessionId}`)}
            className="new-interview-btn"
          >
            Continue Interview
          </button>

          <button
            type="button"
            onClick={() => navigate("/interviews")}
            className="new-interview-btn"
          >
            View All Interviews
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // ABANDONED INTERVIEW WARNING
  // =========================================

  if (isAbandoned && session) {
    return (
      <div className="result-loading">
        <div className="abandoned-icon">⏸️</div>
        <h1>Interview Was Abandoned</h1>
        <p>
          This interview session was previously abandoned. You can resume it to
          continue or view your current progress.
        </p>

        <div className="abandoned-details">
          <p>
            <strong>Role:</strong> {session.role}
          </p>
          <p>
            <strong>Experience:</strong> {session.experienceLevel}
          </p>
          <p>
            <strong>Progress:</strong> {completedQuestions} / {questions.length}{" "}
            questions completed
          </p>
        </div>

        <div className="result-error-actions">
          <button
            type="button"
            onClick={handleResumeInterview}
            className="new-interview-btn"
            disabled={resuming}
          >
            {resuming ? "Resuming..." : "Resume Interview"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/interviews")}
            className="new-interview-btn"
          >
            View All Interviews
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="result-page">
      {/* BACKGROUND GLOW */}

      <div className="result-glow result-glow--1"></div>

      <div className="result-glow result-glow--2"></div>

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="result-header">
        <div>
          <p className="result-label">AI Interview Analysis</p>

          <h1>Interview Performance Report</h1>

          <p>
            {session.role} · {session.experienceLevel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/start-interview")}
          className="new-interview-btn"
        >
          + Start New Interview
        </button>
      </header>

      {/* =========================================
          HERO SCORE
      ========================================= */}

      <section className="hero-score glass-card">
        <div className="hero-score__left">
          <p className="hero-score__label">Overall AI Score</p>

          <div className="score-ring">
            <span>{overallScore}</span>

            <small>%</small>
          </div>

          <h2>{performanceLabel}</h2>

          <p>
            AI analyzed your technical knowledge, communication, confidence, and
            clarity throughout the interview.
          </p>

          <div className="interview-summary">
            <span>
              {completedQuestions} / {questions.length} questions completed
            </span>
          </div>
        </div>

        {/* =========================================
            SCORE BREAKDOWN
        ========================================= */}

        <div className="hero-score__right">
          <div className="mini-score-card">
            <span>Technical</span>

            <h3>{averageScores.technicalScore}%</h3>
          </div>

          <div className="mini-score-card">
            <span>Communication</span>

            <h3>{averageScores.communicationScore}%</h3>
          </div>

          <div className="mini-score-card">
            <span>Confidence</span>

            <h3>{averageScores.confidenceScore}%</h3>
          </div>

          <div className="mini-score-card">
            <span>Clarity</span>

            <h3>{averageScores.clarityScore}%</h3>
          </div>
        </div>
      </section>

      {/* =========================================
          FINAL VERDICT
      ========================================= */}

      {report.finalVerdict && (
        <section className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>Final Verdict</h2>

            <span>AI Assessment</span>
          </div>

          <p>{report.finalVerdict}</p>
        </section>
      )}

      {/* =========================================
          STRENGTHS / WEAKNESSES
      ========================================= */}

      <div className="analysis-grid">
        {/* STRENGTHS */}

        <div className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>Strengths</h2>

            <span>AI Insights</span>
          </div>

          <div className="analysis-list">
            {report.strengths?.length > 0 ? (
              report.strengths.map((item, index) => (
                <div
                  className="analysis-item analysis-item--good"
                  key={`strength-${index}`}
                >
                  <div className="analysis-icon">✓</div>

                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p>No specific strengths were generated.</p>
            )}
          </div>
        </div>

        {/* WEAKNESSES */}

        <div className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>Areas to Improve</h2>

            <span>Growth Areas</span>
          </div>

          <div className="analysis-list">
            {report.weaknesses?.length > 0 ? (
              report.weaknesses.map((item, index) => (
                <div
                  className="analysis-item analysis-item--bad"
                  key={`weakness-${index}`}
                >
                  <div className="analysis-icon">!</div>

                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p>No major weaknesses were identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          TECHNICAL SUMMARY
      ========================================= */}

      {report.technicalSummary && (
        <section className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>Technical Summary</h2>

            <span>AI Analysis</span>
          </div>

          <p>{report.technicalSummary}</p>
        </section>
      )}

      {/* =========================================
          COMMUNICATION SUMMARY
      ========================================= */}

      {report.communicationSummary && (
        <section className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>Communication Summary</h2>

            <span>AI Analysis</span>
          </div>

          <p>{report.communicationSummary}</p>
        </section>
      )}

      {/* =========================================
          RECOMMENDATION
      ========================================= */}

      {report.recommendation && (
        <section className="analysis-card glass-card">
          <div className="analysis-card__header">
            <h2>AI Recommendation</h2>

            <span>Next Steps</span>
          </div>

          <p>{report.recommendation}</p>
        </section>
      )}

      {/* =========================================
          QUESTION FEEDBACK
      ========================================= */}

      <section className="question-feedback">
        <div className="section-header">
          <h2>Question-by-Question Analysis</h2>

          <p>Detailed AI evaluation of each response</p>
        </div>

        <div className="question-feedback__list">
          {questions.length > 0 ? (
            questions.map((question, index) => {
              const questionFeedback = question?.feedback;

              return (
                <div
                  className="feedback-card glass-card"
                  key={question?._id || `question-${index}`}
                >
                  {/* TOP */}

                  <div className="feedback-card__top">
                    <span>Question {index + 1}</span>

                    <div className="difficulty">
                      {question?.difficulty || "Not specified"}
                    </div>
                  </div>

                  {/* CATEGORY */}

                  {question?.category && (
                    <div className="question-category">{question.category}</div>
                  )}

                  {/* QUESTION */}

                  <h3>{question?.question || "Question unavailable"}</h3>

                  {/* ANSWER */}

                  <div className="feedback-transcript">
                    <span>Your Answer</span>

                    <p>
                      {question?.transcript?.trim()
                        ? question.transcript
                        : "No answer was recorded for this question."}
                    </p>
                  </div>

                  {/* SCORE BREAKDOWN */}

                  {questionFeedback && (
                    <div className="question-scores">
                      <div>
                        <span>Technical</span>

                        <strong>
                          {getScore(questionFeedback.technicalScore)}%
                        </strong>
                      </div>

                      <div>
                        <span>Communication</span>

                        <strong>
                          {getScore(questionFeedback.communicationScore)}%
                        </strong>
                      </div>

                      <div>
                        <span>Confidence</span>

                        <strong>
                          {getScore(questionFeedback.confidenceScore)}%
                        </strong>
                      </div>

                      <div>
                        <span>Clarity</span>

                        <strong>
                          {getScore(questionFeedback.clarityScore)}%
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* AI ANALYSIS */}

                  {questionFeedback?.aiAnalysis && (
                    <div className="feedback-analysis">
                      <span>AI Analysis</span>

                      <p>{questionFeedback.aiAnalysis}</p>
                    </div>
                  )}

                  {/* STRENGTHS */}

                  {questionFeedback?.strengths?.length > 0 && (
                    <div className="feedback-analysis">
                      <span>Strengths</span>

                      <ul>
                        {questionFeedback.strengths.map(
                          (item, strengthIndex) => (
                            <li
                              key={`question-${index}-strength-${strengthIndex}`}
                            >
                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {/* IMPROVEMENTS */}

                  {questionFeedback?.improvements?.length > 0 && (
                    <div className="feedback-analysis">
                      <span>Improvements</span>

                      <ul>
                        {questionFeedback.improvements.map(
                          (item, improvementIndex) => (
                            <li
                              key={`question-${index}-improvement-${improvementIndex}`}
                            >
                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {/* FILLER WORDS */}

                  {questionFeedback?.fillerWords?.length > 0 && (
                    <div className="feedback-analysis">
                      <span>Filler Words</span>

                      <p>{questionFeedback.fillerWords.join(", ")}</p>
                    </div>
                  )}

                  {/* DURATION */}

                  {Number(question?.answerDuration) > 0 && (
                    <div className="answer-duration">
                      Answer duration: {Math.round(question.answerDuration)}{" "}
                      seconds
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="feedback-card glass-card">
              <p>No question analysis is available.</p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          BOTTOM ACTIONS
      ========================================= */}

      <div className="result-actions">
        <button
          type="button"
          className="new-interview-btn"
          onClick={() => navigate("/start-interview")}
        >
          Start Another Interview
        </button>

        <button
          type="button"
          className="new-interview-btn"
          onClick={() => navigate("/interviews")}
        >
          View All Interviews
        </button>
      </div>
    </div>
  );
};

export default InterviewResult;