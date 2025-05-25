import userModel from "../models/usermodel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if userId is provided
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
