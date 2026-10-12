// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router";
// import { useAuth } from "../hooks/useAuth";

// const Register = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { loading, handleRegister } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await handleRegister({ username, email, password });
//     navigate("/");
//   };

//   if (loading) {
//     return (
//       <main>
//         <h1>Loading.......</h1>
//       </main>
//     );
//   }

//   return (
//     <main>
//       <div className="form-container">
//         <h1>Register</h1>
//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <label htmlFor="username">Username</label>
//             <input
//               onChange={(e) => {
//                 setUsername(e.target.value);
//               }}
//               type="text"
//               id="username"
//               name="username"
//               placeholder="Enter username"
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="email">Email</label>
//             <input
//               onChange={(e) => {
//                 setEmail(e.target.value);
//               }}
//               type="email"
//               id="email"
//               name="email"
//               placeholder="Enter email address"
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="password">Password</label>
//             <input
//               onChange={(e) => {
//                 setPassword(e.target.value);
//               }}
//               type="password"
//               id="password"
//               name="password"
//               placeholder="Enter password"
//             />
//           </div>
//           <button className="button primary-button">Register</button>
//         </form>
//         <p>
//           Already have an account? <Link to={"/login"}>Login</Link>{" "}
//         </p>
//       </div>
//     </main>
//   );
// };

// export default Register;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, handleRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await handleRegister({ username, email, password });

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

      <section className="form-container register-container">
        <div className="auth-header">
          <div className="auth-logo">A</div>

          <div>
            <h1>Create account</h1>
            <p>Join us and get started today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>

            <div className="input-wrapper">
              <span className="input-icon">👤</span>

              <input
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
          </div>

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
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;