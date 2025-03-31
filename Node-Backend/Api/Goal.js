const express = require("express");
const router = express.Router();
const Goal = require("./../Models/Goal");
const Assignment = require("./../Models/Assignment");
const {
  validateGoal,
  validateGoalEdit,
} = require("./Validation/GoalValidation");
const moment = require("moment");

const {
  handleScheduleCronJobs,
  toObjectId,
  handleScheduleMail,
  handleGoalCronjob,
  handleGoalNotifications,
  handleGoalMails,
} = require("./../Utils/globalHelpers");
router.get("/get", async (req, res, next) => {
  try {
    console.log(req.query);
    const requestQuery = { user: req?.user?._id };
    if (req.query.status) {
      requestQuery.status = req.query.status;
    }
    if (!requestQuery.user) {
      throw new Error("User id not found");
    }
    // if (!requestQuery.status) {
    //   throw new Error("status is required");
    // }
    console.log(requestQuery, "requestQuery");
    const goals = await Goal.find(requestQuery)
      .populate({
        path: "assignments",
        populate: {
          path: "subject",
          model: "Subject",
        },
      })
      .exec();
    res.json({ success: true, data: goals });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/get-by-id", async (req, res, next) => {
  try {
    if (!req?.user?._id) {
      throw new Error("User id not found");
    }
    if (!req?.query?.goalId) {
      throw new Error("Goal id not found");
    }
    const goals = await Goal.findOne({
      user: req?.user?._id,
      _id: req?.query?.goalId,
    })
      .populate({
        path: "assignments",
        populate: {
          path: "subject",
          model: "Subject",
        },
      })
      .exec();
    res.json({ success: true, data: goals });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const isInvalid = validateGoal(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const newGoal = new Goal(requestBody);

    const goal = await newGoal.save();

    const addedGoal = await Goal.findOne({ _id: goal._id })
      .populate({
        path: "assignments",
        populate: {
          path: "subject",
          model: "Subject",
        },
      })
      .exec();
    const assignmentData = await Assignment.find(
      { _id: requestBody.assignments },
      "_id dueDate"
    );
    if (requestBody.notifyViaNotification) {
      // const cronObj = handleScheduleCronJobs(
      //   assignmentData,
      //   [[new Date(requestBody?.dueDate)]],
      //   addedGoal?.intervalType
      // );
      const cronObj = handleGoalNotifications(
        addedGoal?._id,
        new Date(requestBody?.endDate)
      );
    }

    if (requestBody.notifyViaEmail) {
      // const mailCron = handleScheduleMail(
      //   assignmentData,
      //   [new Date(requestBody?.dueDate)],
      //   addedGoal?.intervalType
      // );
      const mailCron = handleGoalMails(
        addedGoal?._id,
        new Date(requestBody?.endDate)
      );
    }
    const endCron = handleGoalCronjob(addedGoal?._id, addedGoal?.endDate);
    res.json({ success: true, data: addedGoal });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const isInvalid = validateGoalEdit(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const updateQuery = await Goal.updateOne(
      { _id: requestBody.goalId },
      requestBody
    );
    const updaeValues = await Goal.findOne({ _id: requestBody.goalId })
      .populate({
        path: "assignments",
        populate: {
          path: "subject",
          model: "Subject",
        },
      })
      .exec();
    const assignmentData = await Assignment.find(
      { _id: requestBody.assignments },
      "_id dueDate"
    );

    if (requestBody.notifyViaNotification) {
      // const cronObj = handleScheduleCronJobs(
      //   assignmentData,
      //   [[new Date(requestBody?.dueDate)]],
      //   addedGoal?.intervalType
      // );
      const cronObj = handleGoalNotifications(
        updaeValues?._id,
        new Date(requestBody?.endDate)
      );
    }

    if (requestBody.notifyViaEmail) {
      // const mailCron = handleScheduleMail(
      //   assignmentData,
      //   [new Date(requestBody?.dueDate)],
      //   addedGoal?.intervalType
      // );
      const mailCron = handleGoalMails(
        updaeValues?._id,
        new Date(requestBody?.endDate)
      );
    }
    const endCron = handleGoalCronjob(updaeValues?._id, updaeValues?.endDate);

    res.json({ success: true, data: updaeValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create-test", async (req, res, next) => {
  try {
    console.log(req.body);
    const requestBody = req.body;
    const user = req?.user?._id;
    const assignmentData = await Assignment.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(requestBody?.assignmentId) },
        },
      },
      {
        $lookup: {
          from: "notificationtokens",
          localField: "user",
          foreignField: "user",
          as: "token",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "_id",
          foreignField: "assignments",
          as: "Goal",
        },
      },
    ]).exec();

    console.log(assignmentData, "assignmentData");
    res.json(assignmentData);
  } catch (error) {
    console.log(error, "error");
  }
});
module.exports = router;
