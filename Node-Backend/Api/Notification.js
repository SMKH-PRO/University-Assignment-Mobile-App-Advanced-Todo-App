const express = require("express");
const router = express.Router();
const Notification = require("./../Models/Notification");

router.get("/get", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user};

    const notificationData = await Notification.find({ user: requestBody.user })
      .populate("assignment")
      .exec();
    res.json({ success: true, data: notificationData });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/mark-as-read", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user , status: "read" };
    if (!requestBody?.user) {
      throw new Error("user id is required");
    }
    if (!requestBody?.notificationId) {
      throw new Error("notification id is required");
    }

    const updateQuery = await Notification.updateOne(
      { _id: requestBody.notificationId, user },
      requestBody
    );
    const updateValues = await Notification.findOne({
      user: requestBody.user,
      _id: requestBody.notificationId,
    })
      .populate("assignment")
      .exec();
    res.json({ success: true, data: updateValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

module.exports = router;
