var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ForgotPasswordSchema = new Schema(
  {
    code: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ForgotPassword", ForgotPasswordSchema);
