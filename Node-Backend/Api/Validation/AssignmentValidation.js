const globalHelpers = require("./../../Utils/globalHelpers");
const validateAssignment = (body) => {
  if (!body.title) {
    return "title is required";
  }
  // if (!body.details) {
  //   return "details is required";
  // }
  if (!body.dueDate) {
    return "due date is required";
  }
  if (!globalHelpers.isValidObjectId(body.subject)) {
    return "subject is invalid";
  }
  // if (!globalHelpers.isValidObjectId(body.type)) {
  //   return "assignment type is invalid";
  // }
 
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

const validateAssignmentEdit = (body) => {
  if (!body.title) {
    return "title is required";
  }
  // if (!body.details) {
  //   return "details is required";
  // }
  if (!body.dueDate) {
    return "due date is required";
  }
  if (!globalHelpers.isValidObjectId(body.subject)) {
    return "subject is invalid";
  }
  // if (!globalHelpers.isValidObjectId(body.type)) {
  //   return "assignment type is invalid";
  // }
 
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
  if (!globalHelpers.isValidObjectId(body.assignmentId)) {
    return "assignment id is invalid";
  }
};

const validateCompleted = (body) => {
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
  if (!globalHelpers.isValidObjectId(body.assignmentId)) {
    return "assignment id is invalid";
  }
};

module.exports = { validateAssignment, validateAssignmentEdit, validateCompleted };
