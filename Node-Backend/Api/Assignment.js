const express = require("express");
const router = express.Router();
const Assignment = require("./../Models/Assignment");
const Goal = require("./../Models/Goal");
const {
  validateAssignment,
  validateAssignmentEdit,
  validateCompleted,
} = require("./Validation/AssignmentValidation");

const {
  toObjectId,
  handleAssignmentCronjob,
  handleAssignmentMail,
} = require("./../Utils/globalHelpers");
const moment = require("moment");
router.get("/get", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    if (!user) {
      throw new Error("User id not found");
    }

    let reqObj = req?.query || {};
    // let reqObj =  {};
    const type = reqObj.type;
    const title = reqObj.title;

    if (title) {
      reqObj.title = { $regex: title, $options: "i" };
    }
    if (type?.length) {
      reqObj.$or = type.map((v) => {
        return {
          type: v,
        };
      });
    }

    delete reqObj.type;
    if (reqObj.startDate && reqObj.endDate) {
      reqObj.dueDate = {
        $gte: new Date(moment(reqObj.startDate).startOf("day")),
        $lt: new Date(moment(reqObj.endDate).endOf("day")),
        // $lt: new Date(),
        // $lt: new Date(2021, 29, 11),
      };
    }

    console.log({ user: user, ...reqObj });
    const assignments = await Assignment.find({
      user: user,
      ...reqObj,
    })
      .populate("type subject")
      .exec();
    res.json({ success: true, data: assignments });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/assignment", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const assignmentId = req?.query?.assignmentId;
    if (!user) {
      throw new Error("User id not found");
    }
    if (!assignmentId) {
      throw new Error("assignment id not found");
    }
    const assignment = await Assignment.aggregate([
      {
        $match: {
          user: { $eq: user },
          _id: { $eq: toObjectId(assignmentId) },
        },
        //       // { "Assignments.user": { $eq: user } },
      },
      {
        $lookup: {
          from: "goals",
          localField: "_id",
          foreignField: "assignments",
          as: "Goal",
        },
      },
      {
        $lookup: {
          from: "assignmenttypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
    ]).exec();

    if (!assignment) {
      throw new Error("no assignment found");
    }
    res.json({ success: true, data: assignment });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/pending", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    if (!user) {
      throw new Error("User id not found");
    }
    const assignments = await Assignment.find({ user: user, status: "active" })
      .populate("type subject")
      .exec();
    res.json({ success: true, data: assignments });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/subject", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const subject = req?.query?.subject;
    if (!user) {
      throw new Error("User id not found");
    }
    if (!subject) {
      throw new Error("subject id not found");
    }
    const assignments = await Assignment.find({ user: user, subject })
      .populate("type")
      .exec();
    res.json({ success: true, data: assignments });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const isInvalid = validateAssignment(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const newAssignment = new Assignment(requestBody);

    const assignment = await newAssignment.save();

    if (requestBody.notifyViaNotification) {
      const cronjobDue = handleAssignmentCronjob(
        assignment._id,
        assignment.dueDate,
        // moment(new Date(assignment.dueDate)).subtract(1, 'day')
      );
    }

    if (requestBody.notifyViaEmail) {
      const mailCron = handleAssignmentMail(
        assignment._id,
        assignment.dueDate,
        // moment(new Date(assignment.dueDate)).subtract(1, 'day')
      );
    }

    res.json({ success: true, data: assignment });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const object = moment(requestBody.dueDate).toObject();
   
    console.log();
    const isInvalid = validateAssignmentEdit(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const updateQuery = await Assignment.updateOne(
      { _id: requestBody.assignmentId, user },
      requestBody
    );
    const updateValues = await Assignment.aggregate([
      {
        $match: {
          user: { $eq: user },
          _id: { $eq: toObjectId(requestBody?.assignmentId) },
        },
        //       // { "Assignments.user": { $eq: user } },
      },
      {
        $lookup: {
          from: "goals",
          localField: "_id",
          foreignField: "assignments",
          as: "Goal",
        },
      },
      {
        $lookup: {
          from: "assignmenttypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
    ]).exec();

    if (requestBody.notifyViaNotification) {
      const cronjobDue = handleAssignmentCronjob(
        updateValues?.[0]?._id,
        updateValues.dueDate,
        // moment(new Date(updateValues.dueDate)).subtract(1, 'day')
      );
    }

    if (requestBody.notifyViaEmail) {
      const mailCron = handleAssignmentMail(
        updateValues?.[0]?._id,
        updateValues.dueDate,
        // moment(new Date(updateValues.dueDate)).subtract(1, 'day')
      );
    }

    res.json({ success: true, data: updateValues?.[0] });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/completed", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = {
      status: "completed",
      assignmentId: req?.body?.assignmentId,
      user,
    };
    const isInvalid = validateCompleted(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const updateQuery = await Assignment.updateOne(
      { _id: requestBody.assignmentId, user },
      requestBody
    );

    const updateValues = await Assignment.aggregate([
      {
        $match: {
          user: { $eq: user },
          _id: { $eq: toObjectId(requestBody?.assignmentId) },
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
      {
        $lookup: {
          from: "assignmenttypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
    ]).exec();

    const goals = await Goal.aggregate([
      {
        $match: {
          user: { $eq: user },
          status: { $ne: "completed" },
          _id: { $in: updateValues[0]?.Goal.map((v) => v._id) },
        },
      },
      {
        $lookup: {
          from: "assignments",
          let: { assignments: "$assignments" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$assignments"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
              },
            },
          ],
          as: "completedAssignment",
        },
      },
      {
        $lookup: {
          from: "assignments",
          let: { assignments: "$assignments" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ["$_id", "$$assignments"] }],
                },
              },
            },
          ],
          as: "totalAssignments",
        },
      },
      {
        $project: {
          totalAssignments: { $size: "$totalAssignments" },
          completedAssignment: { $size: "$completedAssignment" },
        },
      },

      // {assignments: requestBody?.assignmentId}
    ]).exec();

    if (goals.length) {
      let goalToMark = [];
      for (let goal of goals) {
        if (goal.totalAssignments === goal.completedAssignment) {
          goalToMark.push(goal?._id);
        }
      }
      let options = { multi: true, upsert: true };
      if (goalToMark.length) {
        await Goal.updateMany(
          { _id: goalToMark },
          { status: "completed" },
          options
        );
      }
    }

    res.json({ success: true, data: goals });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

module.exports = router;
