var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotificationSchema = new Schema(
  {
    title: { type: String, required: true },
    body: {
      type: String,
      required: true,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
    },

    user: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "read"],
      default: "active",
    },
    type: {
      type: String,
      default: "Assignment",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Notification", NotificationSchema);
