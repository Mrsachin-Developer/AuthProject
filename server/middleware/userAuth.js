import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized.Please Login Again",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id;
      next();
    } else {
      return res.json({
        success: false,
        message: "Not Authorized.Login Again",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
