var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    firstName: { type: String,  maxLength: 50 },
    lastName: { type: String,  maxLength: 50 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    loginType: {
      type: String,
      required: true,
      enum: ["email", "google", "facebook", "apple"],
      default: "email",
    },
    imageUrl: { type: String },
    socialId: { type: String },
    passwordHash: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["active", "banned"],
      default: "active",
    },
    role: {
      type: String,
      required: true,
      enum: ["normal", "admin"],
      default: "normal",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
