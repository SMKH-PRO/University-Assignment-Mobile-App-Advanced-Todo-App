const express = require("express");
const router = express.Router();
const AssignmentType = require("./../Models/AssignmentType");

router.get("/get", async (req, res, next) => {
  try {
    const assignmentType = await AssignmentType.find({});
    res.json({ success: true, data: assignmentType });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };
    if (!requestObj.title) {
      throw new Error("Title is required");
    }

    if (!requestObj.user) {
      throw new Error("user id is required");
    }
    const alreadyExists = await AssignmentType.findOne({title: requestObj.title});

    if(alreadyExists) {
      throw new Error("Assignment Already Exists");
    }
    const newAssignmentType = new AssignmentType(requestObj);

    const assignmentType = await newAssignmentType.save();
    res.json({ success: true, data: assignmentType });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

module.exports = router;
