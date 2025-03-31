(bcrypt = require("bcrypt")), (SALT_WORK_FACTOR = process.env.BCRYPT_SALT);
const express = require("express");
const router = express.Router();
const User = require("./../Models/User");
const {validateEditUser, validateReset} = require("./Validation/UserValidation")
router.get("/login", (req, res, next) => {
  try {
    res.json({ success: true, data: "hi" });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    console.log(requestBody)
    const isInvalid = validateEditUser(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }

    const updateQuery = await User.updateOne(
      { _id: requestBody.user },
      requestBody
    );
    const updateValues = await User.findOne({ _id: requestBody.user })
     
    res.json({ success: true, data: updateValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const user = req?.user?._id;
    const requestBody = { ...req.body, user };
    console.log(requestBody)
    const isInvalid = validateReset(requestBody);
    if (isInvalid) {
      throw new Error(isInvalid);
    }
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // hash the password using our new salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const updateQuery = await User.updateOne(
      { _id: requestBody.user },
      {passwordHash: hashedPassword}
    );
    const updateValues = await User.findOne({ _id: requestBody.user })
     
    res.json({ success: true, data: updateValues });
  } catch (e) {
    next({ message: e.message, status: e.status || 400 });
  }
});
module.exports = router;
