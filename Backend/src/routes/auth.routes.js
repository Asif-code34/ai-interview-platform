const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMeController,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", logoutUser);
authRouter.get("/get-me", authMiddleware.authUser, getMeController);

module.exports = authRouter;
