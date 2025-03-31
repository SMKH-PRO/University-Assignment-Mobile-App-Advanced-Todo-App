const globalHelpers = require("./../../Utils/globalHelpers");
const validateGoal = (body) => {
  if (!body.title) {
    return "title is required";
  }
  // if (!body.details) {
  //   return "details is required";
  // }

  if (!body.startDate) {
    return "start date is required";
  }
  if (!body.endDate) {
    return "end date is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

const validateGoalEdit = (body) => {
  if (!body.title) {
    return "title is required";
  }
  // if (!body.details) {
  //   return "details is required";
  // }

  if (!body.startDate) {
    return "start date is required";
  }
  if (!body.endDate) {
    return "end date is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
  if (!globalHelpers.isValidObjectId(body.goalId)) {
    return "Goal id is invalid";
  }
};

module.exports = { validateGoal, validateGoalEdit };
