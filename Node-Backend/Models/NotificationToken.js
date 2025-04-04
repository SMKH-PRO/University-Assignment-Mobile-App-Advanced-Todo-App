var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotificationTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("NotificationToken", NotificationTokenSchema);
