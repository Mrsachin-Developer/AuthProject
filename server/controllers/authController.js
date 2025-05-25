import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation for missing details
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save(); // Save the new user to the database

    // Generate JWT token for the new user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // SameSite policy for CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration in milliseconds (7 days)
    });

    // Prepare and send welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to My Auth Application",
      text: `Welcome to Sachins website. Your account has been created with email id:${email}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      // Email sent successfully, continue with success response
    } catch (mailError) {
      console.error("Email failed to send during registration:", mailError); // Log full error for debugging
      // Optionally, you might want to inform the user that the email failed to send,
      // but for registration, we often proceed with success if the account is created.
    }

    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error); // Log full error for debugging
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation for missing credentials
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token for the logged-in user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration in milliseconds (7 days)
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error); // Log full error for debugging
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the authentication token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Max age should match the setting to ensure proper clearing
    });

    return res.json({ success: true, message: "Logged Out successfully" });
  } catch (error) {
    console.error("Logout error:", error); // Log full error for debugging
    return res.json({ success: false, message: error.message });
  }
};

// Send verification OTP to the User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    // Check if user exists
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if account is already verified
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already Verified" });
    }

    // Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 24 hours
    await user.save(); // Save OTP and expiration to user document

    // Prepare email options with OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    try {
      await transporter.sendMail(mailOptions);
      // Explicitly return on success to prevent further execution in this block
      return res.json({
        success: true,
        message: "Verification OTP Sent on Email",
      });
    } catch (mailError) {
      console.error("Email sending error for verification OTP:", mailError); // Log full error
      // If email fails, respond with an error message
      return res.json({
        success: false,
        message: "Failed to send verification email: " + mailError.message,
      });
    }
  } catch (error) {
    console.error("sendVerifyOtp general error:", error); // Log full error
    return res.json({ success: false, message: error.message });
  }
};

// Verify email using OTP
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Validate OTP and expiration
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    // Mark account as verified and clear OTP fields
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    try {
      await user.save(); // Save updated user document
      // Explicitly return on success
      return res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (saveError) {
      console.error("Error saving user after email verification:", saveError); // Log full error
      return res.json({ success: false, message: saveError.message });
    }
  } catch (error) {
    console.error("verifyEmail general error:", error); // Log full error
    return res.json({ success: false, message: error.message });
  }
};

// Check if user is authenticated (assuming middleware handles actual token verification)
export const isAuthenticated = async (req, res) => {
  try {
    // This function typically relies on a preceding middleware to verify the JWT token
    // and attach user information to the request (e.g., req.user).
    // If the middleware successfully authenticates, this function simply confirms.
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    console.error("isAuthenticated error:", error); // Log full error
    return res.json({ success: false, message: error.message });
  }
};

// Send password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  // Basic validation for missing email
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
    await user.save(); // Save OTP and expiration to user document

    // Prepare email options with OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "OTP sent to your email" });
    } catch (mailError) {
      console.error("Email sending error for password reset OTP:", mailError); // Log full error
      return res.json({
        success: false,
        message: "Failed to send reset email: " + mailError.message,
      });
    }
  } catch (error) {
    console.error("sendResetOtp general error:", error); // Log full error
    return res.json({ success: false, message: error.message });
  }
};

/// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Basic validation for missing details
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Validate OTP and expiration
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP is Expired",
      });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP fields
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save(); // Save updated user document

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("resetPassword error:", error); // Log full error
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
