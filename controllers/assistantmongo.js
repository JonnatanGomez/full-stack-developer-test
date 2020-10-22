var tools = require("../libraries/tools_dev");
var msjError = "";
var debug = true; //muestra o no errores al programador en el servicio
var objReqLocal = {};
var varPais = "pais_cl";

//Customizacion de Respuesta
var cdsuccess = "ok";
var cderror = "error";
//get
var getMsj = "Datos Obtenidos";
var getMsjEmpty = "No se encontro ningun registro";
var getMsjEmptyFilters = "No se envio ningun filtro";
var getMsjStruct = "Problemas en el llamado del servicio, revisa la llamada";
//post
var postMsj = "Insertado con exito";
var idInsert = "id";
//put
exports.putMsj = "Actualizado con exito";
var putMsjAffected0 = "Ningun registro actualizado";
var putMsjError = "Problemas al actualizar";
var putMsjNotFount = "Registro no encontrado";
var affectedRows = "afectados";
var ObjKeyLocal = {};
var typeUpdateLocal = 1; //{1:"Add",2:"Set",3:"Unset"}
//post
var msjPostSuccess = "Insertado con exito";
var msjPostError = "Problemas al insertar";
//del
var delMsj = "Eliminado con exito";
//tools
var msjResVal = "";

//GET
exports.get = function (
  res,
  objFind,
  objReq,
  objMongo,
  columns,
  colsShow,
  nextFunction = null,
  getAll = null,
  columnsWhere = null
) {
  var objFindEnd = objFind;

  var colsSel = {};
  if (!tools.empty(columns)) {
    for (const [key, column] of Object.entries(columns)) {
      colsSel[key] = column["show"];
    }
  }

  //Valida esten los valores requeridos
  if (getAll == null || getAll == false) {
    if (null != columnsWhere) {
      var objFindTwo = {};
      for (const [key, row] of Object.entries(columnsWhere)) {
        var wsFind = key;
        if (row["as"] != null) wsFind = row["as"];

        var valueParam = objFindEnd[wsFind];

        if (
          !tools.empty(valueParam) &&
          row["type"] != null &&
          row["type"] == "INTEGER"
        )
          valueParam = parseInt(objFindEnd[wsFind], 10);

        if (
          !tools.empty(valueParam) &&
          row["where"] != null &&
          row["where"] == "LIKE"
        )
          valueParam = { $regex: ".*" + valueParam + ".*", $options: "i" };

        if (
          !tools.empty(valueParam) &&
          row["where"] != null &&
          row["where"] == "ARRAY"
        )
          valueParam = { $in: valueParam };

        if (row["required"] != null && row["required"] == true) {
          if (tools.empty(objFindEnd[wsFind])) {
            objReq.cd = cderror;
            objReq.message =
              "El parametro " + wsFind + " es requerido enviarlo";
            return res.status(200).send(objReq);
          } else {
            objFindTwo[key] = valueParam;
          }
        } else {
          if (!tools.empty(valueParam)) {
            objFindTwo[key] = valueParam;
          }
        }
      }
      objFindEnd = objFindTwo; //Asigna con los valores verdaderos
    } else {
      if (tools.empty(objFindEnd)) {
        objReq.cd = cderror;
        objReq.message = getMsjEmptyFilters;
        return res.status(200).send(objReq);
      }
    }
  }

  // colsSel = {};
  console.log(objFindEnd);
  objMongo.find(objFindEnd, colsSel, function (err, rows) {
    if (rows) {
      var rowsRes = [];
      if (!tools.empty(colsShow)) {
        for (const [key, row] of Object.entries(rows)) {
          var rowRes = {};
          for (const [col, colum] of Object.entries(colsShow)) {
            var as = colum["as"];
            rowRes[as] = row[col];
          }
          rowsRes.push(rowRes);
        }
      } else {
        rowsRes = rows;
      }
      objReq.cd = cdsuccess;
      objReq.message = getMsj;
      objReq.qa_content = rowsRes;

      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    } else {
      objReq.cd = cderror;
      objReq.message = getMsjEmpty;
      if (err) {
        if (debug) {
          objReq.message = err;
          console.log(err);
        }
      }

      return res.status(200).send(objReq);
    }
  });
};
exports.getAggregate = function (
  res,
  objFind,
  objReq,
  objMongo,
  columns,
  colsShow,
  nextFunction = null,
  getAll = null,
  columnsWhere = null
) {
  objMongo.aggregate(objFind, function (err, rows) {
    if (rows) {
      var rowsRes = [];
      if (!tools.empty(colsShow)) {
        for (const [key, row] of Object.entries(rows)) {
          var rowRes = {};
          for (const [col, colum] of Object.entries(colsShow)) {
            var as = colum["as"];
            rowRes[as] = row[col];
          }
          rowsRes.push(rowRes);
        }
      } else {
        rowsRes = rows;
      }
      objReq.cd = cdsuccess;
      objReq.message = getMsj;
      objReq.qa_content = rowsRes;

      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    } else {
      objReq.cd = cderror;
      objReq.message = getMsjEmpty;
      if (err) {
        if (debug) {
          objReq.message = err;
          console.log(err);
        }
      }

      return res.status(200).send(objReq);
    }
  });
};
exports.getPopulate = function (
  res,
  objFind,
  colsSel,
  ObjPopulate,
  objReq,
  objMongo,
  nextFunction,
  sort = null
) {
  objMongo
    .find(objFind, colsSel, sort)
    .populate(ObjPopulate)
    .exec(function (err, rows) {
      objReq.cd = cdsuccess;
      objReq.message = getMsj;
      objReq.qa_content = rows;

      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    });
};
//PUT
exports.put = function (
  res,
  columns,
  params,
  objReq,
  objMongo,
  typeUpdate = null,
  valJson = true,
  nextFunction = null
) {
  // if(valJson){
  //     if(!valStrucDataJson(columns,params)){
  //         objReq.message = msjResVal;
  //         return res.status(200).send(objReq);
  //     }
  // }

  //Valida esten los valores requeridos
  if (!val(params, columns, objReq)) {
    return res.status(200).send(objReqLocal);
  }

  if (tools.empty(typeUpdate)) typeUpdate = typeUpdateLocal;

  objMongo.findOne(ObjKeyLocal, function (err, row) {
    if (row) {
      switch (typeUpdate) {
        case 2:
          row = set(row, columns, params);
          break;
        case 3:
          row = unset(row, columns, params);
          break;
        default:
          //1
          row = add(row, columns, params);
      }

      row.save(function (err, response) {
        if (!err) {
          objReq.cd = cdsuccess;
          objReq.message = exports.putMsj;

          if (debug) console.log(objReq); // muestra data si esta en debug

          if (nextFunction !== null) {
            nextFunction(res, objReq);
          } else {
            return res.status(200).jsonp(objReq);
          }
        } else {
          objReq.cd = cderror;
          objReq.message = putMsjError;
          if (debug) {
            objReq.message = err;
            console.log(err);
          }
          return res.status(200).send(objReq);
        }
      });
    } else {
      objReq.cd = cderror;
      objReq.message = putMsjNotFount;

      if (debug) console.log(err);

      return res.status(200).send(objReq);
    }
  });
};
//POST
exports.post = function (
  res,
  columns,
  params,
  objReq,
  objMongo,
  typeUpdate = null,
  valJson = true,
  nextFunction = null,
  keysForce = null,
  valPais = true
) {
  if (valJson) {
    if (!valStrucDataJson(columns, params)) {
      objReq.message = msjResVal;
      return res.status(200).send(objReq);
    }
  }

  //Valida esten los valores requeridos
  if (keysForce == null) {
    if (!val(params, columns, objReq, valPais)) {
      return res.status(200).send(objReqLocal);
    } else {
      if (tools.empty(ObjKeyLocal)) {
        ObjKeyLocal._id = null;
      }
    }
  } else {
    ObjKeyLocal = keysForce;
  }

  objMongo.findOne(ObjKeyLocal, function (err, row) {
    if (row) {
      switch (typeUpdate) {
        case 2:
          row = set(row, columns, params);
          break;
        case 3:
          row = unset(row, columns, params);
          break;
        default:
          //1
          row = add(row, columns, params);
      }

      row.save(function (err, row) {
        if (!err) {
          objReq.cd = cdsuccess;
          objReq.message = exports.putMsj;
          objReq.qa_content = { _id: row._id };
          if (debug) console.log(objReq); // muestra data si esta en debug
          if (nextFunction !== null) {
            nextFunction(res, objReq);
          } else {
            return res.status(200).jsonp(objReq);
          }
        } else {
          objReq.cd = cderror;
          objReq.message = putMsjError;
          if (debug) {
            objReq.message = err;
            console.log(err);
          }
          return res.status(200).send(objReq);
        }
      });
    } else {
      var newObjMongo = new objMongo(ObjKeyLocal);

      switch (typeUpdate) {
        case 2:
          newObjMongo = set(newObjMongo, columns, params);
          break;
        case 3:
          newObjMongo = unset(newObjMongo, columns, params);
          break;
        default:
          //1
          newObjMongo = add(newObjMongo, columns, params);
      }
      //Stop
      newObjMongo.save(function (err, rowSvc) {
        if (err) {
          objReq.cd = cderror;
          objReq.message = msjPostError;
          if (debug) console.log(err);
          return res.status(200).jsonp(objReq);
        } else {
          objReq.cd = cdsuccess;
          objReq.message = msjPostSuccess;
          objReq.qa_content = { _id: newObjMongo._id };
          if (nextFunction !== null) {
            nextFunction(res, objReq);
          } else {
            return res.status(200).jsonp(objReq);
          }
        }
      });
    }
  });
};

var count = 0;
var lenght = 0;

var columsnR = null;
var paramsR = null;
var objReqR = null;
var objMongoR = null;
var typeUpdateR = null;
var valJsonR = null;
var nextFunctionR = null;
var valPaisR = null;
var keysForceR = null;
var colsUpdR = null;
var idsRes = [];

exports.postRecursive = function (
  res,
  columns,
  params,
  objReq,
  objMongo,
  typeUpdate = null,
  valJson = true,
  nextFunction = null,
  keysForce = null,
  valPais = true,
  colsUpd = null
) {
  //Values
  count = 0;
  idsRes = [];
  lenght = params.length;
  //Params
  columsnR = columns;
  paramsR = params;
  objReqR = objReq;
  objMongoR = objMongo;
  typeUpdateR = typeUpdate;
  valJsonR = valJson;
  nextFunctionR = nextFunction;
  valPaisR = valPais;
  colsUpdR = colsUpd;
  keysForceR = keysForce;
  recursive(res, null);
};
function recursive(res, data) {
  if (data != null && data.qa_content != null) idsRes.push(data.qa_content);

  if (count < lenght) {
    var val = paramsR[count];
    var paramsRow = {
      [colsUpdR]: val,
    };
    count++;
    exports.post(
      res,
      columsnR,
      paramsRow,
      objReqR,
      objMongoR,
      typeUpdateR,
      valJsonR,
      recursive,
      keysForceR,
      valPaisR
    );
  } else {
    objReqR.cd = "ok";
    objReqR.message = "Insertado con exito";
    objReqR.qa_content = idsRes;
    nextFunctionR(res, objReqR);
  }
}

//DELETE
//TODO: Desarrrollar metodo DELETE

//TOOLS
function unset(obj, columns, params) {
  for (const [columna, row] of Object.entries(columns)) {
    if (row.key != "pk") {
      if (!tools.empty(params[row.ws])) {
        var list = obj[columna];
        for (var i = 0; i < list.length; i++) {
          var valWs = params[row.ws];
          if (list[i] == valWs) {
            list.splice(i, 1);
            i--;
          }
        }
        obj[columna] = list;
      }
    }
  }
  return obj;
}
function set(obj, columns, params) {
  for (const [columna, row] of Object.entries(columns)) {
    if (row.key != "pk") {
      // if(!tools.empty(params[row.ws])){
      var valWs = params[row.ws];
      obj[columna] = valWs;
      // }
    }
  }
  return obj;
}
function add(obj, columns, params) {
  for (const [columna, row] of Object.entries(columns)) {
    if (row.key != "pk") {
      if (!tools.empty(params[row.ws])) {
        var list = obj[columna];
        var valWs = params[row.ws];

        //Si no esta ingresado en la DB
        if (
          row.constraint != null &&
          (row.constraint == "UNIQUE" || row.constraint == "unique")
        ) {
          //Si no esta en la lista lo agrega
          if (Array.isArray(list)) if (!list.includes(valWs)) list.push(valWs);
        } else {
          if (Array.isArray(list)) {
            list.push(valWs);
          } else {
            list = valWs;
          }
        }

        obj[columna] = list;
      }
    }
  }
  return obj;
}
function val(params, columns, objReq, valPais) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //validacion de pais
  if (tools.empty(params.pais) && valPais == true) {
    objReq.message = "El pais es obligatorio";
    objReqLocal = objReq;
    return false;
  }

  //valida si trae todos las columnas obligatorias
  for (const [columna, row] of Object.entries(columns)) {
    if (row.default == "") {
      if (tools.empty(params[row.ws])) {
        objReq.message = "Envia " + row.ws + " es un parametro obligatorio";
        objReqLocal = objReq;
        return false;
      }
    }
  }

  var objKey = {};
  for (const [columna, row] of Object.entries(columns)) {
    //valida si trae la llave primaria
    if (row.key == "pk" || row.constraint == "UNIQUE") {
      if (tools.empty(params[row.ws])) {
        objReq.message = "Envia " + row.ws + " es un parametro obligatorio";
        objReqLocal = objReq;
        return false;
      } else {
        objKey[columna] = params[row.ws];
      }
    }
  }

  ObjKeyLocal = objKey;

  return true;
}
function valStrucDataJson(columns, params) {
  var columnsPretty = construcJvn(columns);
  //Valida structura del json
  var resValidate = tools.valStrucJson(params, columnsPretty);
  if (!resValidate.valid) {
    msjResVal = resValidate.msj;
    return false;
  }
  return true;
}
function construcJvn(columns) {
  var properties = {};
  var required = [];
  for (const [columna, row] of Object.entries(columns)) {
    var type = row.type + "";
    var length = row.length + "";
    var def = row.default + "";

    if (type.toUpperCase() == "INT") type = "integer";
    if (type.toUpperCase() == "VARCHAR") type = "string";
    if (type.toUpperCase() == "DECIMAL") type = "number";

    properties[row.ws] = { type: type };

    //Solo si es VARCHAR le asigna el valor de tamaño maximo
    if (type.toUpperCase() == "VARCHAR")
      properties[row.ws] = { type: type, maxLength: length };

    if (def == "") required.push(row.ws);
  }

  return { properties: properties, required: required };
}
