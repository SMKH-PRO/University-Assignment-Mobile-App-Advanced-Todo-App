(bcrypt = require("bcrypt")), (SALT_WORK_FACTOR = process.env.BCRYPT_SALT);
const express = require("express");
const router = express.Router();
const User = require("./../Models/User");
const Goal = require("./../Models/Goal");
const Assignment = require("./../Models/Assignment");
const Notification = require("./../Models/Notification");
const {
  validateUser,
  validateLogin,
  validateSocial,
  validateForgotPassword,
  validateConfirmCode,
} = require("./Validation/UserValidation");
var jwt = require("jsonwebtoken");
const moment = require("moment");
const {
  handleMail,
  sendPushNotification,
  handleAssignmentCronjob,
} = require("./../Utils/globalHelpers");
var randomstring = require("randomstring");
const ForgotPassword = require("../Models/ForgotPassword");

router.post("/login", async (req, res, next) => {
  try {
    const isInvalid = await validateLogin(req.body);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const emailExists = await User.findOne(
      {
        email: req.body.email,
        loginType: "email",
      },
      "_id firstName lastName email passwordHash status loginType"
    ).lean();

    if (emailExists) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        emailExists.passwordHash
      );
      if (isValidPassword) {
        const { firstName, lastName, email, status, loginType, imageUrl } =
          emailExists;
        var token = jwt.sign({ _id: emailExists?._id }, process.env.JWT_SECRET);
        res.json({
          success: true,
          data: {
            firstName,
            lastName,
            email,
            status,
            token,
            loginType,
            imageUrl,
          },
        });
      } else {
        throw new Error("Invalid Credentials");
      }
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/social-signin", async (req, res, next) => {
  try {
    const isInvalid = await validateSocial(req.body);
    console.log("HIT", isInvalid);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const alreadyExists = await User.findOne({ socialId: req.body.socialId });
    if (!alreadyExists) {
      const newUser = new User(req.body);

      const user = await newUser.save();
      const { firstName, lastName, email, status, loginType } = user;
      var token = jwt.sign({ _id: user?._id }, process.env.JWT_SECRET);
      res.json({
        success: true,
        data: { firstName, lastName, email, status, token, loginType },
      });
    } else {
      const { firstName, lastName, email, status, loginType, imageUrl } =
        alreadyExists;
      var token = jwt.sign({ _id: alreadyExists?._id }, process.env.JWT_SECRET);
      console.log("token 2", alreadyExists, req.body.socialId);
      res.json({
        success: true,
        data: {
          firstName,
          lastName,
          email,
          status,
          token,
          loginType,
          imageUrl,
        },
      });
    }
  } catch (e) {
    console.log(e.message);
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const isInvalid = await validateUser(req.body);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const newUser = new User(req.body);
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // hash the password using our new salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    newUser.passwordHash = hashedPassword;
    const user = await newUser.save();
    const { firstName, lastName, email, status, loginType, imageUrl } = user;
    var token = jwt.sign({ _id: user?._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      data: { firstName, lastName, email, status, token, loginType, imageUrl },
    });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const isInvalid = await validateForgotPassword(req.body);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const userExists = await User.findOne({
      email: req.body.email,
      loginType: "email",
    });

    if (!userExists) {
      throw new Error("Email is not in use by anyone.");
    }

    const resetCode = randomstring.generate(6);
    console.log(resetCode, "resetCode");
    const newForgotPassword = new ForgotPassword({
      code: resetCode,
      user: userExists._id,
    });

    const forgotPassword = await newForgotPassword.save();
    const mail = handleMail(
      userExists?.email,
      "DIARYAPP Password reset",
      `Your password reset code is ${resetCode}, this code will expire in 30 mins.`
    );

    res.json({
      success: true,
      data: {
        fpId: forgotPassword._id,
        message: "Reset code was successfully sent to your email.",
      },
    });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/confirm-code", async (req, res, next) => {
  try {
    console.log(req.body, "req.body");
    const isInvalid = await validateConfirmCode(req.body);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const isCodeValid = await ForgotPassword.findOne({
      _id: req.body.fpId,
      code: req.body.code,
      createdAt: {
        $gte: moment().subtract(30, "minutes"),
      },
    });
    if (!isCodeValid) {
      throw new Error("Code is not valid");
    }
    const userData = await User.findOne({ _id: isCodeValid?.user });

    if (!userData) {
      throw new Error("Code is not valid");
    }
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        _id: userData?._id,
      },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      data: token,
    });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/info", async (req, res, next) => {
  try {
    const usersCount = await User.count();
    const assignmentsCount = await Assignment.count();
    const notificationsCount = await Notification.count();
    const goalsCount = await Goal.count();

    res.json({
      success: true,
      data: {
        usersCount,
        assignmentsCount,
        notificationsCount,
        goalsCount,
      },
    });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/notify-test", async (req, res, next) => {
  const { token, title, body } = req.query;
  try {
    await sendPushNotification(token, {
      notification: {
        title,
        body,
      },
    });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/cron-test", async (req, res, next) => {
  try {
    await handleAssignmentCronjob(
      "6203a984f59234813bd6be3d",
      new Date(moment().add(1, "minute"))
    );
    res.json("ok")
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});
module.exports = router;
