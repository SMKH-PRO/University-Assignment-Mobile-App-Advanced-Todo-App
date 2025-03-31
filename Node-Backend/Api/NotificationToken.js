const express = require("express");
const router = express.Router();
const NotificationToken = require("./../Models/NotificationToken");
const {
  validateNotificationToken,
} = require("./Validation/NotificationTokenValidation");

router.post("/create", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const isInvalid = validateNotificationToken(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    // const deleted = await NotificationToken.deleteMany({ user });
    const newToken = new NotificationToken(requestBody);

    const token = await newToken.save();

    res.json({ success: true, data: token });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    if (requestBody?.token) {
      throw new Error("Token is required");
    }

    const deleteQuery = await NotificationToken.deleteOne(
      { token: requestBody.token, user: requestBody.user },
      requestBody
    );

    res.json({ success: true, data: deleteQuery });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});
module.exports = router;
