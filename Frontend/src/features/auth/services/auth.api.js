// //  we are sending token in cookie in server side but axios doesnot support it for that we have to send   withCredentials: true, in every request which handling cookie
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true,
// });

// export async function register({ username, email, password }) {
//   try {
//     const response = await api.post("/api/auth/register", {
//       username,
//       email,
//       password,
//     });

//     return response.data;
//   } catch (err) {
//     console.log(err);
//   }
// }

// export async function login({ email, password }) {
//   try {
//     const response = await api.post("/api/auth/login", {
//       email,
//       password,
//     });

//     return response.data;
//   } catch (err) {
//     console.log(err);
//   }
// }

// export async function logout() {
//   try {
//     const response = await api.get("/api/auth/logout");

//     return response.data;
//   } catch (err) {
//     console.log(err);
//   }
// }

// export async function getMe() {
//   try {
//     const response = await api.get("/api/auth/get-me");

//     return response.data;
//   } catch (err) {
//     console.log(err);
//   }
// }


import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return "Unable to connect to the server. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}