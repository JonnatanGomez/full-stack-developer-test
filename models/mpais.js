var mongoose = require("mongoose");
Schema = mongoose.Schema;

var pais = new Schema({
  nombre: { type: String },
  id: { type: String },
});

module.export = mongoose.model("pai", pais);
