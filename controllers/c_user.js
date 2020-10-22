var mongoose = require("mongoose");
var mguser = mongoose.model("user");
var jwt = require("jsonwebtoken");
var assistantmongo = require("./assistantmongo");
var config = require("../configs/config");

//constantes
var objReq = { cd: null, message: null, qa_content: null, status: null };
var paramsGlb = {};
var columns = {
  user: {
    ws: "user",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
  pass: {
    ws: "pass",
    key: "",
    type: "STRING",
    length: 11,
    default: "",
    show: true,
  },
};
var columnsShow = {
  user: { as: "user" },
};
var columnsWhere = {
  user: { required: true, as: "user", type: "STRING", where: "=" },
  pass: {
    required: true,
    as: "pass",
    type: "STRING",
    where: "=",
  },
};

exports.get = function (req, res) {
  //Asigna valor a variable obtenida
  var data = req.query;
  //Objeto Request
  objReq = { cd: null, message: null, qa_content: null, status: null };
  objReq.cd = "error";
  objReq.message = "No se pudo obtener ningun registro";

  if (data.user != null && data.pass != null) {
    var user = data.user;
    var pass = data.pass;
    paramsGlb = data;
    var objFind = {};
    objFind.user = user;
    objFind.pass = pass;
    //Llamada a mongo
    assistantmongo.get(
      res,
      objFind,
      objReq,
      mguser,
      columns,
      columnsShow,
      exports.showResult, //callback
      false, //getAll
      columnsWhere
    );
  } else {
    return res.status(200).send(resGlb);
  }
};

exports.showResult = function (res, data) {
  var result = data;
  var response = {};
  if (result.qa_content[0] != null) {
    var user = result.qa_content[0];
    const payload = {
      check: true,
    };

    const token = jwt.sign(payload, config.llave, {
      expiresIn: 3000, //6 HORAS
    });

    objReq.cd = "ok";
    objReq.message = "Login Success";
    response.token = token;
    response.user = paramsGlb.user;
    objReq.qa_content = response;
    return res.status(200).send(objReq);
  }
  objReq.cd = "error";
  objReq.message = "Login invalid credentials";
  response.token = null;
  objReq.qa_content = response;
  return res.status(200).send(objReq);
};
