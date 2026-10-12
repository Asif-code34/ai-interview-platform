// import { useContext, useEffect } from "react";
// import { AuthContext } from "../auth.context";
// import { login, register, logout, getMe } from "../services/auth.api";

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   const { user, setUser, loading, setLoading } = context;

//   const handleLogin = async ({ email, password }) => {
//     setLoading(true);
//     try {
//       const data = await login({ email, password });
//       setUser(data.user);
//     } catch (err) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async ({ username, email, password }) => {
//     setLoading(true);
//     try {
//       const data = await register({ username, email, password });
//       setUser(data.user);
//     } catch (err) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     setLoading(true);
//     try {
//       const data = await logout();
//       setUser(null);
//     } catch (err) {
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     const getAndSetUser = async () => {
//       try {
//         const data = await getMe();
//         setUser(data.user);
//       } catch (err) {
//       } finally {
//         setLoading(false);
//       }
//     };

//     getAndSetUser();
//   }, []);
//   return { user, loading, handleRegister, handleLogin, handleLogout };
// };

import { useContext, useEffect,useState } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await login({ email, password });
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await register({ username, email, password });
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logout();
      setUser(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  }, []);

  return {
    user,
    loading,
    error,
    clearError,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};