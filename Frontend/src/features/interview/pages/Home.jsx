// import React, { useState, useRef } from "react";
// import "../style/home.scss";
// import { useInterview } from "../hooks/useInterview.js";
// import { useNavigate } from "react-router";

// const Home = () => {
//   const { loading, generateReport, reports } = useInterview();
//   const [jobDescription, setJobDescription] = useState("");
//   const [selfDescription, setSelfDescription] = useState("");
//   const resumeInputRef = useRef();

//   const navigate = useNavigate();

//   const handleGenerateReport = async () => {
//     const resumeFile = resumeInputRef.current.files[0];
//     const data = await generateReport({
//       jobDescription,
//       selfDescription,
//       resumeFile,
//     });
//     navigate(`/interview/${data._id}`);
//   };

//   if (loading) {
//     return (
//       <main className="loading-screen">
//         <h1>Loading your interview plan...</h1>
//       </main>
//     );
//   }

//   return (
//     <div className="home-page">
//       {/* Page Header */}
//       <header className="page-header">
//         <h1>
//           Create Your Custom <span className="highlight">Interview Plan</span>
//         </h1>
//         <p>
//           Let our AI analyze the job requirements and your unique profile to
//           build a winning strategy.
//         </p>
//       </header>

//       {/* Main Card */}
//       <div className="interview-card">
//         <div className="interview-card__body">
//           {/* Left Panel - Job Description */}
//           <div className="panel panel--left">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
//                   <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
//                 </svg>
//               </span>
//               <h2>Target Job Description</h2>
//               <span className="badge badge--required">Required</span>
//             </div>
//             <textarea
//               onChange={(e) => {
//                 setJobDescription(e.target.value);
//               }}
//               className="panel__textarea"
//               placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
//               maxLength={5000}
//             />
//             <div className="char-counter">0 / 5000 chars</div>
//           </div>

//           {/* Vertical Divider */}
//           <div className="panel-divider" />

//           {/* Right Panel - Profile */}
//           <div className="panel panel--right">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                   <circle cx="12" cy="7" r="4" />
//                 </svg>
//               </span>
//               <h2>Your Profile</h2>
//             </div>

//             {/* Upload Resume */}
//             <div className="upload-section">
//               <label className="section-label">
//                 Upload Resume
//                 <span className="badge badge--best">Best Results</span>
//               </label>
//               <label className="dropzone" htmlFor="resume">
//                 <span className="dropzone__icon">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="28"
//                     height="28"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <polyline points="16 16 12 12 8 16" />
//                     <line x1="12" y1="12" x2="12" y2="21" />
//                     <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
//                   </svg>
//                 </span>
//                 <p className="dropzone__title">
//                   Click to upload or drag &amp; drop
//                 </p>
//                 <p className="dropzone__subtitle">PDF or DOCX (Max 5MB)</p>
//                 <input
//                   ref={resumeInputRef}
//                   hidden
//                   type="file"
//                   id="resume"
//                   name="resume"
//                   accept=".pdf,.docx"
//                 />
//               </label>
//             </div>

//             {/* OR Divider */}
//             <div className="or-divider">
//               <span>OR</span>
//             </div>

//             {/* Quick Self-Description */}
//             <div className="self-description">
//               <label className="section-label" htmlFor="selfDescription">
//                 Quick Self-Description
//               </label>
//               <textarea
//                 onChange={(e) => {
//                   setSelfDescription(e.target.value);
//                 }}
//                 id="selfDescription"
//                 name="selfDescription"
//                 className="panel__textarea panel__textarea--short"
//                 placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
//               />
//             </div>

//             {/* Info Box */}
//             <div className="info-box">
//               <span className="info-box__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                 >
//                   <circle cx="12" cy="12" r="10" />
//                   <line
//                     x1="12"
//                     y1="8"
//                     x2="12"
//                     y2="12"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                   <line
//                     x1="12"
//                     y1="16"
//                     x2="12.01"
//                     y2="16"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                 </svg>
//               </span>
//               <p>
//                 Either a <strong>Resume</strong> or a{" "}
//                 <strong>Self Description</strong> is required to generate a
//                 personalized plan.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Card Footer */}
//         <div className="interview-card__footer">
//           <span className="footer-info">
//             AI-Powered Strategy Generation &bull; Approx 30s
//           </span>
//           <button onClick={handleGenerateReport} className="generate-btn">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//             >
//               <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
//             </svg>
//             Generate My Interview Strategy
//           </button>
//         </div>
//       </div>

//       {/* Recent Reports List */}
//       {reports.length > 0 && (
//         <section className="recent-reports">
//           <h2>My Recent Interview Plans</h2>
//           <ul className="reports-list">
//             {reports.map((report) => (
//               <li
//                 key={report._id}
//                 className="report-item"
//                 onClick={() => navigate(`/interview/${report._id}`)}
//               >
//                 <h3>{report.title || "Untitled Position"}</h3>
//                 <p className="report-meta">
//                   Generated on {new Date(report.createdAt).toLocaleDateString()}
//                 </p>
//                 <p
//                   className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}
//                 >
//                   Match Score: {report.matchScore}%
//                 </p>
//               </li>
//             ))}
//           </ul>
//         </section>
//       )}

//       {/* Page Footer */}
//       <footer className="page-footer">
//         <a href="#">Privacy Policy</a>
//         <a href="#">Terms of Service</a>
//         <a href="#">Help Center</a>
//       </footer>
//     </div>
//   );
// };

// export default Home;

// import React, { useState, useRef } from "react";
// import "../style/home.scss";
// import { useInterview } from "../hooks/useInterview.js";
// import { useNavigate } from "react-router";

// const Home = () => {
//   const { loading, generateReport, reports } = useInterview();
//   const [jobDescription, setJobDescription] = useState("");
//   const [selfDescription, setSelfDescription] = useState("");
//   const resumeInputRef = useRef();

//   const navigate = useNavigate();

//   const handleGenerateReport = async () => {
//     const resumeFile = resumeInputRef.current.files[0];

//     const data = await generateReport({
//       jobDescription,
//       selfDescription,
//       resumeFile,
//     });

//     navigate(`/interview/${data._id}`);
//   };

//   if (loading) {
//     return (
//       <main className="loading-screen">
//         <div className="loading-card">
//           <div className="loading-spinner" />
//           <h1>Loading your interview plan...</h1>
//           <p>Preparing your personalized interview workspace</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <div className="home-page">
//       {/* Page Header */}
//       <header className="page-header">
//         <div className="page-header__eyebrow">
//           <span className="eyebrow-dot" />
//           AI-POWERED INTERVIEW PREPARATION
//         </div>

//         <h1>
//           Create Your Custom <span className="highlight">Interview Plan</span>
//         </h1>

//         <p>
//           Let our AI analyze the job requirements and your unique profile to
//           build a personalized strategy for your next interview.
//         </p>
//       </header>

//       {/* Main Card */}
//       <div className="interview-card">
//         <div className="interview-card__body">
//           {/* Left Panel - Job Description */}
//           <section className="panel panel--left">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
//                   <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
//                 </svg>
//               </span>

//               <div className="panel__title">
//                 <h2>Target Job Description</h2>
//                 <span>What the company is looking for</span>
//               </div>

//               <span className="badge badge--required">Required</span>
//             </div>

//             <div className="textarea-wrapper">
//               <textarea
//                 value={jobDescription}
//                 onChange={(e) => {
//                   setJobDescription(e.target.value);
//                 }}
//                 className="panel__textarea"
//                 placeholder={`Paste the full job description here...

// e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
//                 maxLength={5000}
//                 aria-label="Target job description"
//               />

//               <div className="char-counter">{jobDescription.length} / 5000</div>
//             </div>
//           </section>

//           {/* Vertical Divider */}
//           <div className="panel-divider">
//             <span>+</span>
//           </div>

//           {/* Right Panel - Profile */}
//           <section className="panel panel--right">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                   <circle cx="12" cy="7" r="4" />
//                 </svg>
//               </span>

//               <div className="panel__title">
//                 <h2>Your Profile</h2>
//                 <span>Tell us about your experience</span>
//               </div>
//             </div>

//             {/* Upload Resume */}
//             <div className="upload-section">
//               <label className="section-label">
//                 Upload Resume
//                 <span className="badge badge--best">Best Results</span>
//               </label>

//               <label className="dropzone" htmlFor="resume">
//                 <span className="dropzone__icon">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="28"
//                     height="28"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <polyline points="16 16 12 12 8 16" />
//                     <line x1="12" y1="12" x2="12" y2="21" />
//                     <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
//                   </svg>
//                 </span>

//                 <p className="dropzone__title">
//                   Click to upload or drag &amp; drop
//                 </p>

//                 <p className="dropzone__subtitle">
//                   PDF or DOCX <span>•</span> Max 5MB
//                 </p>

//                 <input
//                   ref={resumeInputRef}
//                   hidden
//                   type="file"
//                   id="resume"
//                   name="resume"
//                   accept=".pdf,.docx"
//                 />
//               </label>
//             </div>

//             {/* OR Divider */}
//             <div className="or-divider">
//               <span>OR</span>
//             </div>

//             {/* Quick Self-Description */}
//             <div className="self-description">
//               <label className="section-label" htmlFor="selfDescription">
//                 Quick Self-Description
//               </label>

//               <textarea
//                 value={selfDescription}
//                 onChange={(e) => {
//                   setSelfDescription(e.target.value);
//                 }}
//                 id="selfDescription"
//                 name="selfDescription"
//                 className="panel__textarea panel__textarea--short"
//                 placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
//               />
//             </div>

//             {/* Info Box */}
//             <div className="info-box">
//               <span className="info-box__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                 >
//                   <circle cx="12" cy="12" r="10" />
//                   <line
//                     x1="12"
//                     y1="8"
//                     x2="12"
//                     y2="12"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                   <line
//                     x1="12"
//                     y1="16"
//                     x2="12.01"
//                     y2="16"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                 </svg>
//               </span>

//               <p>
//                 Either a <strong>Resume</strong> or a{" "}
//                 <strong>Self Description</strong> is required to generate a
//                 personalized plan.
//               </p>
//             </div>
//           </section>
//         </div>

//         {/* Card Footer */}
//         <div className="interview-card__footer">
//           <span className="footer-info">
//             <span className="footer-status-dot" />
//             AI-Powered Strategy Generation
//             <span className="footer-separator">•</span>
//             Approx 30s
//           </span>

//           <button
//             onClick={handleGenerateReport}
//             className="generate-btn"
//             type="button"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//             >
//               <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
//             </svg>
//             Generate My Interview Strategy
//             <svg
//               className="button-arrow"
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <line x1="5" y1="12" x2="19" y2="12" />
//               <polyline points="12 5 19 12 12 19" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Recent Reports */}
//       {reports.length > 0 && (
//         <section className="recent-reports">
//           <div className="recent-reports__header">
//             <div>
//               <span className="section-eyebrow">YOUR HISTORY</span>
//               <h2>My Recent Interview Plans</h2>
//             </div>

//             <span className="report-count">
//               {reports.length} {reports.length === 1 ? "plan" : "plans"}
//             </span>
//           </div>

//           <ul className="reports-list">
//             {reports.map((report) => (
//               <li
//                 key={report._id}
//                 className="report-item"
//                 onClick={() => navigate(`/interview/${report._id}`)}
//                 tabIndex="0"
//                 role="button"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     navigate(`/interview/${report._id}`);
//                   }
//                 }}
//               >
//                 <div className="report-item__top">
//                   <span className="report-icon">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="17"
//                       height="17"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                       <polyline points="14 2 14 8 20 8" />
//                       <line x1="8" y1="13" x2="16" y2="13" />
//                       <line x1="8" y1="17" x2="16" y2="17" />
//                     </svg>
//                   </span>

//                   <div className="report-item__content">
//                     <h3>{report.title || "Untitled Position"}</h3>

//                     <p className="report-meta">
//                       Generated on{" "}
//                       {new Date(report.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>

//                   <span
//                     className={`match-score ${
//                       report.matchScore >= 80
//                         ? "score--high"
//                         : report.matchScore >= 60
//                           ? "score--mid"
//                           : "score--low"
//                     }`}
//                   >
//                     {report.matchScore}%
//                   </span>
//                 </div>

//                 <div className="report-item__bottom">
//                   <span>Match Score</span>

//                   <span className="report-arrow">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="16"
//                       height="16"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <line x1="5" y1="12" x2="19" y2="12" />
//                       <polyline points="12 5 19 12 12 19" />
//                     </svg>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </section>
//       )}

//       {/* Page Footer */}
//       <footer className="page-footer">
//         <a href="#">Privacy Policy</a>
//         <span>•</span>
//         <a href="#">Terms of Service</a>
//         <span>•</span>
//         <a href="#">Help Center</a>
//       </footer>
//     </div>
//   );
// };

// export default Home;




// import React, { useState, useRef } from "react";
// import "../style/home.scss";
// import { useInterview } from "../hooks/useInterview.js";
// import { useAuth } from "../../auth/hooks/useAuth";
// import { useNavigate } from "react-router";

// const Home = () => {
//   const { loading, error, generateReport, reports } = useInterview();
//   const { handleLogout:logoutUser} = useAuth()


//   const [jobDescription, setJobDescription] = useState("");
//   const [selfDescription, setSelfDescription] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);

//   const resumeInputRef = useRef();
//   const navigate = useNavigate();

//   const handleGenerateReport = async () => {
//     const resumeFile = resumeInputRef.current?.files[0];

//     if (!jobDescription.trim()) {
//       alert("Please provide the target job description.");
//       return;
//     }

//     if (!resumeFile && !selfDescription.trim()) {
//       alert("Please provide either a resume or a self description.");
//       return;
//     }

//     setIsGenerating(true);

//     const data = await generateReport({
//       jobDescription,
//       selfDescription,
//       resumeFile,
//     });

//     setIsGenerating(false);

//     if (data) {
//       navigate(`/interview/${data._id}`);
//     }
//   };

//  const handleLogout = async () => {
//   const success = await logoutUser();

//   if (success) {
//     navigate("/login", { replace: true });
//   }
// };

//   if (loading) {
//     return (
//       <main className="loading-screen">
//         <div className="loading-card">
//           <div className="loading-spinner" />
//           <h1>Loading your interview plan...</h1>
//           <p>Preparing your personalized interview workspace</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <div className="home-page">
//       {/* Logout Button */}
//       <button
//         type="button"
//         className="logout-button"
//         onClick={handleLogout}
//         disabled={loading}
//         aria-label="Logout"
//       >
//         Logout
//       </button>

//       {/* Page Header */}
//       <header className="page-header">
//         <div className="page-header__eyebrow">
//           <span className="eyebrow-dot" />
//           AI-POWERED INTERVIEW PREPARATION
//         </div>

//         <h1>
//           Create Your Custom <span className="highlight">Interview Plan</span>
//         </h1>

//         <p>
//           Let our AI analyze the job requirements and your unique profile to
//           build a personalized strategy for your next interview.
//         </p>
//       </header>

//       {/* Main Card */}
//       <div className="interview-card">
//         <div className="interview-card__body">
//           {error && (
//             <div className="home-error" role="alert">
//               {error}
//             </div>
//           )}

//           {/* Left Panel - Job Description */}
//           <section className="panel panel--left">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
//                   <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
//                 </svg>
//               </span>

//               <div className="panel__title">
//                 <h2>Target Job Description</h2>
//                 <span>What the company is looking for</span>
//               </div>

//               <span className="badge badge--required">Required</span>
//             </div>

//             <div className="textarea-wrapper">
//               <textarea
//                 value={jobDescription}
//                 onChange={(e) => setJobDescription(e.target.value)}
//                 className="panel__textarea"
//                 placeholder={`Paste the full job description here...


// e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
//                 maxLength={5000}
//                 aria-label="Target job description"
//               />

//               <div className="char-counter">
//                 {jobDescription.length} / 5000
//               </div>
//             </div>
//           </section>

//           {/* Vertical Divider */}
//           <div className="panel-divider">
//             <span>+</span>
//           </div>

//           {/* Right Panel - Profile */}
//           <section className="panel panel--right">
//             <div className="panel__header">
//               <span className="panel__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                   <circle cx="12" cy="7" r="4" />
//                 </svg>
//               </span>

//               <div className="panel__title">
//                 <h2>Your Profile</h2>
//                 <span>Tell us about your experience</span>
//               </div>
//             </div>

//             {/* Upload Resume */}
//             <div className="upload-section">
//               <label className="section-label">
//                 Upload Resume
//                 <span className="badge badge--best">Best Results</span>
//               </label>

//               <label className="dropzone" htmlFor="resume">
//                 <span className="dropzone__icon">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="28"
//                     height="28"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <polyline points="16 16 12 12 8 16" />
//                     <line x1="12" y1="12" x2="12" y2="21" />
//                     <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
//                   </svg>
//                 </span>

//                 <p className="dropzone__title">
//                   Click to upload or drag &amp; drop
//                 </p>

//                 <p className="dropzone__subtitle">
//                   PDF <span>•</span> Max 5MB
//                 </p>

//                 <input
//                   ref={resumeInputRef}
//                   hidden
//                   type="file"
//                   id="resume"
//                   name="resume"
//                   accept=".pdf,application/pdf"
//                 />
//               </label>
//             </div>

//             {/* OR Divider */}
//             <div className="or-divider">
//               <span>OR</span>
//             </div>

//             {/* Quick Self-Description */}
//             <div className="self-description">
//               <label className="section-label" htmlFor="selfDescription">
//                 Quick Self-Description
//               </label>

//               <textarea
//                 value={selfDescription}
//                 onChange={(e) => setSelfDescription(e.target.value)}
//                 id="selfDescription"
//                 name="selfDescription"
//                 className="panel__textarea panel__textarea--short"
//                 placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
//               />
//             </div>

//             {/* Info Box */}
//             <div className="info-box">
//               <span className="info-box__icon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                 >
//                   <circle cx="12" cy="12" r="10" />
//                   <line
//                     x1="12"
//                     y1="8"
//                     x2="12"
//                     y2="12"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                   <line
//                     x1="12"
//                     y1="16"
//                     x2="12.01"
//                     y2="16"
//                     stroke="#1a1f27"
//                     strokeWidth="2"
//                   />
//                 </svg>
//               </span>

//               <p>
//                 Either a <strong>Resume</strong> or a{" "}
//                 <strong>Self Description</strong> is required to generate a
//                 personalized plan.
//               </p>
//             </div>
//           </section>
//         </div>

//         {/* Card Footer */}
//         <div className="interview-card__footer">
//           <span className="footer-info">
//             <span className="footer-status-dot" />
//             AI-Powered Strategy Generation
//             <span className="footer-separator">•</span>
//             Approx 30s
//           </span>

//           <button
//             onClick={handleGenerateReport}
//             className="generate-btn"
//             type="button"
//             disabled={isGenerating || loading}
//           >
//             {isGenerating ? (
//               "Generating..."
//             ) : (
//               <>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                 >
//                   <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
//                 </svg>
//                 Generate My Interview Strategy
//                 <svg
//                   className="button-arrow"
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <line x1="5" y1="12" x2="19" y2="12" />
//                   <polyline points="12 5 19 12 12 19" />
//                 </svg>
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Recent Reports */}
//       {reports.length > 0 && (
//         <section className="recent-reports">
//           <div className="recent-reports__header">
//             <div>
//               <span className="section-eyebrow">YOUR HISTORY</span>
//               <h2>My Recent Interview Plans</h2>
//             </div>

//             <span className="report-count">
//               {reports.length} {reports.length === 1 ? "plan" : "plans"}
//             </span>
//           </div>

//           <ul className="reports-list">
//             {reports.map((report) => (
//               <li
//                 key={report._id}
//                 className="report-item"
//                 onClick={() => navigate(`/interview/${report._id}`)}
//                 tabIndex="0"
//                 role="button"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     navigate(`/interview/${report._id}`);
//                   }
//                 }}
//               >
//                 <div className="report-item__top">
//                   <span className="report-icon">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="17"
//                       height="17"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                       <polyline points="14 2 14 8 20 8" />
//                       <line x1="8" y1="13" x2="16" y2="13" />
//                       <line x1="8" y1="17" x2="16" y2="17" />
//                     </svg>
//                   </span>

//                   <div className="report-item__content">
//                     <h3>{report.title || "Untitled Position"}</h3>

//                     <p className="report-meta">
//                       Generated on{" "}
//                       {new Date(report.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>

//                   <span
//                     className={`match-score ${
//                       report.matchScore >= 80
//                         ? "score--high"
//                         : report.matchScore >= 60
//                           ? "score--mid"
//                           : "score--low"
//                     }`}
//                   >
//                     {report.matchScore}%
//                   </span>
//                 </div>

//                 <div className="report-item__bottom">
//                   <span>Match Score</span>

//                   <span className="report-arrow">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="16"
//                       height="16"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <line x1="5" y1="12" x2="19" y2="12" />
//                       <polyline points="12 5 19 12 12 19" />
//                     </svg>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </section>
//       )}

//       {/* Page Footer */}
//       <footer className="page-footer">
//         <a href="#">Privacy Policy</a>
//         <span>•</span>
//         <a href="#">Terms of Service</a>
//         <span>•</span>
//         <a href="#">Help Center</a>
//       </footer>
//     </div>
//   );
// };

// export default Home;

import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate } from "react-router";

const Home = () => {
  const { loading, error, generateReport, reports } = useInterview();
  const { handleLogout: logoutUser } = useAuth();

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // NEW: mirror the selected file into state so the UI can react to it.
  const [resumeFile, setResumeFile] = useState(null);

  const resumeInputRef = useRef();
  const navigate = useNavigate();

  // NEW: called whenever the user picks (or clears) a file.
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  // NEW: let the user remove the selected file.
  const handleResumeClear = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    setResumeFile(null);
  };

  const handleGenerateReport = async () => {
    // Still reads straight from the input — no logic change.
    const file = resumeInputRef.current?.files[0];

    if (!jobDescription.trim()) {
      alert("Please provide the target job description.");
      return;
    }

    if (!file && !selfDescription.trim()) {
      alert("Please provide either a resume or a self description.");
      return;
    }

    setIsGenerating(true);

    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile: file,
    });

    setIsGenerating(false);

    if (data) {
      navigate(`/interview/${data._id}`);
    }
  };

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      navigate("/login", { replace: true });
    }
  };

  const handleMockInterview = () => {
    navigate("/start-interview");
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <div className="loading-spinner" />
          <h1>Loading your interview plan...</h1>
          <p>Preparing your personalized interview workspace</p>
        </div>
      </main>
    );
  }

  return (
    <div className="home-page">
      {/* ── Minimal Header ──────────────────────────────────────── */}
      <header className="home-header">
        {/* <div className="home-header__brand">
          <span className="home-header__logo" aria-hidden="true" />
          <span className="home-header__name">InterviewAI</span>
        </div> */}
<div className="home-header__brand">
  <span className="home-header__logo" aria-hidden="true">
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
  <span className="home-header__name">InterviewAI</span>
</div>
        <button
          type="button"
          className="home-header__logout"
          onClick={handleLogout}
          aria-label="Logout"
        >
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
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="home-header__logout-label">Logout</span>
        </button>
      </header>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <header className="page-header">
        <div className="page-header__eyebrow">
          <span className="eyebrow-dot" />
          AI-POWERED INTERVIEW PREPARATION
        </div>

        <h1>
          Create Your Custom <span className="highlight">Interview Plan</span>
        </h1>

        <p>
          Let our AI analyze the job requirements and your unique profile to
          build a personalized strategy for your next interview.
        </p>
      </header>

      {/* ── Main Card ───────────────────────────────────────────── */}
      <div className="interview-card">
        <div className="interview-card__body">
          {error && (
            <div className="home-error" role="alert">
              {error}
            </div>
          )}

          {/* Left Panel - Job Description */}
          <section className="panel panel--left">
            <div className="panel__header">
              <span className="panel__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>

              <div className="panel__title">
                <h2>Target Job Description</h2>
                <span>What the company is looking for</span>
              </div>

              <span className="badge badge--required">Required</span>
            </div>

            <div className="textarea-wrapper">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="panel__textarea"
                placeholder={`Paste the full job description here...

e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                maxLength={5000}
                aria-label="Target job description"
              />

              <div className="char-counter">
                {jobDescription.length} / 5000
              </div>
            </div>
          </section>

          {/* Vertical Divider */}
          <div className="panel-divider">
            <span>+</span>
          </div>

          {/* Right Panel - Profile */}
          <section className="panel panel--right">
            <div className="panel__header">
              <span className="panel__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <div className="panel__title">
                <h2>Your Profile</h2>
                <span>Tell us about your experience</span>
              </div>
            </div>

            {/* Upload Resume */}
            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Best Results</span>
              </label>

              <label
                className={`dropzone ${resumeFile ? "dropzone--has-file" : ""}`}
                htmlFor="resume"
              >
                {resumeFile ? (
                  <>
                    {/* Selected state */}
                    <span className="dropzone__icon dropzone__icon--success">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>

                    <p className="dropzone__title dropzone__title--success">
                      Resume selected
                    </p>

                    <p className="dropzone__filename" title={resumeFile.name}>
                      {resumeFile.name}
                    </p>

                    <p className="dropzone__subtitle">
                      {(resumeFile.size / 1024).toFixed(0)} KB
                      <span>•</span>
                      Click to replace
                    </p>

                    <button
                      type="button"
                      className="dropzone__remove"
                      onClick={handleResumeClear}
                      aria-label="Remove selected resume"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    {/* Empty state */}
                    <span className="dropzone__icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                    </span>

                    <p className="dropzone__title">
                      Click to upload or drag &amp; drop
                    </p>

                    <p className="dropzone__subtitle">
                      PDF <span>•</span> Max 5MB
                    </p>
                  </>
                )}

                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                />
              </label>
            </div>

            {/* OR Divider */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Quick Self-Description */}
            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">
                Quick Self-Description
              </label>

              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                id="selfDescription"
                name="selfDescription"
                className="panel__textarea panel__textarea--short"
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              />
            </div>

            {/* Info Box */}
            <div className="info-box">
              <span className="info-box__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" />
                </svg>
              </span>

              <p>
                Either a <strong>Resume</strong> or a{" "}
                <strong>Self Description</strong> is required to generate a
                personalized plan.
              </p>
            </div>
          </section>
        </div>

        {/* Card Footer */}
        <div className="interview-card__footer">
          <span className="footer-info">
            <span className="footer-status-dot" />
            AI-Powered Strategy Generation
            <span className="footer-separator">•</span>
            Approx 30s
          </span>

          <button
            onClick={handleGenerateReport}
            className="generate-btn"
            type="button"
            disabled={isGenerating || loading}
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
                Generate My Interview Strategy
                <svg
                  className="button-arrow"
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
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Recent Reports ──────────────────────────────────────── */}
      {reports.length > 0 && (
        <section className="recent-reports">
          <div className="recent-reports__header">
            <div>
              <span className="section-eyebrow">YOUR HISTORY</span>
              <h2>My Recent Interview Plans</h2>
            </div>

            <span className="report-count">
              {reports.length} {reports.length === 1 ? "plan" : "plans"}
            </span>
          </div>

          <ul className="reports-list">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() => navigate(`/interview/${report._id}`)}
                tabIndex="0"
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/interview/${report._id}`);
                  }
                }}
              >
                <div className="report-item__top">
                  <span className="report-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="16" y2="17" />
                    </svg>
                  </span>

                  <div className="report-item__content">
                    <h3>{report.title || "Untitled Position"}</h3>

                    <p className="report-meta">
                      Generated on{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`match-score ${
                      report.matchScore >= 80
                        ? "score--high"
                        : report.matchScore >= 60
                          ? "score--mid"
                          : "score--low"
                    }`}
                  >
                    {report.matchScore}%
                  </span>
                </div>

                <div className="report-item__bottom">
                  <span>Match Score</span>

                  <span className="report-arrow">
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
            ))}
          </ul>
        </section>
      )}

      {/* ── Mock Interview CTA (bottom) ─────────────────────────── */}
      <button
        type="button"
        className="mock-cta"
        onClick={handleMockInterview}
      >
        <span className="mock-cta__icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </span>

        <span className="mock-cta__content">
          <span className="mock-cta__eyebrow">LIVE PRACTICE</span>
          <h3 className="mock-cta__title">Start a Mock Interview</h3>
          <p className="mock-cta__subtitle">
            Rehearse with an AI interviewer in real time
          </p>
        </span>

        <span className="mock-cta__arrow" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
      </button>

      {/* ── Page Footer ─────────────────────────────────────────── */}
      <footer className="page-footer">
        <a href="#">Privacy Policy</a>
        <span>•</span>
        <a href="#">Terms of Service</a>
        <span>•</span>
        <a href="#">Help Center</a>
      </footer>
    </div>
  );
};

export default Home;