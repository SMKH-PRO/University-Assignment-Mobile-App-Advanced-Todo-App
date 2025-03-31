const express = require("express");
const router = express.Router();
const Subject = require("./../Models/Subject");
const {
  validateSubject,
  validateSubjects,
  validateSubjectEdit
} = require("./Validation/SubjectValidation");
router.get("/get", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    if (!user) {
      throw new Error("User id not found");
    }
    const subject = await Subject.find({ user });
    res.json({ success: true, data: subject });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.get("/pending", async (req, res, next) => {
  try {
    const status = req?.query?.status;
    const user = req?.user?._id;
    if (!user) {
      throw new Error("User id not found");
    }

    const andExpression = [
      {
        $eq: ["$subject", "$$subject"],
      },

      {
        $eq: ["$user", user],
      },
    ];

    if (Boolean(status)) {
      andExpression.push({
        $eq: ["$status", status],
      });
    }

    console.log(status, user);
    const subject = await Subject.aggregate([
      {
        $lookup: {
          from: "assignments",
          as: "Assignment",
          let: { subject: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$subject", "$$subject"] },
              },
            },
          ],
        },
      },

      {
        $match: {
          user: { $eq: user },
          // "Assignment.status": { $eq: status || "active" },
          // "Assignment.user": { $eq: user },
        },
      },
      // { $sort: { "Assignment.dueDate": -1 } },
      {
        $project: {
          title: 1,
          image: 1,
          Assignment: 1,
          AssignmentCount: { $size: "$Assignment" },
        },
      },
      { $unwind: "$Assignment" },
      {
        $lookup: {
          from: "assignments",
          as: "Assignment",
          let: { subject: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: andExpression,
                },
              },
            },
            {
              $lookup: {
                from: "assignmenttypes",
                let: { type: "$type" },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ["$_id", "$$type"] } },
                  },
                ],
                as: "assignmentType",
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: "$Assignment" },
      { $sort: { "Assignment.dueDate": -1 } },

      {
        $group: {
          _id: "$_id",
          AssignmentCount: {
            $first: "$AssignmentCount",
          },
          title: {
            $first: "$title",
          },
          image: {
            $first: "$image",
          },
          Assignment: {
            $first: "$Assignment",
          },
        },
      },
    ]).exec();
    res.json({ success: true, data: subject });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };
    const isInvalid = validateSubject(requestObj);
    if (isInvalid) {
      throw new Error(isInvalid);
    }
    console.log(requestObj);
    const newSubject = new Subject(requestObj);

    const subject = await newSubject.save();
    res.json({ success: true, data: subject });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});
router.post("/create-multiple", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };

    const isInvalid = validateSubjects(requestObj);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    // const alreadyExists = await Subject.find({
    //   title: requestObj.subjects,
    //   user: requestObj.user,
    // });
    // if (alreadyExists.length) {
    //   throw new Error(
    //     `Subjects by the name of ${alreadyExists
    //       .map((v) => v.title)
    //       .join(", ")} already exists`
    //   );
    // }
    const newSubjects = await Subject.insertMany(
      requestObj.subjects.map((v) => {
        return {
          ...v,
          user: requestObj.user,
        };
      })
    );

    res.json({ success: true, data: newSubjects });
  } catch (e) {
    console.log("OK", e.message);
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/check-multiple", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };

    const isInvalid = validateSubjects(requestObj);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const alreadyExists = await Subject.find({
      title: requestObj.subjects,
      user: requestObj.user,
    });
    if (alreadyExists.length) {
      throw new Error(
        `Subjects by the name of ${alreadyExists
          .map((v) => v.title)
          .join(", ")} already exists`
      );
    }

    res.json({ success: true });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/check", async (req, res, next) => {
  try {
    const requestObj = { ...req.body, user: req?.user?._id };

    const isInvalid = validateSubjectEdit(requestObj);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const alreadyExists = await Subject.find({
      title: requestObj.title,
      user: requestObj.user,
      "_id": { $ne: requestObj.subjectId }
    });
    if (alreadyExists.length) {
      throw new Error(
        `Subjects by the name of ${alreadyExists
          .map((v) => v.title)
          .join(", ")} already exists`
      );
    }

    res.json({ success: true });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});


router.post("/edit", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    const isInvalid = validateSubjectEdit(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const updateQuery = await Subject.updateOne(
      { _id: requestBody.subjectId },
      requestBody
    );
    const updaeValues = await Subject.findOne({ _id: requestBody.subjectId })
        console.log(updaeValues)
    res.json({ success: true, data: updaeValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});
module.exports = router;
