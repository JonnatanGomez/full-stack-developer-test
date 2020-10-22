var mongoose = require("mongoose");
var mgvehiclestype = mongoose.model("vehiclestype");
var assistantmongo = require("./assistantmongo");
var tools = require("../libraries/tools_dev");

//constantes
//objeto de busqueda
var objFind = {};
var config = {};
var paramsGlb = {};
var objReq = { cd: null, message: null, qa_content: null, status: null };
var columns = {
  name: {
    ws: "name",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  amount: {
    ws: "amount",
    key: "",
    type: "DECIMAL",
    length: 11,
    default: "",
    show: true,
  },
};
var colsShow = {
  name: { as: "name" },
  amount: { as: "amount" },
};

exports.get = function (req, res) {
  //Objeto Request
  objReq = { cd: null, message: null, qa_content: null, status: null };
  objReq.cd = "error";
  objReq.message = "No se pudo obtener ningun registro";
  //objeto de busqueda
  paramsGlb = req.query;
  objFind = {
    carNumber: paramsGlb.number,
  };
  config = {};
  config.getAll = false;

  //Llamada a mongo
  return assistantmongo.get(
    res,
    objFind,
    objReq,
    mgvehiclestype,
    columns,
    colsShow,
    null,
    config
  );
};
