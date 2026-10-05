// const userModel = require("../models/user.model");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const tokenBlacklistModel = require("../models/blacklist.model");

// async function registerUser(req, res) {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password) {
//     res.status(400).json({
//       message: "Please provide username, email and password",
//     });
//   }
//   const userExist = await userModel.findOne({
//     $or: [{ username }, { email }],
//   });

//   // if (userExist) {
//   //   res.status(400).json({
//   //     message: "user already exist",
//   //   });
//   // }
//   if (userExist) {
//     return res.status(400).json({
//       message: "user already exist",
//     });
//   }
//   const hashedpassword = await bcrypt.hash(password, 10);

//   const user = await userModel.create({
//     username: username,
//     email: email,
//     password: hashedpassword,
//   });

//   const token = jwt.sign(
//     { id: user._id, username: user.username },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "1d",
//     },
//   );

//   // res.cookie("token", token);
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: false,
//     sameSite: "lax",
//     maxAge: 24 * 60 * 60 * 1000,
//   });

//   res.status(201).json({
//     message: "User created successfully",
//     user: {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//     },
//   });
// }

// async function loginUser(req, res) {
//   const { email, password } = req.body;

//   const user = await userModel.findOne({ email: email });

//   if (!user) {
//     res.status(400).json({
//       message: "invalid email or password",
//     });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     return res.status(400).json({
//       message: "Invalid password",
//     });
//   }
//   // const token = jwt.sign(
//   //   { id: user._id, username: user.username },
//   //   "mehudonsdjksafkjk",
//   //   {
//   //     expiresIn: "1d",
//   //   },
//   // );
//   const token = jwt.sign(
//     { id: user._id, username: user.username },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "1d",
//     },
//   );
//   // res.cookie("token", token);
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: false,
//     sameSite: "lax",
//     maxAge: 24 * 60 * 60 * 1000,
//   });

//   res.status(200).json({
//     message: "login successfull",
//     user: {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//     },
//   });
// }

// async function logoutUser(req, res) {
//   const { token } = req.cookies;
//   if (token) {
//     await tokenBlacklistModel.create({ token });
//   }
//   res.clearCookie("token");
//   res.status(200).json({
//     message: "User logout Successfully",
//   });
// }

// async function getMeController(req, res) {
//   const user = await userModel.findById(req.user.id);

//   res.status(200).json({
//     message: "User details fetched successfully",
//     user: {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//     },
//   });
// }
// module.exports = {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getMeController,
// };

const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function registerUser(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password",
      });
    }

    const userExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logoutUser(req, res, next) {
  try {
    const { token } = req.cookies;

    if (token) {
      await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function getMeController(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMeController,
};
