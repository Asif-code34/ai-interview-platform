// import React, { useState, useEffect, useCallback } from "react";
// import "../style/mockInterviewSetup.scss";
// import { useNavigate } from "react-router";
// import { useMockInterview } from "../hooks/useMockInterview";

// const MockInterviewSetup = () => {
//   const navigate = useNavigate();
//   const {
//     startInterviewApi,
//     getActiveInterviewsApi,
//     resumeInterviewApi,
//     abandonInterviewApi,
//   } = useMockInterview();

//   const [loading, setLoading] = useState(false);
//   const [checkingActive, setCheckingActive] = useState(true);
//   const [showResumeModal, setShowResumeModal] = useState(false);

//   const [activeInterviews, setActiveInterviews] = useState({
//     canResume: false,
//     canStartNew: true,
//     activeInterviewsCount: 0,
//     resumableSessions: [],
//     abandonedSessions: [],
//     maxConcurrentInterviews: 2,
//   });

//   const [formData, setFormData] = useState({
//     role: "",
//     experienceLevel: "fresher",
//     interviewType: "mixed",
//     techStack: "",
//   });

//   const [errors, setErrors] = useState({});

//   // ============================================================
//   // CHECK ACTIVE INTERVIEWS
//   // ============================================================
//   //
//   // `silent` skips the loading banner — used for background refreshes.
//   // Returns the fresh data (or null on failure) so callers can chain.

//   const checkActiveInterviews = useCallback(
//     async (silent = false) => {
//       try {
//         if (!silent) setCheckingActive(true);

//         const response = await getActiveInterviewsApi();

//         if (response?.success) {
//           setActiveInterviews(response.data);
//           return response.data;
//         }

//         return null;
//       } catch (error) {
//         console.error("Error checking active interviews:", error);
//         return null;
//       } finally {
//         if (!silent) setCheckingActive(false);
//       }
//     },
//     [getActiveInterviewsApi],
//   );

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         setCheckingActive(true);
//         const response = await getActiveInterviewsApi();

//         if (!cancelled && response?.success) {
//           setActiveInterviews(response.data);
//         }
//       } catch (error) {
//         console.error("Error checking active interviews:", error);
//       } finally {
//         if (!cancelled) setCheckingActive(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [getActiveInterviewsApi]);

//   // ============================================================
//   // FORM HANDLING
//   // ============================================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.role.trim()) {
//       newErrors.role = "Target role is required";
//     } else if (formData.role.length > 100) {
//       newErrors.role = "Role cannot exceed 100 characters";
//     }

//     if (!formData.techStack.trim()) {
//       newErrors.techStack = "Tech stack is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ============================================================
//   // INTERVIEW ACTIONS
//   // ============================================================

//   const handleStartInterview = async () => {
//     if (!validateForm()) return;

//     // If the pre-check already knows the user has resumable sessions,
//     // show the modal instead of hitting the API again.
//     if (activeInterviews.canResume) {
//       setShowResumeModal(true);
//       return;
//     }

//     await startInterview(false);
//   };

//   const startInterview = async (forceNew = false) => {
//     try {
//       setLoading(true);

//       const payload = {
//         role: formData.role.trim(),
//         experienceLevel: formData.experienceLevel,
//         interviewType: formData.interviewType,
//         techStack: formData.techStack
//           .split(",")
//           .map((tech) => tech.trim())
//           .filter(Boolean),
//         forceNew,
//       };

//       const response = await startInterviewApi(payload);

//       if (response?.code === "ACTIVE_INTERVIEWS_EXIST") {
//         setShowResumeModal(true);
//         setActiveInterviews((prev) => ({
//           ...prev,
//           canStartNew: response.canStartNew,
//         }));
//         return;
//       }

//       const sessionId = response?.interviewSession?._id;

//       if (!sessionId) {
//         throw new Error("Interview session was not returned by the server.");
//       }

//       navigate(`/interview/live/${sessionId}`);
//     } catch (error) {
//       console.error("Error starting interview:", error);

//       // Normalized axios errors expose .code / .userMessage directly.
//       if (error?.code === "MAX_INTERVIEWS_REACHED") {
//         alert(
//           `You can have maximum ${activeInterviews.maxConcurrentInterviews} active interviews. Please complete or abandon an existing interview.`,
//         );
//       } else {
//         alert(error?.userMessage || "Failed to start interview. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResumeInterview = async (sessionId) => {
//     try {
//       setLoading(true);
//       await resumeInterviewApi(sessionId);
//       navigate(`/interview/live/${sessionId}`);
//     } catch (error) {
//       console.error("Error resuming interview:", error);

//       // If the session is gone server-side, refresh the list so the UI
//       // reflects reality.
//       if (error?.status === 404 || error?.code === "NOT_FOUND") {
//         await checkActiveInterviews(true);
//         setShowResumeModal(false);
//       }

//       alert(error?.userMessage || "Failed to resume interview.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartNewInterview = async () => {
//     setShowResumeModal(false);
//     await startInterview(true);
//   };

//   const handleAbandonInterview = async (sessionId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to abandon this interview? You can resume it later.",
//       )
//     ) {
//       return;
//     }

//     try {
//       setLoading(true);
//       await abandonInterviewApi(sessionId);

//       // Silent refresh — no banner flash.
//       const fresh = await checkActiveInterviews(true);

//       if (fresh) {
//         const stillHasSessions =
//           fresh.resumableSessions.length > 0 ||
//           fresh.abandonedSessions.length > 0;

//         if (!stillHasSessions) {
//           setShowResumeModal(false);
//         }
//       }
//     } catch (error) {
//       console.error("Error abandoning interview:", error);
//       alert(error?.userMessage || "Failed to abandon interview.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     if (loading) return;
//     setShowResumeModal(false);
//   };

//   // ============================================================
//   // UTILITIES
//   // ============================================================

//   const formatLastActivity = (dateString) => {
//     if (!dateString) return "";

//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     return `${diffDays}d ago`;
//   };

//   const totalResumable =
//     activeInterviews.resumableSessions.length +
//     activeInterviews.abandonedSessions.length;

//   const modalTitle =
//     activeInterviews.resumableSessions.length > 0
//       ? "You Have Active Interviews"
//       : "Resume Previous Interview";

//   const startButtonLabel = checkingActive
//     ? "Checking…"
//     : loading
//       ? "Starting Interview…"
//       : "Start AI Interview";

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <>
//       <div className="mock-interview-page">
//         {/* LEFT PANEL */}
//         <div className="branding-panel">
//           <div className="gradient-orb orb-1"></div>
//           <div className="gradient-orb orb-2"></div>

//           <div className="branding-content">
//             <div className="logo-badge">
//               <span>AI</span>
//             </div>

//             <h1>
//               Crack Your Next
//               <span> Technical Interview</span>
//             </h1>

//             <p>
//               Experience ultra-realistic AI-powered mock interviews with
//               intelligent feedback, voice interaction, and adaptive questioning.
//             </p>

//             <div className="stats-grid">
//               <div className="stat-card">
//                 <h2>10K+</h2>
//                 <span>Interviews Conducted</span>
//               </div>

//               <div className="stat-card">
//                 <h2>95%</h2>
//                 <span>Success Improvement</span>
//               </div>

//               <div className="stat-card">
//                 <h2>AI</h2>
//                 <span>Real-time Evaluation</span>
//               </div>

//               <div className="stat-card">
//                 <h2>24/7</h2>
//                 <span>Interview Practice</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="setup-panel">
//           <div className="setup-card">
//             <div className="setup-header">
//               <h2>Start Mock Interview</h2>
//               <p>Configure your personalized AI interview session</p>
//             </div>

//             {/* Active Interviews Notice */}
//             {checkingActive && (
//               <div className="notice-banner notice-info">
//                 <div className="notice-icon">
//                   <svg
//                     className="animate-spin"
//                     style={{ width: "1.1rem", height: "1.1rem" }}
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 </div>
//                 <p>Checking for active interviews…</p>
//               </div>
//             )}

//             {!checkingActive && totalResumable > 0 && (
//               <div className="notice-banner notice-warning">
//                 <div className="notice-icon">
//                   <svg
//                     className="w-5 h-5"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="font-medium">
//                     You have {totalResumable} interview
//                     {totalResumable !== 1 ? "s" : ""} in progress
//                   </p>
//                   <p className="text-sm">
//                     Click Start to resume one or begin a new interview.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Form */}
//             <div className="setup-form">
//               <div className="form-group">
//                 <label htmlFor="role">Target Role *</label>
//                 <input
//                   id="role"
//                   type="text"
//                   name="role"
//                   placeholder="e.g., MERN Stack Developer"
//                   value={formData.role}
//                   onChange={handleChange}
//                   className={errors.role ? "error" : ""}
//                   disabled={loading}
//                   maxLength={100}
//                   autoComplete="off"
//                 />
//                 {errors.role && (
//                   <span className="error-message">{errors.role}</span>
//                 )}
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="experienceLevel">Experience Level *</label>
//                   <select
//                     id="experienceLevel"
//                     name="experienceLevel"
//                     value={formData.experienceLevel}
//                     onChange={handleChange}
//                     disabled={loading}
//                   >
//                     <option value="fresher">Fresher (0-1 years)</option>
//                     <option value="junior">Junior (1-3 years)</option>
//                     <option value="mid">Mid-Level (3-5 years)</option>
//                     <option value="senior">Senior (5+ years)</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="interviewType">Interview Type</label>
//                   <select
//                     id="interviewType"
//                     name="interviewType"
//                     value={formData.interviewType}
//                     onChange={handleChange}
//                     disabled={loading}
//                   >
//                     <option value="mixed">
//                       Mixed (Technical + Behavioral)
//                     </option>
//                     <option value="technical">Technical Only</option>
//                     <option value="behavioral">Behavioral Only</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label htmlFor="techStack">Tech Stack *</label>
//                 <textarea
//                   id="techStack"
//                   name="techStack"
//                   placeholder="React, Node.js, MongoDB, Express"
//                   value={formData.techStack}
//                   onChange={handleChange}
//                   rows="3"
//                   className={errors.techStack ? "error" : ""}
//                   disabled={loading}
//                 />
//                 {errors.techStack && (
//                   <span className="error-message">{errors.techStack}</span>
//                 )}
//                 <span className="helper-text">
//                   Separate multiple technologies with commas
//                 </span>
//               </div>

//               <button
//                 type="button"
//                 className={`start-btn ${loading ? "loading" : ""}`}
//                 onClick={handleStartInterview}
//                 disabled={loading || checkingActive}
//               >
//                 {loading ? (
//                   <>
//                     <svg
//                       className="animate-spin"
//                       style={{
//                         width: "1rem",
//                         height: "1rem",
//                         marginRight: "0.55rem",
//                         marginLeft: "-0.25rem",
//                       }}
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Starting Interview…
//                   </>
//                 ) : (
//                   startButtonLabel
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ============================================================
//           RESUME OR NEW INTERVIEW MODAL
//       ============================================================ */}
//       {showResumeModal && (
//         <div
//           className="modal-overlay"
//           onClick={handleCloseModal}
//           role="presentation"
//         >
//           <div
//             className="modal-content"
//             onClick={(e) => e.stopPropagation()}
//             role="dialog"
//             aria-modal="true"
//           >
//             <div className="modal-header">
//               <div className="modal-title">
//                 <svg
//                   className="w-6 h-6"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <h3>{modalTitle}</h3>
//               </div>
//               <button
//                 type="button"
//                 className="modal-close"
//                 onClick={handleCloseModal}
//                 disabled={loading}
//                 aria-label="Close"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-body">
//               <p className="modal-description">
//                 Choose to resume an existing interview or start a new one.
//               </p>

//               {/* Resumable Sessions */}
//               {activeInterviews.resumableSessions.length > 0 && (
//                 <div className="section">
//                   <h4 className="section-title">In Progress</h4>
//                   <div className="sessions-list">
//                     {activeInterviews.resumableSessions.map((session) => (
//                       <div key={session._id} className="session-card">
//                         <div className="session-info">
//                           <h5 className="session-role">{session.role}</h5>
//                           <p className="session-meta">
//                             {session.experienceLevel} • {session.interviewType}
//                           </p>
//                           <div className="session-progress">
//                             <span className="progress-badge">
//                               Question {session.currentQuestionIndex + 1} of{" "}
//                               {session.totalQuestions}
//                             </span>
//                             <span className="time-ago">
//                               {formatLastActivity(session.lastActivityAt)}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="session-actions">
//                           <button
//                             type="button"
//                             className="btn btn-primary btn-sm"
//                             onClick={() => handleResumeInterview(session._id)}
//                             disabled={loading}
//                           >
//                             Resume
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-secondary btn-sm"
//                             onClick={() => handleAbandonInterview(session._id)}
//                             disabled={loading}
//                           >
//                             Abandon
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Abandoned Sessions */}
//               {activeInterviews.abandonedSessions.length > 0 && (
//                 <div className="section">
//                   <h4 className="section-title">Previously Abandoned</h4>
//                   <div className="sessions-list">
//                     {activeInterviews.abandonedSessions.map((session) => (
//                       <div key={session._id} className="session-card abandoned">
//                         <div className="session-info">
//                           <h5 className="session-role">{session.role}</h5>
//                           <p className="session-meta">
//                             {session.experienceLevel} • {session.interviewType}
//                           </p>
//                           <div className="session-progress">
//                             <span className="progress-badge warning">
//                               Question {session.currentQuestionIndex + 1} of{" "}
//                               {session.totalQuestions}
//                             </span>
//                             <span className="time-ago">
//                               Abandoned{" "}
//                               {formatLastActivity(session.lastActivityAt)}
//                             </span>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           className="btn btn-success btn-sm"
//                           onClick={() => handleResumeInterview(session._id)}
//                           disabled={loading}
//                         >
//                           Resume
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Start New Option */}
//               {activeInterviews.canStartNew && (
//                 <div className="section">
//                   <button
//                     type="button"
//                     className="btn btn-block btn-start-new"
//                     onClick={handleStartNewInterview}
//                     disabled={loading}
//                   >
//                     <svg
//                       className="w-5 h-5 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 4v16m8-8H4"
//                       />
//                     </svg>
//                     Start New Interview
//                   </button>
//                   <p className="helper-text text-center">
//                     You can have up to{" "}
//                     {activeInterviews.maxConcurrentInterviews} active interviews
//                   </p>
//                 </div>
//               )}

//               {!activeInterviews.canStartNew && (
//                 <div className="notice-banner notice-error">
//                   <svg
//                     className="w-5 h-5"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   <p>
//                     You've reached the maximum number of active interviews (
//                     {activeInterviews.maxConcurrentInterviews}). Please complete
//                     or abandon an existing interview to start a new one.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button
//                 type="button"
//                 className="btn btn-secondary btn-block"
//                 onClick={handleCloseModal}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MockInterviewSetup;


import React, { useState, useEffect, useCallback } from "react";
import "../style/mockInterviewSetup.scss";
import { useNavigate } from "react-router";
import { useMockInterview } from "../hooks/useMockInterview";

const MockInterviewSetup = () => {
  const navigate = useNavigate();
  const {
    startInterviewApi,
    getActiveInterviewsApi,
    resumeInterviewApi,
    abandonInterviewApi,
  } = useMockInterview();

  const [loading, setLoading] = useState(false);
  const [checkingActive, setCheckingActive] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [activeInterviews, setActiveInterviews] = useState({
    canResume: false,
    canStartNew: true,
    activeInterviewsCount: 0,
    resumableSessions: [],
    abandonedSessions: [],
    maxConcurrentInterviews: 2,
  });

  const [formData, setFormData] = useState({
    role: "",
    experienceLevel: "fresher",
    interviewType: "mixed",
    techStack: "",
  });

  const [errors, setErrors] = useState({});

  // ============================================================
  // CHECK ACTIVE INTERVIEWS
  // ============================================================

  const checkActiveInterviews = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setCheckingActive(true);

        const response = await getActiveInterviewsApi();

        if (response?.success) {
          setActiveInterviews(response.data);
          return response.data;
        }

        return null;
      } catch (error) {
        console.error("Error checking active interviews:", error);
        return null;
      } finally {
        if (!silent) setCheckingActive(false);
      }
    },
    [getActiveInterviewsApi],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setCheckingActive(true);
        const response = await getActiveInterviewsApi();

        if (!cancelled && response?.success) {
          setActiveInterviews(response.data);
        }
      } catch (error) {
        console.error("Error checking active interviews:", error);
      } finally {
        if (!cancelled) setCheckingActive(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getActiveInterviewsApi]);

  // ============================================================
  // FORM HANDLING
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role.trim()) {
      newErrors.role = "Target role is required";
    } else if (formData.role.length > 100) {
      newErrors.role = "Role cannot exceed 100 characters";
    }

    if (!formData.techStack.trim()) {
      newErrors.techStack = "Tech stack is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // INTERVIEW ACTIONS
  // ============================================================

  const handleStartInterview = async () => {
    if (!validateForm()) return;

    if (activeInterviews.canResume) {
      setShowResumeModal(true);
      return;
    }

    await startInterview(false);
  };

  const startInterview = async (forceNew = false) => {
    try {
      setLoading(true);

      const payload = {
        role: formData.role.trim(),
        experienceLevel: formData.experienceLevel,
        interviewType: formData.interviewType,
        techStack: formData.techStack
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        forceNew,
      };

      const response = await startInterviewApi(payload);

      if (response?.code === "ACTIVE_INTERVIEWS_EXIST") {
        setShowResumeModal(true);
        setActiveInterviews((prev) => ({
          ...prev,
          canStartNew: response.canStartNew,
        }));
        return;
      }

      const sessionId = response?.interviewSession?._id;

      if (!sessionId) {
        throw new Error("Interview session was not returned by the server.");
      }

      navigate(`/interview/live/${sessionId}`);
    } catch (error) {
      console.error("Error starting interview:", error);

      if (error?.code === "MAX_INTERVIEWS_REACHED") {
        alert(
          `You can have maximum ${activeInterviews.maxConcurrentInterviews} active interviews. Please complete or abandon an existing interview.`,
        );
      } else {
        alert(error?.userMessage || "Failed to start interview. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeInterview = async (sessionId) => {
    try {
      setLoading(true);
      await resumeInterviewApi(sessionId);
      navigate(`/interview/live/${sessionId}`);
    } catch (error) {
      console.error("Error resuming interview:", error);

      if (error?.status === 404 || error?.code === "NOT_FOUND") {
        await checkActiveInterviews(true);
        setShowResumeModal(false);
      }

      alert(error?.userMessage || "Failed to resume interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewInterview = async () => {
    setShowResumeModal(false);
    await startInterview(true);
  };

  const handleAbandonInterview = async (sessionId) => {
    if (
      !window.confirm(
        "Are you sure you want to abandon this interview? You can resume it later.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await abandonInterviewApi(sessionId);

      const fresh = await checkActiveInterviews(true);

      if (fresh) {
        const stillHasSessions =
          fresh.resumableSessions.length > 0 ||
          fresh.abandonedSessions.length > 0;

        if (!stillHasSessions) {
          setShowResumeModal(false);
        }
      }
    } catch (error) {
      console.error("Error abandoning interview:", error);
      alert(error?.userMessage || "Failed to abandon interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (loading) return;
    setShowResumeModal(false);
  };

  // ============================================================
  // UTILITIES
  // ============================================================

  const formatLastActivity = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const totalResumable =
    activeInterviews.resumableSessions.length +
    activeInterviews.abandonedSessions.length;

  const modalTitle =
    activeInterviews.resumableSessions.length > 0
      ? "You Have Active Interviews"
      : "Resume Previous Interview";

  const startButtonLabel = checkingActive
    ? "Checking…"
    : loading
      ? "Starting Interview…"
      : "Start AI Interview";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <div className="mock-interview-page">
        {/* LEFT PANEL */}
        <div className="branding-panel">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>

          <div className="branding-content">
            {/* <div className="logo-badge">
              <span>AI</span>
            </div> */}
<div className="brand-mark">
  <span className="brand-mark__logo" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l1.6 4.9L18.5 9l-4.9 1.6L12 15.5l-1.6-4.9L5.5 9l4.9-1.6L12 2.5z" />
      <path
        d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6L15 17.5l2.6-.9.9-2.6z"
        opacity="0.75"
      />
      <path
        d="M6 15.5l.7 2L9 18.2l-2.3.7-.7 2-.7-2L3 18.2l2.3-.7.7-2z"
        opacity="0.55"
      />
    </svg>
  </span>
  <span className="brand-mark__name">InterviewAI</span>
</div>
            <h1>
              Crack Your Next
              <span> Technical Interview</span>
            </h1>

            <p>
              Experience ultra-realistic AI-powered mock interviews with
              intelligent feedback, voice interaction, and adaptive questioning.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <h2>10K+</h2>
                <span>Interviews Conducted</span>
              </div>

              <div className="stat-card">
                <h2>95%</h2>
                <span>Success Improvement</span>
              </div>

              <div className="stat-card">
                <h2>AI</h2>
                <span>Real-time Evaluation</span>
              </div>

              <div className="stat-card">
                <h2>24/7</h2>
                <span>Interview Practice</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="setup-panel">
          <div className="setup-card">
            <div className="setup-header">
              <h2>Start Mock Interview</h2>
              <p>Configure your personalized AI interview session</p>
            </div>

            {/* Active Interviews Notice */}
            {checkingActive && (
              <div className="notice-banner notice-info">
                <div className="notice-icon">
                  <svg
                    className="animate-spin"
                    style={{ width: "1.1rem", height: "1.1rem" }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p>Checking for active interviews…</p>
              </div>
            )}

            {!checkingActive && totalResumable > 0 && (
              <div className="notice-banner notice-warning">
                <div className="notice-icon">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">
                    You have {totalResumable} interview
                    {totalResumable !== 1 ? "s" : ""} in progress
                  </p>
                  <p className="text-sm">
                    Click Start to resume one or begin a new interview.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="setup-form">
              <div className="form-group">
                <label htmlFor="role">Target Role *</label>
                <input
                  id="role"
                  type="text"
                  name="role"
                  placeholder="e.g., MERN Stack Developer"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? "error" : ""}
                  disabled={loading}
                  maxLength={100}
                  autoComplete="off"
                />
                {errors.role && (
                  <span className="error-message">{errors.role}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experienceLevel">Experience Level *</label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="fresher">Fresher (0-1 years)</option>
                    <option value="junior">Junior (1-3 years)</option>
                    <option value="mid">Mid-Level (3-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="interviewType">Interview Type</label>
                  <select
                    id="interviewType"
                    name="interviewType"
                    value={formData.interviewType}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="mixed">
                      Mixed (Technical + Behavioral)
                    </option>
                    <option value="technical">Technical Only</option>
                    <option value="behavioral">Behavioral Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="techStack">Tech Stack *</label>
                <textarea
                  id="techStack"
                  name="techStack"
                  placeholder="React, Node.js, MongoDB, Express"
                  value={formData.techStack}
                  onChange={handleChange}
                  rows="3"
                  className={errors.techStack ? "error" : ""}
                  disabled={loading}
                />
                {errors.techStack && (
                  <span className="error-message">{errors.techStack}</span>
                )}
                <span className="helper-text">
                  Separate multiple technologies with commas
                </span>
              </div>

              <button
                type="button"
                className={`start-btn ${loading ? "loading" : ""}`}
                onClick={handleStartInterview}
                disabled={loading || checkingActive}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      style={{
                        width: "1rem",
                        height: "1rem",
                        marginRight: "0.55rem",
                        marginLeft: "-0.25rem",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Starting Interview…
                  </>
                ) : (
                  startButtonLabel
                )}
              </button>

              {/* ── View Past Interviews ─────────────────────────── */}
              <button
                type="button"
                className="view-history-btn"
                onClick={() => navigate("/interviews")}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                  <polyline points="12 7 12 12 15 15" />
                </svg>
                View My Past Interviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          RESUME OR NEW INTERVIEW MODAL
      ============================================================ */}
      {showResumeModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3>{modalTitle}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseModal}
                disabled={loading}
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Choose to resume an existing interview or start a new one.
              </p>

              {activeInterviews.resumableSessions.length > 0 && (
                <div className="section">
                  <h4 className="section-title">In Progress</h4>
                  <div className="sessions-list">
                    {activeInterviews.resumableSessions.map((session) => (
                      <div key={session._id} className="session-card">
                        <div className="session-info">
                          <h5 className="session-role">{session.role}</h5>
                          <p className="session-meta">
                            {session.experienceLevel} • {session.interviewType}
                          </p>
                          <div className="session-progress">
                            <span className="progress-badge">
                              Question {session.currentQuestionIndex + 1} of{" "}
                              {session.totalQuestions}
                            </span>
                            <span className="time-ago">
                              {formatLastActivity(session.lastActivityAt)}
                            </span>
                          </div>
                        </div>
                        <div className="session-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleResumeInterview(session._id)}
                            disabled={loading}
                          >
                            Resume
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAbandonInterview(session._id)}
                            disabled={loading}
                          >
                            Abandon
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeInterviews.abandonedSessions.length > 0 && (
                <div className="section">
                  <h4 className="section-title">Previously Abandoned</h4>
                  <div className="sessions-list">
                    {activeInterviews.abandonedSessions.map((session) => (
                      <div key={session._id} className="session-card abandoned">
                        <div className="session-info">
                          <h5 className="session-role">{session.role}</h5>
                          <p className="session-meta">
                            {session.experienceLevel} • {session.interviewType}
                          </p>
                          <div className="session-progress">
                            <span className="progress-badge warning">
                              Question {session.currentQuestionIndex + 1} of{" "}
                              {session.totalQuestions}
                            </span>
                            <span className="time-ago">
                              Abandoned{" "}
                              {formatLastActivity(session.lastActivityAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleResumeInterview(session._id)}
                          disabled={loading}
                        >
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeInterviews.canStartNew && (
                <div className="section">
                  <button
                    type="button"
                    className="btn btn-block btn-start-new"
                    onClick={handleStartNewInterview}
                    disabled={loading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Start New Interview
                  </button>
                  <p className="helper-text text-center">
                    You can have up to{" "}
                    {activeInterviews.maxConcurrentInterviews} active interviews
                  </p>
                </div>
              )}

              {!activeInterviews.canStartNew && (
                <div className="notice-banner notice-error">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>
                    You've reached the maximum number of active interviews (
                    {activeInterviews.maxConcurrentInterviews}). Please complete
                    or abandon an existing interview to start a new one.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MockInterviewSetup;