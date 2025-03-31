const express = require("express");
const router = express.Router();
const Meta = require("./../Models/Meta");

router.get("/get", async (req, res, next) => {
  try {
    const metaData = await Meta.findOne({});
    res.json({ success: true, data: metaData });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };

    if (!requestObj.user) {
      throw new Error("user id is required");
    }
    const alreadyExists = await Meta.findOne();

    if (alreadyExists) {
      throw new Error("Meta Data Already Exists");
    }
    const newMeta = new Meta(requestObj);

    const metaData = await newMeta.save();
    res.json({ success: true, data: metaData });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    if (!requestBody.user) {
      throw new Error("user id is required");
    }

    const updateQuery = await Meta.updateOne({}, requestBody);
    const updateValues = await Meta.findOne();
    res.json({ success: true, data: updateValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

module.exports = router;
