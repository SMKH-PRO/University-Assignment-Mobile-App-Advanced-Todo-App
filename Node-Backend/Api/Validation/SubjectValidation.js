const globalHelpers = require("./../../Utils/globalHelpers");
const validateSubject = (body) => {
  if (!body.title) {
    return "title is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

const validateSubjectEdit = (body) => {
  if (!body.title) {
    return "title is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
  if (!globalHelpers.isValidObjectId(body.subjectId)) {
    return "Subject id is invalid";
  }
};


const validateSubjects = (body) => {
  if (!body.subjects.length) {
    return "Atleast one subject is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

module.exports = { validateSubject, validateSubjects, validateSubjectEdit };
