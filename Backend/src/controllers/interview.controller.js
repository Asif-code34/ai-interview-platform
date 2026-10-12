// const pdfParse = require("pdf-parse");

// const interviewReportModel = require("../models/interviewReport.model");
// const {
//   generateInterviewReport,
//   generateResumePdf,
// } = require("../services/ai.service");

// /**
//  * @description Controller to generate interview report based on user self description, resume and job description.
//  */
// // async function generateInterViewReportController(req, res) {
// //   //   const resumeContent = await new pdfParse.PDFParse(
// //   //     Uint8Array.from(req.file.buffer),
// //   //   ).getText();
// //   const resumeContent = await pdfParse(req.file.buffer);
// //   const { selfDescription, jobDescription } = req.body;

// //   const interViewReportByAi = await generateInterviewReport({
// //     resume: resumeContent.text,
// //     selfDescription,
// //     jobDescription,
// //   });

// //   const interviewReport = await interviewReportModel.create({
// //     user: req.user.id,
// //     resume: resumeContent.text,
// //     selfDescription,
// //     jobDescription,
// //     ...interViewReportByAi,
// //   });

// //   res.status(201).json({
// //     message: "Interview report generated successfully.",
// //     interviewReport,
// //   });
// // }
// async function generateInterViewReportController(req, res) {
//   try {
//     const { selfDescription, jobDescription } = req.body;

//     let resumeText = "";

//     // Resume is optional
//     if (req.file) {
//       const resumeContent = await pdfParse(req.file.buffer);
//       resumeText = resumeContent.text || "";
//     }

//     // At least resume OR self-description is required
//     if (!resumeText.trim() && !selfDescription?.trim()) {
//       return res.status(400).json({
//         message: "Please provide either a resume or self description.",
//       });
//     }

//     // Job description is required
//     if (!jobDescription?.trim()) {
//       return res.status(400).json({
//         message: "Job description is required.",
//       });
//     }

//     const interViewReportByAi = await generateInterviewReport({
//       resume: resumeText,
//       selfDescription: selfDescription || "",
//       jobDescription,
//     });

//     const interviewReport = await interviewReportModel.create({
//       user: req.user.id,
//       resume: resumeText,
//       selfDescription: selfDescription || "",
//       jobDescription,
//       ...interViewReportByAi,
//     });

//     return res.status(201).json({
//       message: "Interview report generated successfully.",
//       interviewReport,
//     });
//   } catch (error) {
//     console.error("Generate interview report error:", error);

//     return res.status(500).json({
//       message: "Failed to generate interview report.",
//       error: error.message,
//     });
//   }
// }

// async function getInterviewReportByIdController(req, res) {
//   const { interviewId } = req.params;

//   const interviewReport = await interviewReportModel.findOne({
//     _id: interviewId,
//     user: req.user.id,
//   });

//   if (!interviewReport) {
//     return res.status(404).json({
//       message: "Interview report not found.",
//     });
//   }

//   res.status(200).json({
//     message: "Interview report fetched successfully.",
//     interviewReport,
//   });
// }
// async function getAllInterviewReportsController(req, res) {
//   const interviewReports = await interviewReportModel
//     .find({ user: req.user.id })
//     .sort({ createdAt: -1 })
//     .select(
//       "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
//     );

//   res.status(200).json({
//     message: "Interview reports fetched successfully.",
//     interviewReports,
//   });
// }

// /**
//  * @description Controller to generate resume PDF based on user self description, resume and job description.
//  */
// async function generateResumePdfController(req, res) {
//   const { interviewReportId } = req.params;

//   const interviewReport =
//     await interviewReportModel.findById(interviewReportId);

//   if (!interviewReport) {
//     return res.status(404).json({
//       message: "Interview report not found.",
//     });
//   }

//   const { resume, jobDescription, selfDescription } = interviewReport;

//   const pdfBuffer = await generateResumePdf({
//     resume,
//     jobDescription,
//     selfDescription,
//   });

//   res.set({
//     "Content-Type": "application/pdf",
//     "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
//   });

//   res.send(pdfBuffer);
// }

// module.exports = {
//   generateInterViewReportController,
//   getInterviewReportByIdController,
//   getAllInterviewReportsController,
//   generateResumePdfController,
// };


const pdfParse = require("pdf-parse");

const interviewReportModel = require("../models/interviewReport.model");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);
const mongoose = require("mongoose");

async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription, jobDescription } = req.body;

    let resumeText = "";

    if (req.file) {
      const resumeContent = await pdfParse(req.file.buffer);
      resumeText = (resumeContent.text || "").trim();
    }

    if (!resumeText && !selfDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a resume or a self description.",
      });
    }

    if (!jobDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    if (jobDescription.trim().length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Job description is too long.",
      });
    }

    if (selfDescription && selfDescription.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Self description is too long.",
      });
    }

    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription?.trim() || "",
      jobDescription: jobDescription.trim(),
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription?.trim() || "",
      jobDescription: jobDescription.trim(),
      title: aiReport.title,
      matchScore: aiReport.matchScore,
      technicalQuestions: aiReport.technicalQuestions,
      behavioralQuestions: aiReport.behavioralQuestions,
      skillGaps: aiReport.skillGaps,
      preparationPlan: aiReport.preparationPlan,
    });

    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("Generate interview report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate interview report. Please try again.",
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview report ID.",
      });
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("Get interview report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview report.",
    });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
      );

    return res.status(200).json({
      success: true,
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    console.error("Get interview reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview reports.",
    });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview report ID.",
      });
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=interview-report-${interviewReportId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Generate resume PDF error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume PDF.",
    });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};