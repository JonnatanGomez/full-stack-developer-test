var mongoose = require("mongoose");
Schema = mongoose.Schema;

var users = new Schema({
  user: { type: String },
  pass: { type: String },
});

module.export = mongoose.model("user", users);
