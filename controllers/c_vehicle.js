var mongoose = require("mongoose");
var mgvehicle = mongoose.model("vehicle");
var assistantmongo = require("./assistantmongo");
var tools = require("../libraries/tools_dev");

//constantes
//objeto de busqueda
var objFind = {};
var config = {};
var paramsGlb = {};
var objReq = { cd: null, message: null, qa_content: null, status: null };
var columns = {
  carNumber: {
    ws: "number",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  vehicleType: {
    ws: "type",
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
  carNumber: { as: "number" },
  vehicleType: { as: "type" },
  amount: { as: "amount" },
};
var columnsWhere = {
  carNumber: { required: true, as: "carNumber", type: "STRING", where: "=" },
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
    mgvehicle,
    columns,
    colsShow,
    null,
    config
  );
};

//services POST == PUT
exports.post = function (req, res) {
  objReq = { cd: "error", message: null, qa_content: null, status: null };
  var params = req.body;
  paramsGlb = params;
  if (params.number == null || params.type == null || params.amount == null) {
    objReq.message = "Envia los parametros obligatorios (number,type)";
    objReq.qa_content = null;
    return res.status(200).send(objReq);
  } else {
    var objFind = {
      carNumber: params.number,
    };

    var objSet = {
      number: params.number,
      type: params.type,
      amount: params.amount,
    };

    return assistantmongo.post(
      res,
      columns,
      objSet,
      objReq,
      mgvehicle,
      null,
      false,
      null,
      objFind,
      false
    );
  }
};
