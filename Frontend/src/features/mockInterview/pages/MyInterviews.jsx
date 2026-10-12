import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../style/myInterviews.scss";
import { useNavigate } from "react-router";
import { useMockInterview } from "../hooks/useMockInterview";

const PAGE_SIZE = 10;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "in-progress", label: "In Progress" },
  { key: "abandoned", label: "Abandoned" },
];

const MyInterviews = () => {
  const navigate = useNavigate();
  const { getAllInterviewSessionsApi } = useMockInterview();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =========================================
  // LOAD SESSIONS
  // =========================================

  const loadSessions = useCallback(
    async (targetPage = 1) => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllInterviewSessionsApi(
          targetPage,
          PAGE_SIZE,
        );

        const data = response?.data;

        if (!data || !Array.isArray(data.sessions)) {
          throw new Error("Invalid response from server.");
        }

        setSessions(data.sessions);
        setPagination(
          data.pagination || {
            page: targetPage,
            limit: PAGE_SIZE,
            total: data.sessions.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        );
      } catch (err) {
        console.error("MY INTERVIEWS ERROR:", err);
        setError(
          err?.userMessage ||
            err?.message ||
            "Unable to load your interviews.",
        );
      } finally {
        setLoading(false);
      }
    },
    [getAllInterviewSessionsApi],
  );

  useEffect(() => {
    loadSessions(page);
  }, [page, loadSessions]);

  // =========================================
  // FILTERED + COUNTED
  // =========================================

  const counts = useMemo(() => {
    return {
      all: sessions.length,
      completed: sessions.filter((s) => s.status === "completed").length,
      "in-progress": sessions.filter(
        (s) => s.status === "in-progress" || s.status === "processing",
      ).length,
      abandoned: sessions.filter((s) => s.status === "abandoned").length,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (filter === "all") return sessions;
    if (filter === "completed") {
      return sessions.filter((s) => s.status === "completed");
    }
    if (filter === "in-progress") {
      return sessions.filter(
        (s) => s.status === "in-progress" || s.status === "processing",
      );
    }
    if (filter === "abandoned") {
      return sessions.filter((s) => s.status === "abandoned");
    }
    return sessions;
  }, [sessions, filter]);

  // =========================================
  // ACTIONS
  // =========================================

  const handleOpenSession = (session) => {
    if (!session?._id) return;

    if (session.status === "completed") {
      navigate(`/interview/result/${session._id}`);
      return;
    }

    // in-progress, processing, abandoned → live page handles all three
    navigate(`/interview/live/${session._id}`);
  };

  const handleKeyDown = (event, session) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenSession(session);
    }
  };

  const handlePageChange = (next) => {
    if (next < 1 || next > pagination.totalPages || next === page) return;

    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================
  // HELPERS
  // =========================================

  const getScore = (value) => {
    const score = Number(value);
    if (!Number.isFinite(score)) return 0;
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "score--high";
    if (score >= 60) return "score--mid";
    return "score--low";
  };

  const getStatusInfo = (session) => {
    const status = session?.status;

    if (status === "completed") {
      return { key: "completed", label: "Completed" };
    }
    if (status === "processing") {
      return { key: "in-progress", label: "Processing" };
    }
    if (status === "in-progress") {
      return { key: "in-progress", label: "In Progress" };
    }
    if (status === "abandoned") {
      return { key: "abandoned", label: "Abandoned" };
    }
    return { key: "unknown", label: "Unknown" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActionLabel = (session) => {
    if (session?.status === "completed") return "View Report";
    if (session?.status === "abandoned") return "Resume";
    if (session?.status === "in-progress" || session?.status === "processing") {
      return "Continue";
    }
    return "Open";
  };

  // =========================================
  // RENDER: LOADING
  // =========================================

  if (loading && sessions.length === 0) {
    return (
      <div className="my-interviews-page">
        <div className="my-interviews-loading">
          <div className="loader-ring" />
          <h2>Loading your interviews…</h2>
          <p>Fetching your interview history.</p>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER: ERROR
  // =========================================

  if (error && sessions.length === 0) {
    return (
      <div className="my-interviews-page">
        <div className="my-interviews-loading">
          <h2>Unable to Load Interviews</h2>
          <p>{error}</p>

          <div className="my-interviews-error-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => loadSessions(page)}
            >
              Try Again
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/")}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER: MAIN
  // =========================================

  return (
    <div className="my-interviews-page">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="my-interviews-header">
        <div className="my-interviews-header__text">
          <p className="my-interviews-header__eyebrow">
            YOUR INTERVIEW HISTORY
          </p>
          <h1>My Mock Interviews</h1>
          <p>
            Track your progress, revisit past reports, and continue where you
            left off.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary my-interviews-header__cta"
          onClick={() => navigate("/start-interview")}
        >
          + Start New Interview
        </button>
      </header>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <nav className="my-interviews-filters" aria-label="Filter interviews">
        {FILTERS.map((tab) => {
          const count = counts[tab.key] ?? 0;
          const isActive = filter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              className={`filter-tab ${isActive ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(tab.key)}
              aria-pressed={isActive}
            >
              {tab.label}
              {count > 0 && (
                <span className="filter-tab__count">{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── List ─────────────────────────────────────────────── */}
      {filteredSessions.length === 0 ? (
        <div className="my-interviews-empty">
          {sessions.length === 0 ? (
            <>
              <div className="my-interviews-empty__icon">🎙️</div>
              <h2>No interviews yet</h2>
              <p>
                Start your first mock interview and get instant AI feedback on
                your performance.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/start-interview")}
              >
                Start My First Interview
              </button>
            </>
          ) : (
            <>
              <div className="my-interviews-empty__icon">🔍</div>
              <h2>No {FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} interviews</h2>
              <p>
                Try a different filter to see more of your interview history.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFilter("all")}
              >
                View All
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <ul className="my-interviews-list">
            {filteredSessions.map((session) => {
              const statusInfo = getStatusInfo(session);
              const score = getScore(session.overallScore);
              const isCompleted = session.status === "completed";
              const totalQuestions = Number(session.totalQuestions) || 0;
              const currentQuestion = Number(session.currentQuestionIndex) || 0;

              return (
                <li
                  key={session._id}
                  className="interview-card"
                  onClick={() => handleOpenSession(session)}
                  onKeyDown={(e) => handleKeyDown(e, session)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${session.role} — ${statusInfo.label}`}
                >
                  {/* TOP: role + status */}
                  <div className="interview-card__top">
                    <div className="interview-card__title">
                      <h3>{session.role || "Untitled Position"}</h3>
                      <p className="interview-card__meta">
                        <span className="meta-chip">
                          {session.experienceLevel || "—"}
                        </span>
                        <span className="meta-dot">·</span>
                        <span className="meta-chip">
                          {session.interviewType || "mixed"}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`status-badge status-badge--${statusInfo.key}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  {totalQuestions > 0 && (
                    <div className="interview-card__progress">
                      <div className="interview-card__progress-track">
                        <div
                          className="interview-card__progress-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              ((currentQuestion + (isCompleted ? 1 : 0)) /
                                totalQuestions) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="interview-card__progress-label">
                        {isCompleted
                          ? `${totalQuestions} / ${totalQuestions} questions`
                          : `Question ${Math.min(
                              currentQuestion + 1,
                              totalQuestions,
                            )} of ${totalQuestions}`}
                      </span>
                    </div>
                  )}

                  {/* BOTTOM: score + date + arrow */}
                  <div className="interview-card__bottom">
                    <div className="interview-card__bottom-left">
                      {isCompleted ? (
                        <span
                          className={`match-score ${getScoreClass(score)}`}
                        >
                          {score}%
                        </span>
                      ) : (
                        <span className="interview-card__action-label">
                          {getActionLabel(session)}
                        </span>
                      )}

                      <span className="interview-card__date">
                        {formatDate(
                          session.lastActivityAt ||
                            session.updatedAt ||
                            session.createdAt,
                        )}
                      </span>
                    </div>

                    <span className="interview-card__arrow" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Pagination ─────────────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <nav
              className="my-interviews-pagination"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                ← Prev
              </button>

              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default MyInterviews;