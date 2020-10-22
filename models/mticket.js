var mongoose = require("mongoose");
const { DateTime } = require("mssql");
Schema = mongoose.Schema;

var tickets = new Schema({
  user: { type: String },
  timeOut: { type: Date },
  timeStart: { type: Date },
  minutes: { type: Number },
  vehicles: { type: String },
  amount: { type: Number },
  carNumber: { type: String },
  total: { type: Number },
});

module.export = mongoose.model("ticket", tickets);
