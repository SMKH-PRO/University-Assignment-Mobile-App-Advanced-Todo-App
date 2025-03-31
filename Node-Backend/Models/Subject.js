var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SubjectSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String},
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Subject", SubjectSchema);
