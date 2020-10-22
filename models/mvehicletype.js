var mongoose = require("mongoose");
Schema = mongoose.Schema;

var vehiclestypes = new Schema({
  name: { type: String },
  amount: { type: Number },
});

module.export = mongoose.model("vehiclestype", vehiclestypes);
