var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var GoalSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    dateString: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "deleted", "completed", "due"],
      default: "active",
    },
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    notifyBefore: [
      {
        interval: { type: Number },
        intervalType: { type: String, default: "hours" },
      },
    ],
    notifyViaEmail: {
      type: Boolean,
      required: false,
    },
    notifyViaNotification: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Goal", GoalSchema);
