var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String },
    dueDate: { type: Date },
    dateString: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    type: { type: Schema.Types.ObjectId, ref: "AssignmentType" },
    status: {
      type: String,
      required: true,
      enum: ["active", "deleted", "completed", "due"],
      default: "active",
    },
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
module.exports = mongoose.model("Assignment", AssignmentSchema);
