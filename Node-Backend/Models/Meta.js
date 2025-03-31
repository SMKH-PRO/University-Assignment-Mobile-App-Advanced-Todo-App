var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MetaSchema = new Schema(
  {
    term: { type: String, required: true },
    privacy: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Meta", MetaSchema);
