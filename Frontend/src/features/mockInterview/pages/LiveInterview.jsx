//uppr vala perplexity se phle vala he

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import "../style/liveInterview.scss";
import {
  getInterviewSessionApi,
  submitAnswerApi,
  resumeInterviewApi,
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

  /* ----------------------------- REFS ----------------------------- */

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  /* ---------------------------------------------------------------- */
  /*                         HELPER FUNCTIONS                         */
  /* ---------------------------------------------------------------- */

  const stopMicrophoneStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.error("Failed to stop microphone track:", error);
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

  const getErrorMessage = useCallback((error, fallbackMessage) => {
    return error?.response?.data?.message || error?.message || fallbackMessage;
  }, []);

  /* ---------------------------------------------------------------- */
  /*                         LOAD INTERVIEW                           */
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

      // Check if interview is completed
      if (interviewSession.status === "completed") {
        navigate(`/interview/result/${sessionId}`, {
          replace: true,
        });
        return;
      }

      // Check if interview is abandoned
      if (interviewSession.status === "abandoned") {
        setIsAbandoned(true);
        // Allow user to see the session but show warning
      }

      const questionIndex = Number(interviewSession.currentQuestionIndex) || 0;
      const question = interviewSession.questions?.[questionIndex];

      if (!question) {
        throw new Error("Unable to find the current interview question.");
      }

      if (isMountedRef.current) {
        setSession(interviewSession);
        setCurrentQuestion(question);
        setIsAbandoned(response?.isAbandoned || false);
      }
    } catch (error) {
      console.error("LOAD INTERVIEW ERROR:", error);

      if (isMountedRef.current) {
        setError(
          getErrorMessage(
            error,
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
  /*                         RESUME ABANDONED INTERVIEW               */
  /* ---------------------------------------------------------------- */

  const handleResumeInterview = async () => {
    try {
      setLoading(true);
      setError("");

      await resumeInterviewApi(sessionId);

      // Reload the session (now it should be in-progress)
      await loadInterviewSession();
    } catch (error) {
      console.error("RESUME INTERVIEW ERROR:", error);
      setError(
        getErrorMessage(error, "Failed to resume interview. Please try again."),
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  /* ---------------------------------------------------------------- */
  /*                         TEXT TO SPEECH                           */
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
    } catch (error) {
      console.error("TEXT TO SPEECH ERROR:", error);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Auto‑speak when question changes
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
  /*                         RECORDING TIMER                          */
  /* ---------------------------------------------------------------- */

  const startRecordingTimer = useCallback(() => {
    clearRecordingTimer();
    recordingStartTimeRef.current = Date.now();
    setAnswerDuration(0);

    recordingTimerRef.current = setInterval(() => {
      if (!recordingStartTimeRef.current) {
        return;
      }

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
  /*                         START RECORDING                          */
  /* ---------------------------------------------------------------- */

  const startRecording = useCallback(async () => {
    if (loading || submitting || recording) {
      return;
    }

    if (!currentQuestion) {
      setError("No interview question is currently available.");
      return;
    }

    try {
      setError("");
      setFeedback(null);
      stopSpeaking(); // stop any ongoing speech

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
    } catch (error) {
      console.error("START RECORDING ERROR:", error);

      stopMicrophoneStream();
      clearRecordingTimer();

      if (isMountedRef.current) {
        setRecording(false);
        setError(
          getErrorMessage(
            error,
            "Unable to access your microphone. Please allow microphone permission and try again.",
          ),
        );
      }
    }
  }, [
    loading,
    submitting,
    recording,
    currentQuestion,
    stopMicrophoneStream,
    clearRecordingTimer,
    startRecordingTimer,
    getErrorMessage,
    stopSpeaking,
  ]);

  /* ---------------------------------------------------------------- */
  /*                         STOP RECORDING                           */
  /* ---------------------------------------------------------------- */

  const stopRecording = useCallback(() => {
    if (submitting) {
      return;
    }

    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return;
    }

    clearRecordingTimer();
    recorder.stop();
    setRecording(false);
    stopMicrophoneStream();
  }, [submitting, clearRecordingTimer, stopMicrophoneStream]);

  /* ---------------------------------------------------------------- */
  /*                         SUBMIT ANSWER                            */
  /* ---------------------------------------------------------------- */

  const submitRecordedAnswer = useCallback(async () => {
    if (submitting) {
      return;
    }

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

    try {
      setSubmitting(true);
      setError("");
      setFeedback(null);

      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mimeType,
      });

      if (!audioBlob.size) {
        throw new Error("The recorded audio is empty.");
      }

      const response = await submitAnswerApi(
        sessionId,
        audioBlob,
        finalDuration,
      );

      if (!isMountedRef.current) {
        return;
      }

      if (!response) {
        throw new Error("Invalid response from interview server.");
      }

      if (response.completed) {
        navigate(`/interview/result/${sessionId}`, {
          replace: true,
        });

        return;
      }

      if (!response.nextQuestion?.question) {
        throw new Error("The next interview question was not received.");
      }

      setFeedback(response.feedback || null);
      setCurrentQuestion(response.nextQuestion);
      setSession((previousSession) => {
        if (!previousSession) {
          return previousSession;
        }

        return {
          ...previousSession,
          currentQuestionIndex: (previousSession.currentQuestionIndex || 0) + 1,
        };
      });

      audioChunksRef.current = [];
      recordingStartTimeRef.current = null;
      setAnswerDuration(0);
    } catch (error) {
      console.error("SUBMIT ANSWER ERROR:", error);

      if (isMountedRef.current) {
        setError(
          getErrorMessage(
            error,
            "We could not process your answer. Please try again.",
          ),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  }, [
    submitting,
    sessionId,
    currentQuestion,
    answerDuration,
    navigate,
    getErrorMessage,
  ]);

  /* ---------------------------------------------------------------- */
  /*                AUTOMATIC SUBMISSION AFTER STOP                   */
  /* ---------------------------------------------------------------- */

  const previousRecordingRef = useRef(false);

  useEffect(() => {
    const wasRecording = previousRecordingRef.current;

    if (wasRecording && !recording) {
      const timer = setTimeout(() => {
        if (!submitting && audioChunksRef.current.length > 0) {
          submitRecordedAnswer();
        }
      }, 0);

      return () => clearTimeout(timer);
    }

    previousRecordingRef.current = recording;

    return undefined;
  }, [recording, submitting, submitRecordedAnswer]);

  /* ---------------------------------------------------------------- */
  /*                         PAGE CLEANUP                             */
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
        } catch (error) {
          console.error("RECORDER CLEANUP ERROR:", error);
        }
      }

      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
    };
  }, [clearRecordingTimer, stopMicrophoneStream]);

  /* ---------------------------------------------------------------- */
  /*                         FORMAT TIME                              */
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
  /*                             LOADING                              */
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
  /*                              ERROR                               */
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
  /*                         ABANDONED INTERVIEW WARNING              */
  /* ---------------------------------------------------------------- */

  if (isAbandoned && session) {
    return (
      <div className="live-interview-page">
        <div className="abandoned-container">
          <div className="abandoned-icon">⏸️</div>
          <h2>Interview Was Abandoned</h2>
          <p>This interview session was previously abandoned.</p>
          <p className="abandoned-details">
            Role: <strong>{session.role}</strong> | Question:{""}
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
  /*                              MAIN UI                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="live-interview-page">
      {/* Background Orbs */}
      <div className="gradient-orb gradient-orb--1" />
      <div className="gradient-orb gradient-orb--2" />

      <div className="live-container">
        {/* ========== LEFT PANEL ========== */}
        <div className="live-left">
          {/* Brand */}
          <div className="live-brand">
            <h1>AI Interview Copilot</h1>
            <p>
              Real-time AI powered mock interviews with adaptive questioning &
              feedback.
            </p>
          </div>

          {/* Modern AI Panel */}
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
                          : "Ready for interview"}
                  </p>
                </div>
              </div>
              <div className="ai-live-status">
                <span></span>
                ACTIVE
              </div>
            </div>

            {/* Voice Visualizer */}
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

            {/* Status Text */}
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
                  AI interviewer ready
                </>
              )}
            </div>

            {/* Quick Actions */}
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

          {/* Stats */}
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
          {/* Question Card */}
          <div className="question-card">
            {/* AI Interviewer Panel (mini) */}
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

          {/* Record Section */}
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
              <button onClick={stopRecording} className="stop-btn">
                ⏹ Stop Recording
              </button>
            )}
            {submitting && (
              <p className="processing-text">AI is analyzing your answer...</p>
            )}
          </div>

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
