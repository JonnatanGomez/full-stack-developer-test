var mongoose = require("mongoose");
var mgvehicle = mongoose.model("vehicle");
var mgticket = mongoose.model("ticket");
var assistantmongo = require("./assistantmongo");
var tools = require("../libraries/tools_dev");

//constantes
//objeto de busqueda
var objFind = {};
var config = { getAll: false };
var paramsGlb = {};
var ticketGlb = {};
var objReq = { cd: null, message: null, qa_content: null, status: null };
var columns = {
  user: {
    ws: "user",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  timeOut: {
    ws: "timeOut",
    key: "",
    type: "STRING",
    length: 11,
    default: null,
    show: true,
  },
  timeStart: {
    ws: "timeStart",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  minutes: {
    ws: "minutes",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  vehicles: {
    ws: "vehicles",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  carNumber: {
    ws: "number",
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
  total: {
    ws: "total",
    key: "",
    type: "DECIMAL",
    length: 11,
    default: null,
    show: true,
  },
};
var colsShow = {
  user: { as: "user" },
  timeOut: { as: "timeOut" },
  timeStart: { as: "timeStart" },
  minutes: { as: "minutes" },
  carNumber: { as: "number" },
  amount: { as: "amount" },
  vehicles: { as: "vehicles" },
};

//Columns Vehicle
var columns2 = {
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
var colsShow2 = {
  carNumber: { as: "number" },
  vehicleType: { as: "type" },
  amount: { as: "amount" },
};

var columnsWhere = {
  carNumber: { required: true, as: "carNumber", type: "STRING", where: "=" },
};

//services POST == (Entrar y Salir)
exports.post = function (req, res) {
  //Objeto Request
  objReq = { cd: null, message: null, qa_content: null, status: null };
  objReq.cd = "error";
  objReq.message = "No se pudo obtener ningun registro";

  var params = req.body;
  paramsGlb = params;
  if (params.number == null || params.user == null) {
    objReq.message = "Envia los parametros obligatorios (number,user)";
    objReq.qa_content = null;
    return res.status(200).send(objReq);
  } else {
    //objeto de busqueda
    objFind = {
      carNumber: paramsGlb.number,
    };

    //Llamada a mongo
    return assistantmongo.get(
      res,
      objFind,
      objReq,
      mgvehicle,
      columns2,
      colsShow2,
      exports.getTicket,
      config
    );
  }
};

exports.getTicket = function (res, data) {
  var resVehicle = data;
  if (resVehicle.qa_content[0] != null) {
    paramsGlb.vehicleType = resVehicle.qa_content[0].type;
    paramsGlb.amount = resVehicle.qa_content[0].amount;
    //objeto de busqueda
    objFind = {
      carNumber: paramsGlb.number,
      minutes: 0,
    };
    objReq = { cd: null, message: null, qa_content: null, status: null };
    //Llamada a mongo
    return assistantmongo.get(
      res,
      objFind,
      objReq,
      mgticket,
      columns,
      colsShow,
      exports.saveTicket,
      config
    );
  } else {
    objReq.cd = "error";
    objReq.message = "Vehiculo Inexitente";
    objReq.qa_content = null;
    return res.status(200).send(objReq);
  }
};

exports.saveTicket = function (res, data) {
  var resTicket = data;

  if (resTicket.qa_content[0] != null) {
    var objFind = {
      carNumber: paramsGlb.number,
      minutes: 0,
    };

    ticketGlb = resTicket.qa_content[0];

    var dateNowOutPrm = tools.nowDateTime();

    var minutesPrm = diffTwoDatesMinutes(ticketGlb.timeStart, dateNowOutPrm);
    var totalPrm = minutesPrm * ticketGlb.amount;
    var totalPrmPar = totalPrm.toFixed(2);
    var objSet = {
      timeOut: dateNowOutPrm,
      minutes: minutesPrm,
      total: totalPrmPar,
    };
    ticketGlb.timeOut = dateNowOutPrm;
    ticketGlb.minutes = minutesPrm;
    ticketGlb.total = totalPrmPar;
  } else {
    var objFind = null;
    var objSet = {
      user: paramsGlb.user,
      timeStart: tools.nowDateTime(),
      vehicles: paramsGlb.vehicleType,
      amount: paramsGlb.amount,
      number: paramsGlb.number,
      minutes: 0,
      total: 0,
    };
    ticketGlb = objSet;
  }

  return assistantmongo.post(
    res,
    columns,
    objSet,
    objReq,
    mgticket,
    null,
    false,
    exports.showTicket,
    objFind,
    false
  );
};

exports.showTicket = function (res, data) {
  var resTicket = data;

  if (resTicket.cd == "ok") {
    objReq.cd = "ok";
    objReq.qa_content = ticketGlb;
    return res.status(200).send(data);
  } else {
    return res.status(200).send(data);
  }
};

function diffTwoDatesMinutes(dateOne, dateTwo) {
  var day = new Date(dateOne);
  var meDay = new Date(dateTwo);
  var diffMs = meDay - day; // milliseconds between dateOne & dateTwo
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  return diffMins;
}
