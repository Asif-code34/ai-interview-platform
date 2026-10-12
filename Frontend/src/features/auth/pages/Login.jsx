

// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router";
// import "../auth.form.scss";
// import { useAuth } from "../hooks/useAuth";

// const Login = () => {
//   const { loading, handleLogin } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await handleLogin({ email, password });
//     navigate("/");
//   };

//   return (
//     <main className="auth-page">
//       <div className="auth-background">
//         <div className="auth-shape auth-shape-one"></div>
//         <div className="auth-shape auth-shape-two"></div>
//       </div>

//       <section className="form-container">
//         <div className="auth-header">
//           <div className="auth-logo">A</div>

//           <div>
//             <h1>Welcome back</h1>
//             <p>Sign in to continue to your account</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <label htmlFor="email">Email address</label>

//             <div className="input-wrapper">
//               <span className="input-icon">✉</span>

//               <input
//                 onChange={(e) => {
//                   setEmail(e.target.value);
//                 }}
//                 value={email}
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="you@example.com"
//                 autoComplete="email"
//                 required
//               />
//             </div>
//           </div>

//           <div className="input-group">
//             <div className="label-row">
//               <label htmlFor="password">Password</label>
//             </div>

//             <div className="input-wrapper">
//               <span className="input-icon">🔒</span>

//               <input
//                 onChange={(e) => {
//                   setPassword(e.target.value);
//                 }}
//                 value={password}
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 name="password"
//                 placeholder="Enter your password"
//                 autoComplete="current-password"
//                 required
//               />

//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="button primary-button"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <span className="spinner"></span>
//                 Logging in...
//               </>
//             ) : (
//               "Login"
//             )}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account? <Link to="/register">Create an account</Link>
//         </p>
//       </section>
//     </main>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { loading, error, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await handleLogin({ email, password });

    if (success) {
      navigate("/", { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-shape auth-shape-one"></div>
        <div className="auth-shape auth-shape-two"></div>
      </div>

      <section className="form-container">
        <div className="auth-header">
          <div className="auth-logo">A</div>

          <div>
            <h1>Welcome back</h1>
            <p>Sign in to continue to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button primary-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;