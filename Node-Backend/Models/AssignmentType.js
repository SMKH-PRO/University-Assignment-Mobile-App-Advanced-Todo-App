var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AssignmentTypeSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: "Global" },
    status: {
      type: String,
      required: true,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("AssignmentType", AssignmentTypeSchema);
