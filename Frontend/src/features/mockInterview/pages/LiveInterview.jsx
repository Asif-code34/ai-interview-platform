// //uppr vala perplexity se phle vala he

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useParams } from "react-router";
// import "../style/liveInterview.scss";
// import {
//   getInterviewSessionApi,
//   submitAnswerApi,
//   resumeInterviewApi,
// } from "../services/mockInterview.api";

// const MAX_ANSWER_DURATION = 600; // 10 minutes
// const MIN_ANSWER_DURATION = 1;

// const LiveInterview = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();

//   /* ----------------------------- STATE ----------------------------- */

//   const [session, setSession] = useState(null);
//   const [currentQuestion, setCurrentQuestion] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [recording, setRecording] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const [answerDuration, setAnswerDuration] = useState(0);
//   const [feedback, setFeedback] = useState(null);
//   const [error, setError] = useState("");
//   const [isAbandoned, setIsAbandoned] = useState(false);

//   // AI voice state
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   /* ----------------------------- REFS ----------------------------- */

//   const mediaRecorderRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const recordingStartTimeRef = useRef(null);
//   const recordingTimerRef = useRef(null);
//   const speechTimerRef = useRef(null);
//   const isMountedRef = useRef(true);

//   /* ---------------------------------------------------------------- */
//   /*                         HELPER FUNCTIONS                         */
//   /* ---------------------------------------------------------------- */

//   const stopMicrophoneStream = useCallback(() => {
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach((track) => {
//         try {
//           track.stop();
//         } catch (error) {
//           console.error("Failed to stop microphone track:", error);
//         }
//       });

//       mediaStreamRef.current = null;
//     }
//   }, []);

//   const clearRecordingTimer = useCallback(() => {
//     if (recordingTimerRef.current) {
//       clearInterval(recordingTimerRef.current);
//       recordingTimerRef.current = null;
//     }
//   }, []);

//   const resetRecordingState = useCallback(() => {
//     clearRecordingTimer();
//     stopMicrophoneStream();
//     mediaRecorderRef.current = null;
//     audioChunksRef.current = [];
//     recordingStartTimeRef.current = null;

//     if (isMountedRef.current) {
//       setRecording(false);
//       setAnswerDuration(0);
//     }
//   }, [clearRecordingTimer, stopMicrophoneStream]);

//   const getErrorMessage = useCallback((error, fallbackMessage) => {
//     return error?.response?.data?.message || error?.message || fallbackMessage;
//   }, []);

//   /* ---------------------------------------------------------------- */
//   /*                         LOAD INTERVIEW                           */
//   /* ---------------------------------------------------------------- */

//   const loadInterviewSession = useCallback(async () => {
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

//       // Check if interview is completed
//       if (interviewSession.status === "completed") {
//         navigate(`/interview/result/${sessionId}`, {
//           replace: true,
//         });
//         return;
//       }

//       // Check if interview is abandoned
//       if (interviewSession.status === "abandoned") {
//         setIsAbandoned(true);
//         // Allow user to see the session but show warning
//       }

//       const questionIndex = Number(interviewSession.currentQuestionIndex) || 0;
//       const question = interviewSession.questions?.[questionIndex];

//       if (!question) {
//         throw new Error("Unable to find the current interview question.");
//       }

//       if (isMountedRef.current) {
//         setSession(interviewSession);
//         setCurrentQuestion(question);
//         setIsAbandoned(response?.isAbandoned || false);
//       }
//     } catch (error) {
//       console.error("LOAD INTERVIEW ERROR:", error);

//       if (isMountedRef.current) {
//         setError(
//           getErrorMessage(
//             error,
//             "Unable to load your interview. Please try again.",
//           ),
//         );
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [sessionId, navigate, getErrorMessage]);

//   useEffect(() => {
//     isMountedRef.current = true;
//     loadInterviewSession();

//     return () => {
//       isMountedRef.current = false;
//     };
//   }, [loadInterviewSession]);

//   /* ---------------------------------------------------------------- */
//   /*                         RESUME ABANDONED INTERVIEW               */
//   /* ---------------------------------------------------------------- */

//   const handleResumeInterview = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       await resumeInterviewApi(sessionId);

//       // Reload the session (now it should be in-progress)
//       await loadInterviewSession();
//     } catch (error) {
//       console.error("RESUME INTERVIEW ERROR:", error);
//       setError(
//         getErrorMessage(error, "Failed to resume interview. Please try again."),
//       );
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//       }
//     }
//   };

//   /* ---------------------------------------------------------------- */
//   /*                         TEXT TO SPEECH                           */
//   /* ---------------------------------------------------------------- */

//   const speakQuestion = useCallback((text) => {
//     if (
//       typeof window === "undefined" ||
//       !("speechSynthesis" in window) ||
//       !text
//     ) {
//       return;
//     }

//     try {
//       window.speechSynthesis.cancel();

//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.rate = 0.95;
//       utterance.pitch = 1;
//       utterance.volume = 1;

//       utterance.onstart = () => setIsSpeaking(true);
//       utterance.onend = () => setIsSpeaking(false);
//       utterance.onerror = () => setIsSpeaking(false);

//       window.speechSynthesis.speak(utterance);
//     } catch (error) {
//       console.error("TEXT TO SPEECH ERROR:", error);
//       setIsSpeaking(false);
//     }
//   }, []);

//   const stopSpeaking = useCallback(() => {
//     if (typeof window !== "undefined" && "speechSynthesis" in window) {
//       window.speechSynthesis.cancel();
//     }
//     setIsSpeaking(false);
//   }, []);

//   // Auto‑speak when question changes
//   useEffect(() => {
//     if (!currentQuestion?.question) {
//       return undefined;
//     }

//     if (speechTimerRef.current) {
//       clearTimeout(speechTimerRef.current);
//     }

//     if (typeof window !== "undefined" && "speechSynthesis" in window) {
//       window.speechSynthesis.cancel();

//       speechTimerRef.current = setTimeout(() => {
//         speakQuestion(currentQuestion.question);
//       }, 500);
//     }

//     return () => {
//       if (speechTimerRef.current) {
//         clearTimeout(speechTimerRef.current);
//         speechTimerRef.current = null;
//       }

//       if (typeof window !== "undefined" && "speechSynthesis" in window) {
//         window.speechSynthesis.cancel();
//       }
//     };
//   }, [currentQuestion, speakQuestion]);

//   /* ---------------------------------------------------------------- */
//   /*                         RECORDING TIMER                          */
//   /* ---------------------------------------------------------------- */

//   const startRecordingTimer = useCallback(() => {
//     clearRecordingTimer();
//     recordingStartTimeRef.current = Date.now();
//     setAnswerDuration(0);

//     recordingTimerRef.current = setInterval(() => {
//       if (!recordingStartTimeRef.current) {
//         return;
//       }

//       const elapsedSeconds = Math.floor(
//         (Date.now() - recordingStartTimeRef.current) / 1000,
//       );

//       if (elapsedSeconds >= MAX_ANSWER_DURATION) {
//         setAnswerDuration(MAX_ANSWER_DURATION);
//         clearRecordingTimer();

//         if (
//           mediaRecorderRef.current &&
//           mediaRecorderRef.current.state === "recording"
//         ) {
//           mediaRecorderRef.current.stop();
//         }

//         return;
//       }

//       if (isMountedRef.current) {
//         setAnswerDuration(elapsedSeconds);
//       }
//     }, 250);
//   }, [clearRecordingTimer]);

//   /* ---------------------------------------------------------------- */
//   /*                         START RECORDING                          */
//   /* ---------------------------------------------------------------- */

//   const startRecording = useCallback(async () => {
//     if (loading || submitting || recording) {
//       return;
//     }

//     if (!currentQuestion) {
//       setError("No interview question is currently available.");
//       return;
//     }

//     try {
//       setError("");
//       setFeedback(null);
//       stopSpeaking(); // stop any ongoing speech

//       if (
//         typeof window === "undefined" ||
//         !navigator.mediaDevices ||
//         !navigator.mediaDevices.getUserMedia
//       ) {
//         throw new Error("Your browser does not support microphone recording.");
//       }

//       if (typeof MediaRecorder === "undefined") {
//         throw new Error("Audio recording is not supported by this browser.");
//       }

//       stopMicrophoneStream();
//       audioChunksRef.current = [];

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });

//       mediaStreamRef.current = stream;

//       const supportedMimeTypes = [
//         "audio/webm;codecs=opus",
//         "audio/webm",
//         "audio/mp4",
//       ];

//       const selectedMimeType =
//         supportedMimeTypes.find((type) =>
//           MediaRecorder.isTypeSupported(type),
//         ) || "";

//       const recorderOptions = selectedMimeType
//         ? { mimeType: selectedMimeType }
//         : undefined;

//       const mediaRecorder = new MediaRecorder(stream, recorderOptions);
//       mediaRecorderRef.current = mediaRecorder;

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onerror = (event) => {
//         console.error("MEDIA RECORDER ERROR:", event);

//         if (isMountedRef.current) {
//           setError("An error occurred while recording your answer.");
//         }
//       };

//       mediaRecorder.onstop = () => {
//         clearRecordingTimer();
//       };

//       mediaRecorder.start(250);
//       setRecording(true);
//       startRecordingTimer();
//     } catch (error) {
//       console.error("START RECORDING ERROR:", error);

//       stopMicrophoneStream();
//       clearRecordingTimer();

//       if (isMountedRef.current) {
//         setRecording(false);
//         setError(
//           getErrorMessage(
//             error,
//             "Unable to access your microphone. Please allow microphone permission and try again.",
//           ),
//         );
//       }
//     }
//   }, [
//     loading,
//     submitting,
//     recording,
//     currentQuestion,
//     stopMicrophoneStream,
//     clearRecordingTimer,
//     startRecordingTimer,
//     getErrorMessage,
//     stopSpeaking,
//   ]);

//   /* ---------------------------------------------------------------- */
//   /*                         STOP RECORDING                           */
//   /* ---------------------------------------------------------------- */

//   const stopRecording = useCallback(() => {
//     if (submitting) {
//       return;
//     }

//     const recorder = mediaRecorderRef.current;

//     if (!recorder || recorder.state !== "recording") {
//       return;
//     }

//     clearRecordingTimer();
//     recorder.stop();
//     setRecording(false);
//     stopMicrophoneStream();
//   }, [submitting, clearRecordingTimer, stopMicrophoneStream]);

//   /* ---------------------------------------------------------------- */
//   /*                         SUBMIT ANSWER                            */
//   /* ---------------------------------------------------------------- */

//   const submitRecordedAnswer = useCallback(async () => {
//     if (submitting) {
//       return;
//     }

//     if (!sessionId) {
//       setError("Invalid interview session.");
//       return;
//     }

//     if (!currentQuestion) {
//       setError("Current interview question is unavailable.");
//       return;
//     }

//     if (audioChunksRef.current.length === 0) {
//       setError("No audio was recorded. Please record your answer again.");
//       return;
//     }

//     const duration = Math.floor(
//       recordingStartTimeRef.current
//         ? (Date.now() - recordingStartTimeRef.current) / 1000
//         : answerDuration,
//     );

//     const finalDuration = Math.min(
//       Math.max(duration, answerDuration),
//       MAX_ANSWER_DURATION,
//     );

//     if (finalDuration < MIN_ANSWER_DURATION) {
//       setError("Your answer is too short. Please record at least 1 second.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       setError("");
//       setFeedback(null);

//       const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
//       const audioBlob = new Blob(audioChunksRef.current, {
//         type: mimeType,
//       });

//       if (!audioBlob.size) {
//         throw new Error("The recorded audio is empty.");
//       }

//       const response = await submitAnswerApi(
//         sessionId,
//         audioBlob,
//         finalDuration,
//       );

//       if (!isMountedRef.current) {
//         return;
//       }

//       if (!response) {
//         throw new Error("Invalid response from interview server.");
//       }

//       if (response.completed) {
//         navigate(`/interview/result/${sessionId}`, {
//           replace: true,
//         });

//         return;
//       }

//       if (!response.nextQuestion?.question) {
//         throw new Error("The next interview question was not received.");
//       }

//       setFeedback(response.feedback || null);
//       setCurrentQuestion(response.nextQuestion);
//       setSession((previousSession) => {
//         if (!previousSession) {
//           return previousSession;
//         }

//         return {
//           ...previousSession,
//           currentQuestionIndex: (previousSession.currentQuestionIndex || 0) + 1,
//         };
//       });

//       audioChunksRef.current = [];
//       recordingStartTimeRef.current = null;
//       setAnswerDuration(0);
//     } catch (error) {
//       console.error("SUBMIT ANSWER ERROR:", error);

//       if (isMountedRef.current) {
//         setError(
//           getErrorMessage(
//             error,
//             "We could not process your answer. Please try again.",
//           ),
//         );
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setSubmitting(false);
//       }
//     }
//   }, [
//     submitting,
//     sessionId,
//     currentQuestion,
//     answerDuration,
//     navigate,
//     getErrorMessage,
//   ]);

//   /* ---------------------------------------------------------------- */
//   /*                AUTOMATIC SUBMISSION AFTER STOP                   */
//   /* ---------------------------------------------------------------- */

//   const previousRecordingRef = useRef(false);

//   useEffect(() => {
//     const wasRecording = previousRecordingRef.current;

//     if (wasRecording && !recording) {
//       const timer = setTimeout(() => {
//         if (!submitting && audioChunksRef.current.length > 0) {
//           submitRecordedAnswer();
//         }
//       }, 0);

//       return () => clearTimeout(timer);
//     }

//     previousRecordingRef.current = recording;

//     return undefined;
//   }, [recording, submitting, submitRecordedAnswer]);

//   /* ---------------------------------------------------------------- */
//   /*                         PAGE CLEANUP                             */
//   /* ---------------------------------------------------------------- */

//   useEffect(() => {
//     return () => {
//       clearRecordingTimer();
//       stopMicrophoneStream();

//       if (typeof window !== "undefined" && "speechSynthesis" in window) {
//         window.speechSynthesis.cancel();
//       }

//       if (speechTimerRef.current) {
//         clearTimeout(speechTimerRef.current);
//       }

//       const recorder = mediaRecorderRef.current;

//       if (recorder && recorder.state === "recording") {
//         try {
//           recorder.stop();
//         } catch (error) {
//           console.error("RECORDER CLEANUP ERROR:", error);
//         }
//       }

//       mediaRecorderRef.current = null;
//       audioChunksRef.current = [];
//     };
//   }, [clearRecordingTimer, stopMicrophoneStream]);

//   /* ---------------------------------------------------------------- */
//   /*                         FORMAT TIME                              */
//   /* ---------------------------------------------------------------- */

//   const formatDuration = (seconds) => {
//     const safeSeconds = Math.max(0, Number(seconds) || 0);
//     const minutes = Math.floor(safeSeconds / 60);
//     const remainingSeconds = safeSeconds % 60;

//     return `${String(minutes).padStart(2, "0")}:${String(
//       remainingSeconds,
//     ).padStart(2, "0")}`;
//   };

//   /* ---------------------------------------------------------------- */
//   /*                             LOADING                              */
//   /* ---------------------------------------------------------------- */

//   if (loading) {
//     return (
//       <div className="live-interview-page">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <h2>Preparing Your Interview</h2>
//           <p>Your AI interviewer is getting everything ready...</p>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------------------------------------------------------- */
//   /*                              ERROR                               */
//   /* ---------------------------------------------------------------- */

//   if (error && !session && !currentQuestion) {
//     return (
//       <div className="live-interview-page">
//         <div className="error-container">
//           <div className="error-icon">⚠️</div>
//           <h2>Unable to Start Interview</h2>
//           <p>{error}</p>
//           <div className="error-actions">
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={loadInterviewSession}
//             >
//               Try Again
//             </button>
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={() => navigate(-1)}
//             >
//               Go Back
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------------------------------------------------------- */
//   /*                         ABANDONED INTERVIEW WARNING              */
//   /* ---------------------------------------------------------------- */

//   if (isAbandoned && session) {
//     return (
//       <div className="live-interview-page">
//         <div className="abandoned-container">
//           <div className="abandoned-icon">⏸️</div>
//           <h2>Interview Was Abandoned</h2>
//           <p>This interview session was previously abandoned.</p>
//           <p className="abandoned-details">
//             Role: <strong>{session.role}</strong> | Question:{""}
//             {(session.currentQuestionIndex || 0) + 1} of{" "}
//             {session.totalQuestions}
//           </p>
//           <div className="abandoned-actions">
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={handleResumeInterview}
//               disabled={loading}
//             >
//               {loading ? "Resuming..." : "Resume Interview"}
//             </button>
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={() => navigate("/interviews")}
//             >
//               View All Interviews
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------------------------------------------------------- */
//   /*                              MAIN UI                             */
//   /* ---------------------------------------------------------------- */

//   return (
//     <div className="live-interview-page">
//       {/* Background Orbs */}
//       <div className="gradient-orb gradient-orb--1" />
//       <div className="gradient-orb gradient-orb--2" />

//       <div className="live-container">
//         {/* ========== LEFT PANEL ========== */}
//         <div className="live-left">
//           {/* Brand */}
//           <div className="live-brand">
//             <h1>AI Interview Copilot</h1>
//             <p>
//               Real-time AI powered mock interviews with adaptive questioning &
//               feedback.
//             </p>
//           </div>

//           {/* Modern AI Panel */}
//           <div className="modern-ai-panel">
//             <div className="modern-ai-top">
//               <div className="modern-ai-profile">
//                 <div
//                   className={`modern-ai-avatar
//                     ${isSpeaking ? "speaking" : ""}
//                     ${recording ? "listening" : ""}
//                     ${submitting ? "thinking" : ""}
//                   `}
//                 >
//                   <div className="avatar-core"></div>
//                 </div>
//                 <div className="modern-ai-info">
//                   <h2>AI Interviewer</h2>
//                   <p>
//                     {submitting
//                       ? "Analyzing your response..."
//                       : recording
//                         ? "Listening carefully..."
//                         : isSpeaking
//                           ? "Speaking question..."
//                           : "Ready for interview"}
//                   </p>
//                 </div>
//               </div>
//               <div className="ai-live-status">
//                 <span></span>
//                 ACTIVE
//               </div>
//             </div>

//             {/* Voice Visualizer */}
//             <div className="voice-visualizer-container">
//               <div className="voice-bars">
//                 {[...Array(18)].map((_, index) => (
//                   <span
//                     key={index}
//                     className={`
//                       voice-bar
//                       ${isSpeaking ? "voice-speaking" : ""}
//                       ${recording ? "voice-listening" : ""}
//                     `}
//                     style={{ animationDelay: `${index * 0.07}s` }}
//                   ></span>
//                 ))}
//               </div>
//             </div>

//             {/* Status Text */}
//             <div className="modern-ai-status">
//               {isSpeaking && (
//                 <>
//                   <div className="status-dot speaking"></div>
//                   AI is asking the interview question
//                 </>
//               )}
//               {recording && (
//                 <>
//                   <div className="status-dot listening"></div>
//                   Listening to your response
//                 </>
//               )}
//               {submitting && (
//                 <>
//                   <div className="status-dot thinking"></div>
//                   Generating intelligent feedback
//                 </>
//               )}
//               {!isSpeaking && !recording && !submitting && (
//                 <>
//                   <div className="status-dot idle"></div>
//                   AI interviewer ready
//                 </>
//               )}
//             </div>

//             {/* Quick Actions */}
//             <div className="modern-ai-actions">
//               <button
//                 onClick={() => speakQuestion(currentQuestion?.question)}
//                 className="replay-btn"
//                 disabled={!currentQuestion}
//               >
//                 🔊 Replay
//               </button>
//               <button onClick={stopSpeaking} className="mute-btn">
//                 🔇 Mute
//               </button>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="live-stats">
//             <div className="stat-card">
//               <span>Role</span>
//               <h3>{session?.role || "—"}</h3>
//             </div>
//             <div className="stat-card">
//               <span>Experience</span>
//               <h3>{session?.experienceLevel || "—"}</h3>
//             </div>
//             <div className="stat-card">
//               <span>Question</span>
//               <h3>
//                 {(session?.currentQuestionIndex || 0) + 1} /{" "}
//                 {session?.questions?.length || 0}
//               </h3>
//             </div>
//           </div>
//         </div>

//         {/* ========== RIGHT PANEL ========== */}
//         <div className="live-right">
//           {/* Question Card */}
//           <div className="question-card">
//             {/* AI Interviewer Panel (mini) */}
//             <div className="ai-interviewer-panel">
//               <div className="ai-panel-left">
//                 <div
//                   className={`ai-status-dot
//                     ${isSpeaking ? "speaking" : ""}
//                     ${recording ? "listening" : ""}
//                     ${submitting ? "thinking" : ""}
//                   `}
//                 ></div>
//                 <div>
//                   <h3>AI Interviewer</h3>
//                   <p>
//                     {isSpeaking
//                       ? "Speaking..."
//                       : recording
//                         ? "Listening to your answer..."
//                         : submitting
//                           ? "Analyzing response..."
//                           : "Ready for interview"}
//                   </p>
//                 </div>
//               </div>
//               <div className="voice-wave">
//                 <span className={isSpeaking ? "active" : ""}></span>
//                 <span className={isSpeaking ? "active" : ""}></span>
//                 <span className={isSpeaking ? "active" : ""}></span>
//                 <span className={isSpeaking ? "active" : ""}></span>
//                 <span className={isSpeaking ? "active" : ""}></span>
//               </div>
//             </div>

//             <span className="question-badge">Current Question</span>
//             <h2>{currentQuestion?.question || "Loading question..."}</h2>
//             <div className="question-meta">
//               <span>{currentQuestion?.category || "General"}</span>
//               <span>{currentQuestion?.difficulty || "Medium"}</span>
//             </div>

//             <div className="ai-controls">
//               <button
//                 onClick={() => speakQuestion(currentQuestion?.question)}
//                 className="record-btn"
//                 disabled={!currentQuestion}
//               >
//                 🔊 Replay Question
//               </button>
//               <button onClick={stopSpeaking} className="voice-stop-btn">
//                 Stop Voice
//               </button>
//             </div>
//           </div>

//           {/* Record Section */}
//           <div className="record-section">
//             {!recording && !submitting && (
//               <button
//                 onClick={startRecording}
//                 className="record-btn"
//                 disabled={!currentQuestion}
//               >
//                 🎤 Start Speaking
//               </button>
//             )}
//             {recording && (
//               <button onClick={stopRecording} className="stop-btn">
//                 ⏹ Stop Recording
//               </button>
//             )}
//             {submitting && (
//               <p className="processing-text">AI is analyzing your answer...</p>
//             )}
//           </div>

//           {/* Feedback Card */}
//           {feedback && !submitting && (
//             <div className="feedback-card">
//               <h3>AI Feedback</h3>

//               <div className="feedback-score">
//                 Technical Score: {feedback.technicalScore}/100
//               </div>

//               <div className="feedback-analysis">{feedback.aiAnalysis}</div>

//               <div className="feedback-section">
//                 <h4>Strengths</h4>
//                 <ul>
//                   {feedback.strengths?.map((item, idx) => (
//                     <li key={idx}>{item}</li>
//                   ))}
//                 </ul>
//               </div>

//               <div className="feedback-section">
//                 <h4>Improvements</h4>
//                 <ul>
//                   {feedback.improvements?.map((item, idx) => (
//                     <li key={idx}>{item}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveInterview;




import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import "../style/liveInterview.scss";
import {
  getInterviewSessionApi,
  submitAnswerApi,
  resumeInterviewApi,
  retryAdvanceApi,
} from "../services/mockInterview.api";

const MAX_ANSWER_DURATION = 600; // 10 minutes
const MIN_ANSWER_DURATION = 1;

const LiveInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  /* ----------------------------- STATE ----------------------------- */

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [answerDuration, setAnswerDuration] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [isAbandoned, setIsAbandoned] = useState(false);

  // AI voice state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── RETRY STATE ─────────────────────────────────────────────
  // Set when the answer was saved + evaluated but the follow-up
  // step (next question / final report) failed. The client retries
  // with `retryAdvanceApi` — no audio re-upload.
  const [retryState, setRetryState] = useState(null);
  // { questionIndex, transcript, feedback, userMessage }

  /* ----------------------------- REFS ----------------------------- */

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  /* ---------------------------------------------------------------- */
  /*                         HELPER FUNCTIONS                         */
  /* ---------------------------------------------------------------- */

  const stopMicrophoneStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.error("Failed to stop microphone track:", err);
        }
      });

      mediaStreamRef.current = null;
    }
  }, []);

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const resetRecordingState = useCallback(() => {
    clearRecordingTimer();
    stopMicrophoneStream();
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    recordingStartTimeRef.current = null;

    if (isMountedRef.current) {
      setRecording(false);
      setAnswerDuration(0);
    }
  }, [clearRecordingTimer, stopMicrophoneStream]);

  // Prefer the normalized error shape from the axios interceptor.
  const getErrorMessage = useCallback((err, fallbackMessage) => {
    return err?.userMessage || err?.message || fallbackMessage;
  }, []);

  /* ---------------------------------------------------------------- */
  /*                         LOAD INTERVIEW                           */
  /* ---------------------------------------------------------------- */

  const loadInterviewSession = useCallback(async () => {
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

      if (interviewSession.status === "completed") {
        navigate(`/interview/result/${sessionId}`, { replace: true });
        return;
      }

      if (interviewSession.status === "abandoned") {
        setIsAbandoned(true);
      }

      const questionIndex = Number(interviewSession.currentQuestionIndex) || 0;
      const question = interviewSession.questions?.[questionIndex];

      if (!question) {
        throw new Error("Unable to find the current interview question.");
      }

      if (!isMountedRef.current) return;

      setSession(interviewSession);
      setCurrentQuestion(question);
      setIsAbandoned(response?.isAbandoned || false);

      // ── FIX: current question already evaluated ────────────────
      // This happens when the previous submit succeeded but the
      // next-question generation failed. Instead of letting the user
      // re-record (which the backend would ignore), enter the retry
      // state and let them continue via `retryAdvanceApi`.
      if (question.transcript && question.feedback) {
        setRetryState({
          questionIndex,
          transcript: question.transcript,
          feedback: question.feedback,
          userMessage:
            "Your previous answer was saved. Tap continue to move forward.",
        });
        setFeedback(question.feedback);
      } else {
        setRetryState(null);
      }
    } catch (err) {
      console.error("LOAD INTERVIEW ERROR:", err);

      if (isMountedRef.current) {
        setError(
          getErrorMessage(
            err,
            "Unable to load your interview. Please try again.",
          ),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [sessionId, navigate, getErrorMessage]);

  useEffect(() => {
    isMountedRef.current = true;
    loadInterviewSession();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadInterviewSession]);

  /* ---------------------------------------------------------------- */
  /*                     RESUME ABANDONED INTERVIEW                   */
  /* ---------------------------------------------------------------- */

  const handleResumeInterview = async () => {
    try {
      setLoading(true);
      setError("");

      await resumeInterviewApi(sessionId);

      await loadInterviewSession();
    } catch (err) {
      console.error("RESUME INTERVIEW ERROR:", err);
      setError(
        getErrorMessage(err, "Failed to resume interview. Please try again."),
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  /* ---------------------------------------------------------------- */
  /*                         TEXT TO SPEECH                           */
  /* ---------------------------------------------------------------- */

  const speakQuestion = useCallback((text) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !text
    ) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TEXT TO SPEECH ERROR:", err);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Auto-speak when question changes
  useEffect(() => {
    if (!currentQuestion?.question) {
      return undefined;
    }

    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      speechTimerRef.current = setTimeout(() => {
        speakQuestion(currentQuestion.question);
      }, 500);
    }

    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, speakQuestion]);

  /* ---------------------------------------------------------------- */
  /*                         RECORDING TIMER                          */
  /* ---------------------------------------------------------------- */

  const startRecordingTimer = useCallback(() => {
    clearRecordingTimer();
    recordingStartTimeRef.current = Date.now();
    setAnswerDuration(0);

    recordingTimerRef.current = setInterval(() => {
      if (!recordingStartTimeRef.current) return;

      const elapsedSeconds = Math.floor(
        (Date.now() - recordingStartTimeRef.current) / 1000,
      );

      if (elapsedSeconds >= MAX_ANSWER_DURATION) {
        setAnswerDuration(MAX_ANSWER_DURATION);
        clearRecordingTimer();

        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.stop();
        }

        return;
      }

      if (isMountedRef.current) {
        setAnswerDuration(elapsedSeconds);
      }
    }, 250);
  }, [clearRecordingTimer]);

  /* ---------------------------------------------------------------- */
  /*                         START RECORDING                          */
  /* ---------------------------------------------------------------- */

  const startRecording = useCallback(async () => {
    if (loading || submitting || recording || retryState) {
      return;
    }

    if (!currentQuestion) {
      setError("No interview question is currently available.");
      return;
    }

    try {
      setError("");
      setFeedback(null);
      stopSpeaking();

      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error("Your browser does not support microphone recording.");
      }

      if (typeof MediaRecorder === "undefined") {
        throw new Error("Audio recording is not supported by this browser.");
      }

      stopMicrophoneStream();
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaStreamRef.current = stream;

      const supportedMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const selectedMimeType =
        supportedMimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(type),
        ) || "";

      const recorderOptions = selectedMimeType
        ? { mimeType: selectedMimeType }
        : undefined;

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MEDIA RECORDER ERROR:", event);

        if (isMountedRef.current) {
          setError("An error occurred while recording your answer.");
        }
      };

      mediaRecorder.onstop = () => {
        clearRecordingTimer();
      };

      mediaRecorder.start(250);
      setRecording(true);
      startRecordingTimer();
    } catch (err) {
      console.error("START RECORDING ERROR:", err);

      stopMicrophoneStream();
      clearRecordingTimer();

      if (isMountedRef.current) {
        setRecording(false);
        setError(
          getErrorMessage(
            err,
            "Unable to access your microphone. Please allow microphone permission and try again.",
          ),
        );
      }
    }
  }, [
    loading,
    submitting,
    recording,
    retryState,
    currentQuestion,
    stopMicrophoneStream,
    clearRecordingTimer,
    startRecordingTimer,
    getErrorMessage,
    stopSpeaking,
  ]);

  /* ---------------------------------------------------------------- */
  /*                         STOP RECORDING                           */
  /* ---------------------------------------------------------------- */

  const stopRecording = useCallback(() => {
    if (submitting) return;

    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") return;

    clearRecordingTimer();
    recorder.stop();
    setRecording(false);
    stopMicrophoneStream();
  }, [submitting, clearRecordingTimer, stopMicrophoneStream]);

  /* ---------------------------------------------------------------- */
  /*                         SUBMIT ANSWER                            */
  /* ---------------------------------------------------------------- */

  const submitRecordedAnswer = useCallback(async () => {
    if (submitting || retryState) return;

    if (!sessionId) {
      setError("Invalid interview session.");
      return;
    }

    if (!currentQuestion) {
      setError("Current interview question is unavailable.");
      return;
    }

    if (audioChunksRef.current.length === 0) {
      setError("No audio was recorded. Please record your answer again.");
      return;
    }

    const duration = Math.floor(
      recordingStartTimeRef.current
        ? (Date.now() - recordingStartTimeRef.current) / 1000
        : answerDuration,
    );

    const finalDuration = Math.min(
      Math.max(duration, answerDuration),
      MAX_ANSWER_DURATION,
    );

    if (finalDuration < MIN_ANSWER_DURATION) {
      setError("Your answer is too short. Please record at least 1 second.");
      return;
    }

    // ── FIX: questionIndex must be sent for idempotent retries ──
    const questionIndex = Number(session?.currentQuestionIndex) || 0;

    try {
      setSubmitting(true);
      setError("");
      setFeedback(null);

      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (!audioBlob.size) {
        throw new Error("The recorded audio is empty.");
      }

      const response = await submitAnswerApi(
        sessionId,
        audioBlob,
        finalDuration,
        questionIndex, // ← FIX
      );

      if (!isMountedRef.current) return;

      if (!response) {
        throw new Error("Invalid response from interview server.");
      }

      if (response.completed) {
        navigate(`/interview/result/${sessionId}`, { replace: true });
        return;
      }

      if (!response.nextQuestion?.question) {
        throw new Error("The next interview question was not received.");
      }

      setFeedback(response.feedback || null);
      setCurrentQuestion(response.nextQuestion);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentQuestionIndex: (prev.currentQuestionIndex || 0) + 1,
            }
          : prev,
      );

      audioChunksRef.current = [];
      recordingStartTimeRef.current = null;
      setAnswerDuration(0);
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);

      if (!isMountedRef.current) return;

      const code = err?.code;

      // ── FIX: retryable errors → enter retry state ────────────
      // The answer was saved on the server. Only the follow-up step
      // failed. We don't need the audio anymore.
      const isRetryableAdvance =
        err?.retryable === true ||
        err?.retryWithoutAudio === true ||
        code === "NEXT_QUESTION_UNAVAILABLE" ||
        code === "FINAL_REPORT_UNAVAILABLE" ||
        code === "AI_RATE_LIMIT";

      if (isRetryableAdvance) {
        const savedFeedback = err?.raw?.feedback || null;

        setRetryState({
          questionIndex,
          transcript: err?.raw?.transcript || "",
          feedback: savedFeedback,
          userMessage:
            err?.userMessage ||
            "Your answer was saved. Tap continue to move forward.",
        });

        if (savedFeedback) setFeedback(savedFeedback);

        // Audio can be safely discarded — the answer is on the server.
        audioChunksRef.current = [];
        recordingStartTimeRef.current = null;
        setAnswerDuration(0);

        return;
      }

      // ── FIX: client out of sync → reload ─────────────────────
      if (code === "QUESTION_INDEX_MISMATCH") {
        await loadInterviewSession();
        return;
      }

      // ── FIX: no audio accepted → force re-record ─────────────
      if (code === "AUDIO_REQUIRED" || code === "ANSWER_NOT_READY") {
        setRetryState(null);
        setError(
          err?.userMessage || "Please record your answer again to continue.",
        );
        return;
      }

      setError(
        getErrorMessage(
          err,
          "We could not process your answer. Please try again.",
        ),
      );
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  }, [
    submitting,
    retryState,
    sessionId,
    currentQuestion,
    answerDuration,
    session,
    navigate,
    getErrorMessage,
    loadInterviewSession,
  ]);

  /* ---------------------------------------------------------------- */
  /*              AUTOMATIC SUBMISSION AFTER STOP                     */
  /* ---------------------------------------------------------------- */

  const previousRecordingRef = useRef(false);

  useEffect(() => {
    const wasRecording = previousRecordingRef.current;

    if (wasRecording && !recording) {
      const timer = setTimeout(() => {
        if (
          !submitting &&
          !retryState &&
          audioChunksRef.current.length > 0
        ) {
          submitRecordedAnswer();
        }
      }, 0);

      return () => clearTimeout(timer);
    }

    previousRecordingRef.current = recording;

    return undefined;
  }, [recording, submitting, retryState, submitRecordedAnswer]);

  /* ---------------------------------------------------------------- */
  /*                  RETRY ADVANCE (NO AUDIO)                        */
  /* ---------------------------------------------------------------- */
  //
  // Called when:
  //   - The submit response was retryable (NEXT_QUESTION_UNAVAILABLE,
  //     FINAL_REPORT_UNAVAILABLE, AI_RATE_LIMIT)
  //   - OR the session loaded with the current question already
  //     evaluated (previous attempt lost the response)
  //
  // No audio required — the server reuses the saved transcript +
  // feedback and just tries the follow-up step again.

  const handleRetryAdvance = useCallback(async () => {
    if (!retryState || !sessionId || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await retryAdvanceApi(
        sessionId,
        retryState.questionIndex,
      );

      if (!isMountedRef.current) return;

      if (response?.completed) {
        navigate(`/interview/result/${sessionId}`, { replace: true });
        return;
      }

      if (!response?.nextQuestion?.question) {
        throw new Error("The next interview question was not received.");
      }

      setFeedback(response.feedback || retryState.feedback || null);
      setCurrentQuestion(response.nextQuestion);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              currentQuestionIndex: (prev.currentQuestionIndex || 0) + 1,
            }
          : prev,
      );

      setRetryState(null);
      audioChunksRef.current = [];
      recordingStartTimeRef.current = null;
      setAnswerDuration(0);
    } catch (err) {
      console.error("RETRY ADVANCE ERROR:", err);

      if (!isMountedRef.current) return;

      const code = err?.code;

      // Client out of sync with the server → reload
      if (code === "QUESTION_INDEX_MISMATCH") {
        setRetryState(null);
        await loadInterviewSession();
        return;
      }

      // Server says the answer wasn't ready → fall back to re-record
      if (code === "ANSWER_NOT_READY") {
        setRetryState(null);
        setError(
          err?.userMessage ||
            "Your answer needs to be recorded again. Please try again.",
        );
        return;
      }

      // Still retryable → keep the retry card, update the message
      if (err?.retryable !== false) {
        setRetryState((prev) =>
          prev
            ? {
                ...prev,
                userMessage:
                  err?.userMessage ||
                  "Still unable to continue. Please try again.",
              }
            : prev,
        );
        return;
      }

      setRetryState(null);
      setError(
        getErrorMessage(
          err,
          "We could not continue the interview. Please try again.",
        ),
      );
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  }, [
    retryState,
    sessionId,
    submitting,
    navigate,
    getErrorMessage,
    loadInterviewSession,
  ]);

  /* ---------------------------------------------------------------- */
  /*                         PAGE CLEANUP                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      stopMicrophoneStream();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state === "recording") {
        try {
          recorder.stop();
        } catch (err) {
          console.error("RECORDER CLEANUP ERROR:", err);
        }
      }

      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
    };
  }, [clearRecordingTimer, stopMicrophoneStream]);

  /* ---------------------------------------------------------------- */
  /*                         FORMAT TIME                              */
  /* ---------------------------------------------------------------- */

  const formatDuration = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /* ---------------------------------------------------------------- */
  /*                             LOADING                              */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="live-interview-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Preparing Your Interview</h2>
          <p>Your AI interviewer is getting everything ready...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*                              ERROR                               */
  /* ---------------------------------------------------------------- */

  if (error && !session && !currentQuestion) {
    return (
      <div className="live-interview-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Start Interview</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={loadInterviewSession}
            >
              Try Again
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*                    ABANDONED INTERVIEW WARNING                   */
  /* ---------------------------------------------------------------- */

  if (isAbandoned && session) {
    return (
      <div className="live-interview-page">
        <div className="abandoned-container">
          <div className="abandoned-icon">⏸️</div>
          <h2>Interview Was Abandoned</h2>
          <p>This interview session was previously abandoned.</p>
          <p className="abandoned-details">
            Role: <strong>{session.role}</strong> | Question:{" "}
            {(session.currentQuestionIndex || 0) + 1} of{" "}
            {session.totalQuestions}
          </p>
          <div className="abandoned-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleResumeInterview}
              disabled={loading}
            >
              {loading ? "Resuming..." : "Resume Interview"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/interviews")}
            >
              View All Interviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*                             MAIN UI                              */
  /* ---------------------------------------------------------------- */

  return (
    <div className="live-interview-page">
      <div className="gradient-orb gradient-orb--1" />
      <div className="gradient-orb gradient-orb--2" />

      <div className="live-container">
        {/* ========== LEFT PANEL ========== */}
        <div className="live-left">
          <div className="live-brand">
            <h1>AI Interview Copilot</h1>
            <p>
              Real-time AI powered mock interviews with adaptive questioning &
              feedback.
            </p>
          </div>

          <div className="modern-ai-panel">
            <div className="modern-ai-top">
              <div className="modern-ai-profile">
                <div
                  className={`modern-ai-avatar
                    ${isSpeaking ? "speaking" : ""}
                    ${recording ? "listening" : ""}
                    ${submitting ? "thinking" : ""}
                  `}
                >
                  <div className="avatar-core"></div>
                </div>
                <div className="modern-ai-info">
                  <h2>AI Interviewer</h2>
                  <p>
                    {submitting
                      ? "Analyzing your response..."
                      : recording
                        ? "Listening carefully..."
                        : isSpeaking
                          ? "Speaking question..."
                          : retryState
                            ? "Waiting to continue..."
                            : "Ready for interview"}
                  </p>
                </div>
              </div>
              <div className="ai-live-status">
                <span></span>
                ACTIVE
              </div>
            </div>

            <div className="voice-visualizer-container">
              <div className="voice-bars">
                {[...Array(18)].map((_, index) => (
                  <span
                    key={index}
                    className={`
                      voice-bar
                      ${isSpeaking ? "voice-speaking" : ""}
                      ${recording ? "voice-listening" : ""}
                    `}
                    style={{ animationDelay: `${index * 0.07}s` }}
                  ></span>
                ))}
              </div>
            </div>

            <div className="modern-ai-status">
              {isSpeaking && (
                <>
                  <div className="status-dot speaking"></div>
                  AI is asking the interview question
                </>
              )}
              {recording && (
                <>
                  <div className="status-dot listening"></div>
                  Listening to your response
                </>
              )}
              {submitting && (
                <>
                  <div className="status-dot thinking"></div>
                  Generating intelligent feedback
                </>
              )}
              {!isSpeaking && !recording && !submitting && (
                <>
                  <div className="status-dot idle"></div>
                  {retryState
                    ? "Answer saved — continue to next"
                    : "AI interviewer ready"}
                </>
              )}
            </div>

            <div className="modern-ai-actions">
              <button
                onClick={() => speakQuestion(currentQuestion?.question)}
                className="replay-btn"
                disabled={!currentQuestion}
              >
                🔊 Replay
              </button>
              <button onClick={stopSpeaking} className="mute-btn">
                🔇 Mute
              </button>
            </div>
          </div>

          <div className="live-stats">
            <div className="stat-card">
              <span>Role</span>
              <h3>{session?.role || "—"}</h3>
            </div>
            <div className="stat-card">
              <span>Experience</span>
              <h3>{session?.experienceLevel || "—"}</h3>
            </div>
            <div className="stat-card">
              <span>Question</span>
              <h3>
                {(session?.currentQuestionIndex || 0) + 1} /{" "}
                {session?.questions?.length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* ========== RIGHT PANEL ========== */}
        <div className="live-right">
          <div className="question-card">
            <div className="ai-interviewer-panel">
              <div className="ai-panel-left">
                <div
                  className={`ai-status-dot
                    ${isSpeaking ? "speaking" : ""}
                    ${recording ? "listening" : ""}
                    ${submitting ? "thinking" : ""}
                  `}
                ></div>
                <div>
                  <h3>AI Interviewer</h3>
                  <p>
                    {isSpeaking
                      ? "Speaking..."
                      : recording
                        ? "Listening to your answer..."
                        : submitting
                          ? "Analyzing response..."
                          : retryState
                            ? "Ready to continue"
                            : "Ready for interview"}
                  </p>
                </div>
              </div>
              <div className="voice-wave">
                <span className={isSpeaking ? "active" : ""}></span>
                <span className={isSpeaking ? "active" : ""}></span>
                <span className={isSpeaking ? "active" : ""}></span>
                <span className={isSpeaking ? "active" : ""}></span>
                <span className={isSpeaking ? "active" : ""}></span>
              </div>
            </div>

            <span className="question-badge">Current Question</span>
            <h2>{currentQuestion?.question || "Loading question..."}</h2>
            <div className="question-meta">
              <span>{currentQuestion?.category || "General"}</span>
              <span>{currentQuestion?.difficulty || "Medium"}</span>
            </div>

            <div className="ai-controls">
              <button
                onClick={() => speakQuestion(currentQuestion?.question)}
                className="record-btn"
                disabled={!currentQuestion}
              >
                🔊 Replay Question
              </button>
              <button onClick={stopSpeaking} className="voice-stop-btn">
                Stop Voice
              </button>
            </div>
          </div>

          {/* ── RETRY CARD — answer saved, follow-up failed ── */}
          {retryState && (
            <div className="retry-card" role="status" aria-live="polite">
              <div className="retry-icon" aria-hidden="true">
                ↻
              </div>
              <h3>Answer Saved</h3>
              <p>{retryState.userMessage}</p>

              <button
                type="button"
                className="retry-btn"
                onClick={handleRetryAdvance}
                disabled={submitting}
              >
                {submitting ? "Continuing…" : "Continue to Next Question"}
              </button>
            </div>
          )}

          {/* ── RECORD SECTION — hidden while in retry state ── */}
          {!retryState && (
            <div className="record-section">
              {!recording && !submitting && (
                <button
                  onClick={startRecording}
                  className="record-btn"
                  disabled={!currentQuestion}
                >
                  🎤 Start Speaking
                </button>
              )}
              {recording && (
                <>
                  <button onClick={stopRecording} className="stop-btn">
                    ⏹ Stop Recording
                  </button>
                  <p className="recording-timer">
                    {formatDuration(answerDuration)} / 10:00
                  </p>
                </>
              )}
              {submitting && (
                <p className="processing-text">
                  AI is analyzing your answer...
                </p>
              )}
            </div>
          )}

          {/* Inline error — only shown when not in a fatal state */}
          {error && session && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}

          {/* Feedback Card */}
          {feedback && !submitting && (
            <div className="feedback-card">
              <h3>AI Feedback</h3>

              <div className="feedback-score">
                Technical Score: {feedback.technicalScore}/100
              </div>

              <div className="feedback-analysis">{feedback.aiAnalysis}</div>

              <div className="feedback-section">
                <h4>Strengths</h4>
                <ul>
                  {feedback.strengths?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="feedback-section">
                <h4>Improvements</h4>
                <ul>
                  {feedback.improvements?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;