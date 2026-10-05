const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
} = require("../controllers/interview.controller");
const interviewRouter = express.Router();

interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  generateInterViewReportController,
);

interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  getInterviewReportByIdController,
);

interviewRouter.get(
  "/",
  authMiddleware.authUser,
  getAllInterviewReportsController,
);
/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  generateResumePdfController,
);
module.exports = interviewRouter;
