import express from "express";
import {
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import { sendVerifyOtp, verifyEmail } from "../controllers/authController.js";
import { isAuthenticated } from "../controllers/authController.js";

const authRouter = express.Router();

//created  end points
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
