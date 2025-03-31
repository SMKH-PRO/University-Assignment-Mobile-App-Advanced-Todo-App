const constants = require("./constants");
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const User = require("./../Models/User");
const NotificationToken = require("./../Models/NotificationToken");
const Notification = require("./../Models/Notification");
const Assignment = require("./../Models/Assignment");
const Goal = require("./../Models/Goal");
const schedule = require("node-schedule");
const moment = require("moment");

var admin = require("firebase-admin");

var serviceAccount = require("./../service.json");
const routes = require("express").Router();
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var smtpTransport = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  // secureConnection: false,
  // port: 587,
  // requiresAuth: true,
  // domains: ["gmail.com", "googlemail.com"],
  // auth: {
  //   user: process.env.MAIL,
  //   pass: process.env.MAIL_PASSWORD,
  // },
  service: "Yandex",
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } catch (e) {
    console.log(e)
  }
}

initializeFirebase()
const CRONJOB_RECORDS = {};
const handleMongooseError = (response) => {
  let returnResponse = {};
  if (response.name === "ValidationError") {
    const errorsArray = [];

    for (const item in response.errors) {
      if (response.errors.hasOwnProperty(item)) {
        errorsArray.push(response.errors[`${item}`].message);
      }
    }

    returnResponse.message = errorsArray[0];
  } else if (typeof response === "object" && "message" in response) {
    returnResponse = { message: response.message };
  } else if (Array.isArray(response)) {
    returnResponse.message = response[0];
  } else if (typeof response === "string") {
    returnResponse.message = response;
  }

  return returnResponse;
};

const tokenValidation = async (req, _, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      throw { message: "Authentication failed", status: 401 };
    }

    let tokenSplit = token.split(" ");
    let idToken = tokenSplit[1];
    let tokenData = await jwt.verify(idToken, process.env.JWT_SECRET);
    // console.log(idToken, tokenData)

    const user = await User.findOne({ _id: tokenData._id });

    if (user) {
      req.user = user;
      next();
    } else {
      throw new Error("Invalid session, please login again.");
    }
  } catch (e) {
    next({ message: e.message, status: e.status });
  }
};

const calculateSkipDoc = (page) => {
  return (Number(page) - 1) * constants.LIMIT;
};

const calculateTotalPage = (totalDocs, limit) => {
  if (limit === 0 || totalDocs === 0) {
    return 1;
  }

  return Math.ceil(totalDocs / limit);
};

const getLimit = (limit) => {
  if (Number(limit) === 0) {
    return 0;
  }

  return constants.LIMIT;
};

const handleScheduleCronJobs = (assignments = [], notifyBefore = []) => {
  const sortedAssignments = notifyBefore?.map((notify) => {
    // console.log(notify);
    assignments.map((v) => {
      const dateInit = new Date(v.dueDate);
      // console.log(dateInit, notify.interval, notify.intervalType);
      // var newTime = moment(dateInit).subtract(notifyBefore, "hours");
      var newTime = moment(dateInit);
      // .subtract(
      //   notify.interval,
      //   notify.intervalType
      // );

      let obj = {
        date: newTime,
        id: v._id,
      };

      if (CRONJOB_RECORDS[obj.id]) {
        delete CRONJOB_RECORDS[obj.id];
      }

      // const addDate = new Date(moment().add(notifyBefore, "minutes"));

      console.log(newTime);
      CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(newTime, async () => {
        console.log("Do something on scheduled date");
        const assignmentData = await Assignment.aggregate([
          {
            $match: {
              _id: { $eq: toObjectId(obj.id) },
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
        const assignment = assignmentData?.[0];
        if (assignment) {
          const tokens = assignment.token?.map((v) => v.token);
          const title = `Reminder for ${assignment.title}`;
          const body = `Assignment from ${assignment?.Goal?.map(
            (v) => v.title
          ).join(", ")} is due on ${moment(
            new Date(assignment.dueDate.toString())
          ).format("DD MMM YYYY hh:mm a")}`;
          const pushNotification = await sendPushNotification(tokens, {
            notification: {
              title,
              body,
            },
          });
          createNotification({
            assignment: obj.id,
            title,
            body,
            user: assignment?.user,
          });
          delete CRONJOB_RECORDS[obj.id];
        }
      });
    });
  });
  return sortedAssignments;
};

const handleGoalNotifications = (goalId, notifyBefore = new Date()) => {
  const dateInit = new Date(notifyBefore);

  // var newTime = moment(dateInit);
  var newTime = new Date(moment().add(1, 'minutes'));

  let obj = {
    date: dateInit,
    id: goalId._id,
  };

  if (CRONJOB_RECORDS[obj.id]) {
    delete CRONJOB_RECORDS[obj.id];
  }

  // console.log(newTime.format("DD MMM YYYY hh:mm a"));
  CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(obj.date, async () => {
    console.log("Do something on scheduled date");
    const goalData = await Goal.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(obj.id) },
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
    ]).exec();
    const goal = goalData?.[0];
    if (goal) {
      const tokens = goal.token?.map((v) => v.token);
      const title = `Reminder for ${goal.title}`;
      const body = `${Goal?.title} is due on ${moment(
        new Date(goal.endDate.toString())
      ).format("DD MMM YYYY hh:mm a")}`;
      const pushNotification = await sendPushNotification(tokens, {
        notification: {
          title,
          body,
        },
      });
      createNotification({
        assignment: obj.id,
        title,
        body,
        user: assignment?.user,
      });
      delete CRONJOB_RECORDS[obj.id];
    }
  });
  return;
};
const handleGoalMails = (goalId, notifyBefore = new Date()) => {
  const dateInit = new Date(notifyBefore);
  var newTime = new Date(moment().add(1, 'minutes'));

  // var newTime = moment(dateInit);

  let obj = {
    date: dateInit,
    id: goalId._id,
  };

  if (CRONJOB_RECORDS[obj.id]) {
    delete CRONJOB_RECORDS[obj.id];
  }

  console.log(newTime, obj);
  CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(obj.date, async () => {
    console.log("Do something on scheduled date");
    const goalData = await Goal.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(obj.id) },
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
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "User",
        },
      },
    ]).exec();
    const userEmail = goalData?.[0]?.User?.[0]?.email;
    const goal = goalData?.[0];
    if (goal) {
      const tokens = goal.token?.map((v) => v.token);
      const title = `Reminder for ${Goal.title}`;
      const body = `${goal?.title} is due on ${moment(
        new Date(goal.endDate.toString())
      ).format("DD MMM YYYY hh:mm a")}`;
      await handleMail(userEmail, title, body);

      createNotification({
        assignment: obj.id,
        title,
        body,
        user: assignment?.user,
      });
      delete CRONJOB_RECORDS[obj.id];
    }
  });
  return;
};

const handleAssignmentCronjob = (assignmentId, date) => {
  let obj = {
    date: new Date(date),
    id: assignmentId,
  };

  if (CRONJOB_RECORDS[obj.id]) {
    delete CRONJOB_RECORDS[obj.id];
  }
  CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(obj.date, async () => {
    console.log("Do something on scheduled date");
    const assignmentData = await Assignment.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(obj.id) },
          // status: { $eq: "active" },
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
    const assignment = assignmentData?.[0];
    console.log("ASS", assignment)
    if (assignment) {
      const tokens = assignment.token?.map((v) => v.token);
      const title = `${assignment.title} is past due date`;
      const body = `Assignment due date ${assignment.dateString} has passed`;
      console.log(moment(assignment.dueDate).toObject());
      const updateQuery = await Assignment.updateOne(
        { _id: obj.id },
        { status: "due" }
      );
      const pushNotification = await sendPushNotification(tokens, {
        notification: {
          title,
          body,
        },
      });
      createNotification({
        assignment: obj.id,
        title,
        body,
        user: assignment?.user,
      });
      delete CRONJOB_RECORDS[obj.id];
    }
  });
  return CRONJOB_RECORDS;
};

const handleAssignmentMail = (assignmentId, date) => {
  let obj = {
    date: new Date(date),
    id: assignmentId,
  };

  if (CRONJOB_RECORDS[obj.id]) {
    delete CRONJOB_RECORDS[obj.id];
  }
  CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(obj.date, async () => {
    console.log("Do something on scheduled date");
    const assignmentData = await Assignment.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(obj.id) },
          status: { $eq: "active" },
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
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "User",
        },
      },
    ]).exec();
    const assignment = assignmentData?.[0];
    const userEmail = assignmentData?.[0]?.User?.[0]?.email;
    console.log(assignment, "ASS")
    if (assignment) {
      const tokens = assignment.token?.map((v) => v.token);
      const title = `${assignment.title} is past due date`;
      const body = `Assignment due date ${assignment.dateString} has passed`;
      console.log(moment(assignment.dueDate).toObject());
      const updateQuery = await Assignment.updateOne(
        { _id: obj.id },
        { status: "due" }
      );
      const pushNotification = await handleMail(userEmail, title, body);

      createNotification({
        assignment: obj.id,
        title,
        body,
        user: assignment?.user,
      });
      delete CRONJOB_RECORDS[obj.id];
    }
  });
  return CRONJOB_RECORDS;
};

const handleGoalCronjob = (goalId, date) => {
  let obj = {
    date: new Date(date),
    id: goalId,
  };

  if (CRONJOB_RECORDS[obj.id]) {
    delete CRONJOB_RECORDS[obj.id];
  }
  CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(obj.date, async () => {
    console.log("Do something on scheduled date");
    const goalData = await Goal.aggregate([
      {
        $match: {
          _id: { $eq: toObjectId(obj.id) },
          status: { $eq: "active" },
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
    ]).exec();
    const goal = goalData?.[0];
    console.log("GOAL", goal)
    if (goal) {
      const tokens = goal.token?.map((v) => v.token);
      const title = `${goal.title} is past due date`;
      const body = `Goal due date ${goal.dateString} has passed and all assignments were not completed`;

      const updateQuery = await Goal.updateOne(
        { _id: obj.id },
        { status: "due" }
      );
      const pushNotification = await sendPushNotification(tokens, {
        notification: {
          title,
          body,
        },
      });
      createNotification({
        goal: obj.id,
        title,
        body,
        user: goal?.user,
        type: "Goal",
      });
      delete CRONJOB_RECORDS[obj.id];
    }
  });
  return CRONJOB_RECORDS;
};

const handleScheduleMail = (assignments = [], notifyBefore) => {
  const sortedAssignments = notifyBefore?.map((notify) => {
    console.log(notify);
    assignments.map((v) => {
      const dateInit = new Date(v.dueDate);
      console.log(dateInit, notify.interval, notify.intervalType);
      // var newTime = moment(dateInit).subtract(notifyBefore, "hours");
      var newTime = moment(dateInit).subtract(
        notify.interval,
        notify.intervalType
      );

      let obj = {
        date: newTime,
        id: v._id,
      };

      if (CRONJOB_RECORDS[obj.id]) {
        delete CRONJOB_RECORDS[obj.id];
      }

      const addDate = new Date(moment().add(notifyBefore, "minutes"));

      console.log(newTime);
      CRONJOB_RECORDS[obj.id] = schedule.scheduleJob(newTime, async () => {
        console.log("Do something on scheduled date");
        const assignmentData = await Assignment.aggregate([
          {
            $match: {
              _id: { $eq: toObjectId(obj.id) },
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
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "User",
            },
          },
        ]).exec();
        const assignment = assignmentData?.[0];
        if (assignment) {
          console.log(
            assignmentData?.[0]?.User?.[0]?.email,
            "EMAIL",
            assignmentData?._id,
            assignmentData?.title
          );
          const userEmail = assignmentData?.[0]?.User?.[0]?.email;
          const title = `Reminder for ${assignment.title}`;
          const body = `Assignment from ${assignment?.Goal?.map(
            (v) => v.title
          ).join(", ")} is due on ${assignment.dateString}`;
          const pushNotification = await handleMail(userEmail, title, body);
          createNotification({
            assignment: obj.id,
            title,
            body,
            user: assignment?.user,
          });
          delete CRONJOB_RECORDS[obj.id];
        }
      });
    });
  });

  return sortedAssignments;
};

const sendPushNotification = (token, payload) => {
  let options = {
    priority: "high",
    timetolive: 60 * 60 * 24,
  };
  console.log(token, "tokens");
  return new Promise((resolve, reject) => {
    if (token?.length) {
      admin
        .messaging()
        .sendToDevice(token, payload, options)
        .then(async function (response) {
          let error = false;
          const promises = response.results.map((result, index) => {
            error = result.error;
            if (error) {
              // Cleanup the tokens who are not registered anymore.
              if (
                error.code === "messaging/invalid-registration-token" ||
                error.code === "messaging/registration-token-not-registered"
              ) {
                return NotificationToken.findOneAndDelete({ token });
              }
            }

            return null;
          });

          await Promise.all(promises);

          resolve(response);
        })
        .catch(function (error) {
          console.log("Error While Sending Message", error);

          reject(error);
        });
    } else {
      reject(new Error(`No devices were found to send notification.`));
    }
  });
};

const toObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};
const isValidObjectId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

const handleMail = async (mailTo, title, body, html) => {
  var mailOptions = {
    from: process.env.MAIL,
    to: mailTo,
    subject: title,
    text: body,
    // html: "<p>" + req.body.content + " </p>",
  };

  if (html) {
    mailOptions["html"] = html;
  }

  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error while sending mail: " + error);
    } else {
      console.log("Message sent: %s", info.messageId);
    }
    smtpTransport.close();
  });
};

const createCronJobs = async () => {
  try {
    const assignments = await Assignment.find({ status: "active" });

    const AssignmentArr = assignments.map((assignment) =>
      handleAssignmentCronjob(assignment._id, assignment.dueDate)
    );

    const goals = await Goal.find({ status: "active" })
      .populate("assignments")
      .exec();

    const GoalsArr = goals.map((goal) => {
      handleGoalCronjob(goal?._id, goal.endDate);
      console.log(goal);
      handleScheduleCronJobs(
        goal.assignments,
        goal.notifyBefore,
        goal.intervalType
      );
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

const createNotification = async (data) => {
  try {
    console.log("DATATTA NOTOFICATION", data.title);
    const alreadyExists = await Notification.findOne({
      assignment: data.assignment,
    });
    if (alreadyExists) {
      console.log("alreadyExists");
      return;
    }
    const newNoti = new Notification(data);

    const notificationData = await newNoti.save();

    return notificationData;
  } catch (err) {
    throw new Error(err.message);
  }
};

const handlePastDates = async (data) => {
  try {
    const assignments = await Assignment.updateMany(
      {
        status: "active",
        dueDate: {
          $lt: new Date(),
        },
      },
      { status: "due" }
    );
    const goals = await Goal.updateMany(
      {
        status: "active",
        endDate: {
          $lt: new Date(),
        },
      },
      { status: "due" }
    );

    console.log("updated");
    return assignments;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  handleMongooseError,
  calculateTotalPage,
  calculateSkipDoc,
  getLimit,
  toObjectId,
  isValidObjectId,
  tokenValidation,
  handleScheduleCronJobs,
  sendPushNotification,
  handleMail,
  handleScheduleMail,
  handleAssignmentCronjob,
  handleGoalCronjob,
  createCronJobs,
  handlePastDates,
  handleAssignmentMail,
  handleGoalNotifications,
  handleGoalMails
};
