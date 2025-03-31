const User = require("./../../Models/User");
const globalHelpers = require("./../../Utils/globalHelpers");

const validateUser = async (body) => {
  if (!body.firstName) {
    return "first name is required";
  }
  if (!body.lastName) {
    return "last name is required";
  }
  if (!body.email) {
    return "email is required";
  }

  if (!body.password) {
    return "password is required";
  }

  const user = await User.findOne({ email: body.email, loginType: 'email' });
  if (user) {
    return "email address already in use by another account";
  }
};
const validateLogin = async (body) => {
  if (!body.email) {
    return "email is required";
  }

  if (!body.password) {
    return "password is required";
  }
};

const validateEditUser = (body) => {
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
};

const validateSocial = async (body) => {
  if (!body.loginType) {
    return "Login Type is required";
  }
  if (!body.socialId) {
    return "Social Id is required";
  }
};
const validateForgotPassword = (body) => {
  if (!body.email) {
    return "Email is required";
  }
};

const validateConfirmCode = (body) => {
  if (!body.fpId) {
    return "Something went wrong";
  }
  if (!body.code) {
    return "code is required";
  }
};

const validateReset = (body) => {
  if (!globalHelpers.isValidObjectId(body.user)) {
    return "User id is invalid";
  }
  if (!body.password) {
    return "Password is required";
  }
  if (!body.confirmPassword) {
    return "Confirm Password is required";
  }
}
module.exports = {
  validateUser,
  validateLogin,
  validateEditUser,
  validateSocial,
  validateForgotPassword,
  validateConfirmCode,
  validateReset
};
