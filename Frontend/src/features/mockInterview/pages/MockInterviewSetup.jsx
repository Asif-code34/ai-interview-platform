import React, { useState, useEffect } from "react";
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
  const [checkingActive, setCheckingActive] = useState(false);
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

  // Check for active interviews on component mount
  useEffect(() => {
    checkActiveInterviews();
  }, []);

  // ============================================================
  // CHECK ACTIVE INTERVIEWS
  // ============================================================

  const checkActiveInterviews = async () => {
    try {
      setCheckingActive(true);
      const response = await getActiveInterviewsApi();

      if (response.success) {
        setActiveInterviews(response.data);
      }
    } catch (error) {
      console.error("Error checking active interviews:", error);
      // Don't block user if API fails
    } finally {
      setCheckingActive(false);
    }
  };

  // ============================================================
  // FORM HANDLING
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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

    // If user has active interviews, show resume modal
    if (activeInterviews.canResume) {
      setShowResumeModal(true);
      return;
    }

    // Otherwise, start fresh interview
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

      if (response.code === "ACTIVE_INTERVIEWS_EXIST") {
        // User has active sessions, show resume modal
        setShowResumeModal(true);
        setActiveInterviews((prev) => ({
          ...prev,
          canStartNew: response.canStartNew,
        }));
      } else {
        // New interview started successfully
        const sessionId = response.interviewSession._id;
        navigate(`/interview/live/${sessionId}`);
      }
    } catch (error) {
      console.error("Error starting interview:", error);

      if (error?.response?.data?.code === "MAX_INTERVIEWS_REACHED") {
        alert(
          `You can have maximum ${activeInterviews.maxConcurrentInterviews} active interviews. Please complete or abandon an existing interview.`,
        );
      } else {
        alert(error?.response?.data?.message || "Failed to start interview");
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
      alert("Failed to resume interview");
    } finally {
      setLoading(false);
      setShowResumeModal(false);
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
      await checkActiveInterviews();
      alert(
        "Interview abandoned successfully. You can resume it later or start a new one.",
      );
    } catch (error) {
      console.error("Error abandoning interview:", error);
      alert("Failed to abandon interview");
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (dateString) => {
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
            <div className="logo-badge">
              <span>AI</span>
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
                    className="animate-spin h-5 w-5"
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
                <p>Checking for active interviews...</p>
              </div>
            )}

            {!checkingActive && activeInterviews.activeInterviewsCount > 0 && (
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
                    You have {activeInterviews.activeInterviewsCount} active
                    interview(s)
                  </p>
                  <p className="text-sm">
                    You'll be able to resume or start a new one after clicking
                    Start
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
                className={`start-btn ${loading ? "loading" : ""}`}
                onClick={handleStartInterview}
                disabled={loading || checkingActive}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Starting Interview...
                  </>
                ) : (
                  "Start AI Interview"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          RESUME OR NEW INTERVIEW MODAL
      ============================================================ */}
      {showResumeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
                <h3>You Have Active Interviews</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowResumeModal(false)}
                disabled={loading}
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
                Choose to resume an existing interview or start a new one
              </p>

              {/* Resumable Sessions */}
              {activeInterviews.resumableSessions.length > 0 && (
                <div className="section">
                  <h4 className="section-title">Resume Interview</h4>
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
                            className="btn btn-primary btn-sm"
                            onClick={() => handleResumeInterview(session._id)}
                            disabled={loading}
                          >
                            Resume
                          </button>
                          <button
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

              {/* Abandoned Sessions */}
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

              {/* Start New Option */}
              {activeInterviews.canStartNew && (
                <div className="section">
                  <button
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
                className="btn btn-secondary btn-block"
                onClick={() => setShowResumeModal(false)}
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

// import React, { useMemo, useState } from "react";
// import "../style/mockInterviewSetup.scss";
// import { useNavigate } from "react-router";
// import { useMockInterview } from "../hooks/useMockInterview";

// const EXPERIENCE_LEVELS = [
//   { value: "fresher", label: "Fresher" },
//   { value: "junior", label: "Junior" },
//   { value: "mid", label: "Mid-Level" },
//   { value: "senior", label: "Senior" },
// ];

// const INTERVIEW_TYPES = [
//   { value: "technical", label: "Technical" },
//   { value: "behavioral", label: "Behavioral" },
//   { value: "mixed", label: "Mixed" },
// ];

// const QUESTION_OPTIONS = [3, 5, 7, 10, 15];

// const DURATION_OPTIONS = [15, 30, 45, 60, 90];

// const LANGUAGE_OPTIONS = [{ value: "en", label: "English" }];

// const MAX_ROLE_LENGTH = 100;
// const MAX_TECH_STACK_ITEMS = 20;
// const MAX_TECH_STACK_ITEM_LENGTH = 50;
// const MAX_FOCUS_AREA_ITEMS = 10;
// const MAX_FOCUS_AREA_LENGTH = 100;

// const MockInterviewSetup = () => {
//   const navigate = useNavigate();
//   const { startInterviewApi } = useMockInterview();

//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     role: "",
//     experienceLevel: "fresher",
//     interviewType: "technical",
//     techStack: "",
//     totalQuestions: 5,
//     durationMinutes: 30,
//     adaptiveDifficulty: true,
//     language: "en",
//     focusAreas: "",
//   });

//   const [errors, setErrors] = useState({});

//   const techStackPreview = useMemo(() => {
//     return formData.techStack
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean)
//       .slice(0, MAX_TECH_STACK_ITEMS);
//   }, [formData.techStack]);

//   const focusAreasPreview = useMemo(() => {
//     return formData.focusAreas
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean)
//       .slice(0, MAX_FOCUS_AREA_ITEMS);
//   }, [formData.focusAreas]);

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     if (errors[name]) {
//       setErrors((previous) => ({
//         ...previous,
//         [name]: "",
//       }));
//     }
//   };

//   const handleAdaptiveDifficultyChange = (event) => {
//     setFormData((previous) => ({
//       ...previous,
//       adaptiveDifficulty: event.target.checked,
//     }));
//   };

//   const validateForm = () => {
//     const nextErrors = {};

//     const role = formData.role.trim();

//     if (!role) {
//       nextErrors.role = "Please enter your target role.";
//     } else if (role.length < 2) {
//       nextErrors.role = "Role must contain at least 2 characters.";
//     } else if (role.length > MAX_ROLE_LENGTH) {
//       nextErrors.role = `Role cannot exceed ${MAX_ROLE_LENGTH} characters.`;
//     }

//     const techStack = techStackPreview;

//     if (techStack.length === 0) {
//       nextErrors.techStack =
//         "Please enter at least one technology for the interview.";
//     } else if (techStack.length > MAX_TECH_STACK_ITEMS) {
//       nextErrors.techStack = `You can add up to ${MAX_TECH_STACK_ITEMS} technologies.`;
//     } else if (
//       techStack.some(
//         (technology) => technology.length > MAX_TECH_STACK_ITEM_LENGTH,
//       )
//     ) {
//       nextErrors.techStack = `Each technology must be ${MAX_TECH_STACK_ITEM_LENGTH} characters or less.`;
//     }

//     if (
//       !EXPERIENCE_LEVELS.some(
//         (level) => level.value === formData.experienceLevel,
//       )
//     ) {
//       nextErrors.experienceLevel = "Please select a valid experience level.";
//     }

//     if (
//       !INTERVIEW_TYPES.some((type) => type.value === formData.interviewType)
//     ) {
//       nextErrors.interviewType = "Please select a valid interview type.";
//     }

//     const totalQuestions = Number(formData.totalQuestions);

//     if (
//       !Number.isInteger(totalQuestions) ||
//       totalQuestions < 1 ||
//       totalQuestions > 30
//     ) {
//       nextErrors.totalQuestions =
//         "Number of questions must be between 1 and 30.";
//     }

//     const durationMinutes = Number(formData.durationMinutes);

//     if (
//       !Number.isInteger(durationMinutes) ||
//       durationMinutes < 1 ||
//       durationMinutes > 180
//     ) {
//       nextErrors.durationMinutes =
//         "Interview duration must be between 1 and 180 minutes.";
//     }

//     if (
//       !LANGUAGE_OPTIONS.some((language) => language.value === formData.language)
//     ) {
//       nextErrors.language = "Please select a valid interview language.";
//     }

//     if (focusAreasPreview.length > MAX_FOCUS_AREA_ITEMS) {
//       nextErrors.focusAreas = `You can add up to ${MAX_FOCUS_AREA_ITEMS} focus areas.`;
//     }

//     if (focusAreasPreview.some((area) => area.length > MAX_FOCUS_AREA_LENGTH)) {
//       nextErrors.focusAreas = `Each focus area must be ${MAX_FOCUS_AREA_LENGTH} characters or less.`;
//     }

//     setErrors(nextErrors);

//     return Object.keys(nextErrors).length === 0;
//   };

//   const handleStartInterview = async (event) => {
//     event.preventDefault();

//     if (loading) {
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setLoading(true);

//       const techStack = techStackPreview;

//       const focusAreas = focusAreasPreview;

//       const payload = {
//         role: formData.role.trim(),

//         experienceLevel: formData.experienceLevel,

//         techStack,

//         interviewType: formData.interviewType,

//         interviewConfig: {
//           totalQuestions: Number(formData.totalQuestions),

//           durationMinutes: Number(formData.durationMinutes),

//           adaptiveDifficulty: Boolean(formData.adaptiveDifficulty),

//           language: formData.language,

//           focusAreas,
//         },
//       };

//       const data = await startInterviewApi(payload);

//       const sessionId =
//         data?.interviewSession?._id ||
//         data?.session?._id ||
//         data?.interviewSession?.id ||
//         data?.session?.id;

//       if (!sessionId) {
//         throw new Error(
//           "Interview started, but the server did not return a valid session ID.",
//         );
//       }

//       navigate(`/interview/live/${sessionId}`);
//     } catch (error) {
//       console.error("Failed to start mock interview:", error);

//       const message =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error?.message ||
//         "Failed to start interview. Please try again.";

//       setErrors({
//         submit: message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="mock-interview-page">
//       {/* =========================================
//           LEFT BRANDING PANEL
//       ========================================== */}
//       <section
//         className="branding-panel"
//         aria-label="Mock interview information"
//       >
//         <div className="gradient-orb orb-1" aria-hidden="true" />
//         <div className="gradient-orb orb-2" aria-hidden="true" />

//         <div className="branding-content">
//           <div className="logo-badge" aria-hidden="true">
//             <span>AI</span>
//           </div>

//           <div className="branding-copy">
//             <span className="eyebrow">AI MOCK INTERVIEW</span>

//             <h1>
//               Crack Your Next
//               <span> Technical Interview</span>
//             </h1>

//             <p>
//               Practice with realistic AI-powered interviews, adaptive
//               questioning, voice answers, and detailed performance feedback.
//             </p>
//           </div>

//           <div className="stats-grid">
//             <div className="stat-card">
//               <strong>10K+</strong>
//               <span>Practice Sessions</span>
//             </div>

//             <div className="stat-card">
//               <strong>AI</strong>
//               <span>Adaptive Evaluation</span>
//             </div>

//             <div className="stat-card">
//               <strong>24/7</strong>
//               <span>Interview Practice</span>
//             </div>

//             <div className="stat-card">
//               <strong>360°</strong>
//               <span>Performance Feedback</span>
//             </div>
//           </div>

//           <div className="feature-list">
//             <div className="feature-item">
//               <span className="feature-icon">✓</span>
//               <div>
//                 <strong>Realistic questions</strong>
//                 <span>Questions tailored to your role and experience.</span>
//               </div>
//             </div>

//             <div className="feature-item">
//               <span className="feature-icon">✓</span>
//               <div>
//                 <strong>Adaptive difficulty</strong>
//                 <span>
//                   Question difficulty can change based on your performance.
//                 </span>
//               </div>
//             </div>

//             <div className="feature-item">
//               <span className="feature-icon">✓</span>
//               <div>
//                 <strong>Detailed evaluation</strong>
//                 <span>
//                   Get technical, communication, clarity and confidence scores.
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =========================================
//           SETUP PANEL
//       ========================================== */}
//       <section className="setup-panel">
//         <div className="setup-card">
//           <div className="setup-header">
//             <div>
//               <span className="section-label">INTERVIEW SETUP</span>

//               <h2>Start Mock Interview</h2>

//               <p>Configure your interview before entering the live session.</p>
//             </div>

//             <div className="setup-status">
//               <span className="status-dot" />
//               AI Ready
//             </div>
//           </div>

//           <form onSubmit={handleStartInterview} noValidate>
//             {/* TARGET ROLE */}
//             <div className="form-group">
//               <label htmlFor="role">
//                 Target Role
//                 <span className="required">*</span>
//               </label>

//               <input
//                 id="role"
//                 type="text"
//                 name="role"
//                 placeholder="e.g. MERN Stack Developer"
//                 value={formData.role}
//                 onChange={handleChange}
//                 maxLength={MAX_ROLE_LENGTH}
//                 autoComplete="organization-title"
//                 disabled={loading}
//                 aria-invalid={Boolean(errors.role)}
//                 aria-describedby={errors.role ? "role-error" : undefined}
//               />

//               {errors.role && (
//                 <span id="role-error" className="field-error">
//                   {errors.role}
//                 </span>
//               )}
//             </div>

//             {/* EXPERIENCE + INTERVIEW TYPE */}
//             <div className="form-row">
//               <div className="form-group">
//                 <label htmlFor="experienceLevel">
//                   Experience Level
//                   <span className="required">*</span>
//                 </label>

//                 <select
//                   id="experienceLevel"
//                   name="experienceLevel"
//                   value={formData.experienceLevel}
//                   onChange={handleChange}
//                   disabled={loading}
//                   aria-invalid={Boolean(errors.experienceLevel)}
//                 >
//                   {EXPERIENCE_LEVELS.map((level) => (
//                     <option key={level.value} value={level.value}>
//                       {level.label}
//                     </option>
//                   ))}
//                 </select>

//                 {errors.experienceLevel && (
//                   <span className="field-error">{errors.experienceLevel}</span>
//                 )}
//               </div>

//               <div className="form-group">
//                 <label htmlFor="interviewType">
//                   Interview Type
//                   <span className="required">*</span>
//                 </label>

//                 <select
//                   id="interviewType"
//                   name="interviewType"
//                   value={formData.interviewType}
//                   onChange={handleChange}
//                   disabled={loading}
//                   aria-invalid={Boolean(errors.interviewType)}
//                 >
//                   {INTERVIEW_TYPES.map((type) => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>

//                 {errors.interviewType && (
//                   <span className="field-error">{errors.interviewType}</span>
//                 )}
//               </div>
//             </div>

//             {/* TECH STACK */}
//             <div className="form-group">
//               <label htmlFor="techStack">
//                 Tech Stack
//                 <span className="required">*</span>
//               </label>

//               <textarea
//                 id="techStack"
//                 name="techStack"
//                 placeholder="React, Node.js, MongoDB, Express"
//                 value={formData.techStack}
//                 onChange={handleChange}
//                 rows={3}
//                 disabled={loading}
//                 aria-invalid={Boolean(errors.techStack)}
//                 aria-describedby="tech-stack-help"
//               />

//               <div id="tech-stack-help" className="field-help">
//                 Separate technologies with commas. Example: React, Node.js,
//                 MongoDB
//               </div>

//               {techStackPreview.length > 0 && (
//                 <div className="tag-list" aria-label="Selected technologies">
//                   {techStackPreview.map((technology) => (
//                     <span className="tag" key={technology}>
//                       {technology}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               {errors.techStack && (
//                 <span className="field-error">{errors.techStack}</span>
//               )}
//             </div>

//             {/* QUESTIONS + DURATION */}
//             <div className="form-row">
//               <div className="form-group">
//                 <label htmlFor="totalQuestions">Number of Questions</label>

//                 <select
//                   id="totalQuestions"
//                   name="totalQuestions"
//                   value={formData.totalQuestions}
//                   onChange={handleChange}
//                   disabled={loading}
//                   aria-invalid={Boolean(errors.totalQuestions)}
//                 >
//                   {QUESTION_OPTIONS.map((number) => (
//                     <option key={number} value={number}>
//                       {number} questions
//                     </option>
//                   ))}
//                 </select>

//                 {errors.totalQuestions && (
//                   <span className="field-error">{errors.totalQuestions}</span>
//                 )}
//               </div>

//               <div className="form-group">
//                 <label htmlFor="durationMinutes">Interview Duration</label>

//                 <select
//                   id="durationMinutes"
//                   name="durationMinutes"
//                   value={formData.durationMinutes}
//                   onChange={handleChange}
//                   disabled={loading}
//                   aria-invalid={Boolean(errors.durationMinutes)}
//                 >
//                   {DURATION_OPTIONS.map((duration) => (
//                     <option key={duration} value={duration}>
//                       {duration} minutes
//                     </option>
//                   ))}
//                 </select>

//                 {errors.durationMinutes && (
//                   <span className="field-error">{errors.durationMinutes}</span>
//                 )}
//               </div>
//             </div>

//             {/* LANGUAGE */}
//             <div className="form-group">
//               <label htmlFor="language">Interview Language</label>

//               <select
//                 id="language"
//                 name="language"
//                 value={formData.language}
//                 onChange={handleChange}
//                 disabled={loading}
//                 aria-invalid={Boolean(errors.language)}
//               >
//                 {LANGUAGE_OPTIONS.map((language) => (
//                   <option key={language.value} value={language.value}>
//                     {language.label}
//                   </option>
//                 ))}
//               </select>

//               {errors.language && (
//                 <span className="field-error">{errors.language}</span>
//               )}
//             </div>

//             {/* FOCUS AREAS */}
//             <div className="form-group">
//               <label htmlFor="focusAreas">
//                 Focus Areas
//                 <span className="optional-label">Optional</span>
//               </label>

//               <textarea
//                 id="focusAreas"
//                 name="focusAreas"
//                 placeholder="JWT Authentication, MongoDB Indexing, React Performance"
//                 value={formData.focusAreas}
//                 onChange={handleChange}
//                 rows={2}
//                 disabled={loading}
//                 aria-invalid={Boolean(errors.focusAreas)}
//               />

//               <div className="field-help">
//                 Add specific topics you want the interview to emphasize.
//               </div>

//               {focusAreasPreview.length > 0 && (
//                 <div className="tag-list" aria-label="Selected focus areas">
//                   {focusAreasPreview.map((area) => (
//                     <span className="tag tag-secondary" key={area}>
//                       {area}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               {errors.focusAreas && (
//                 <span className="field-error">{errors.focusAreas}</span>
//               )}
//             </div>

//             {/* ADAPTIVE DIFFICULTY */}
//             <label className={`adaptive-option ${loading ? "disabled" : ""}`}>
//               <input
//                 type="checkbox"
//                 checked={formData.adaptiveDifficulty}
//                 onChange={handleAdaptiveDifficultyChange}
//                 disabled={loading}
//               />

//               <span className="custom-checkbox" aria-hidden="true">
//                 ✓
//               </span>

//               <span className="adaptive-content">
//                 <strong>Enable adaptive difficulty</strong>
//                 <small>
//                   AI adjusts future question difficulty based on your
//                   performance.
//                 </small>
//               </span>
//             </label>

//             {/* SERVER ERROR */}
//             {errors.submit && (
//               <div className="submit-error" role="alert">
//                 <span aria-hidden="true">!</span>
//                 <p>{errors.submit}</p>
//               </div>
//             )}

//             {/* START BUTTON */}
//             <button
//               type="submit"
//               className={`start-btn ${loading ? "loading" : ""}`}
//               disabled={loading}
//               aria-busy={loading}
//             >
//               {loading ? (
//                 <>
//                   <span className="button-spinner" aria-hidden="true" />
//                   Initializing AI Interview...
//                 </>
//               ) : (
//                 <>
//                   Start AI Interview
//                   <span className="button-arrow" aria-hidden="true">
//                     →
//                   </span>
//                 </>
//               )}
//             </button>

//             <p className="privacy-note">
//               Your interview answers are processed to generate your personalized
//               evaluation and feedback.
//             </p>
//           </form>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default MockInterviewSetup;

//top vala correct he
