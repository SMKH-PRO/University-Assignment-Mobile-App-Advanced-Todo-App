const globalHelpers = require("./../../Utils/globalHelpers");
const validateNotificationToken = (body) => {
  if (!body.token) {
    return "token is required";
  }
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

module.exports = { validateNotificationToken };
