import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import StartInterview from "./features/mockInterview/pages/MockInterviewSetup";
import LiveInterview from "./features/mockInterview/pages/LiveInterview";
import InterviewResult from "./features/mockInterview/pages/InterviewResult";

// import Interview from "./features/interview/pages/Interview";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },
  // =========================
  // MOCK INTERVIEW ROUTES
  // =========================

  // Start Interview Form
  {
    path: "/start-interview",
    element: (
      <Protected>
        <StartInterview />
      </Protected>
    ),
  },

  // Live Voice Interview
  {
    path: "/interview/live/:sessionId",
    element: (
      <Protected>
        <LiveInterview />
      </Protected>
    ),
  },

  // Final Result Page
  {
    path: "/interview/result/:sessionId",
    element: (
      <Protected>
        <InterviewResult />
      </Protected>
    ),
  },
]);
