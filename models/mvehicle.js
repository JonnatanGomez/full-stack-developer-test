var mongoose = require("mongoose");
Schema = mongoose.Schema;

var vehicles = new Schema({
  carNumber: { type: String },
  amount: { type: Number },
  vehicleType: { type: String },
});

module.export = mongoose.model("vehicle", vehicles);
