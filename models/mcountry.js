var mongoose = require("mongoose");
Schema = mongoose.Schema;

var country = new Schema({
  nombre: { type: String },
  id: { type: String },
});

module.export = mongoose.model("country", country);
