var masistente = require("../models/massistant");
var tools = require("../libraries/tools_dev");
var msjError = "";
var debuger = false; //muestra o no errores al programador en el servicio

//Customizacion de Respuesta
var cdsuccess = "ok";
var cderror = "error";
//get
var getMsj = "Datos Obtenidos";
var getMsjEmpty = "No se encontro ningun registro";
//post
var postMsj = "Insertado con exito";
var idInsert = "id";
//put
exports.putMsj = "Actualizado con exito";
var putMsjAffected0 = "Ningun registro actualizado";
var affectedRows = "afectados";
//del
var delMsj = "Eliminado con exito";
//tools
var msjResVal = "";

//Variable Banderas Recursivas
var resPostGlb = [];
var dataDetail = 0;
var countDetail = 0;
//Variable Temp Recursiva
var tableRecu;
var columnsRecu;
var paramsRecu;
var objReqRecu;
var detalleRecu;
var valJsonRecu;
var nextFunctionRecu;
var typeRecu;

//GET
exports.call = function (
  res,
  procedure,
  colsWhere,
  params,
  objReq,
  nextFunction = null,
  fullData = false
) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //validacion de pais
  var pais = "0";
  if (tools.empty(params.pais)) {
    objReq.message = "El pais es obligatorio";
    return res.status(200).send(objReq);
  } else {
    pais = params.pais + "";
  }

  //valida campos obligatorios si no tiene configurado obtener todos
  if (!valPrc(params, colsWhere)) {
    objReq.message = msjError;
    return res.status(200).send(objReq);
  }

  for (const [key, val] of Object.entries(colsWhere)) {
    var prm = params[key];
    procedure = procedure.replaceAll("@" + key, prm);
  }

  masistente.call(pais + "", procedure, function (error, data) {
    if (error == null) {
      if (!tools.empty(data)) {
        objReq.cd = cdsuccess;
        objReq.message = getMsj;

        if (data[0] != null) {
          if (fullData) {
            objReq.qa_content = data;
          } else {
            objReq.qa_content = data[0];
          }
        } else {
          objReq.qa_content = data;
        }

        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      } else {
        if (nextFunction !== null) {
          objReq.qa_content = data;
          nextFunction(res, objReq);
        } else {
          objReq.cd = cdsuccess;
          objReq.message = getMsjEmpty;
          return res.status(200).send(objReq);
        }
      }
    } else {
      if (debuger) {
        objReq.message = error;
      }
      return res.status(200).send(objReq);
    }
  });
};
exports.get = function (
  res,
  table,
  columns,
  colsWhere,
  colsShow,
  params,
  config,
  objReq,
  manyToMany = null,
  nextFunction = null
) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //validacion de pais
  if (tools.empty(params.pais)) {
    objReq.message = "El pais es obligatorio";
    return res.status(200).send(objReq);
  }

  //valida campos obligatorios si no tiene configurado obtener todos
  if (!valGet(config, columns, params, colsWhere)) {
    objReq.message = msjError;
    return res.status(200).send(objReq);
  }

  masistente.sel(params, table, columns, colsShow, colsWhere, function (
    error,
    data
  ) {
    if (error == null) {
      if (!tools.empty(data)) {
        objReq.cd = cdsuccess;
        objReq.message = getMsj;
        objReq.qa_content = data;
        if (!tools.empty(manyToMany)) {
          objReq.qa_content = addManyToMany(data, manyToMany, colsShow);
        }

        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      } else {
        if (nextFunction !== null) {
          objReq.qa_content = data;
          nextFunction(res, objReq);
        } else {
          objReq.cd = cdsuccess;
          objReq.message = getMsjEmpty;
          return res.status(200).send(objReq);
        }
      }
    } else {
      if (debuger) {
        objReq.message = error;
      }
      return res.status(200).send(objReq);
    }
  });
};
function valGet(config, columns, params, colsWhere) {
  /*
    Si no estan los parametros obligatorios y 
    no tiene permiso de obtener todos da error
    */
  if (config.getAll == false) {
    var paramsRequires = {};
    var paramsTotal = {};
    var colsWhereStr = "";
    for (const [colwhere, vars] of Object.entries(colsWhere)) {
      //No es especial
      if (columns[colwhere] != null) {
        if (vars.required == true)
          paramsRequires[columns[colwhere]["ws"]] =
            params[columns[colwhere]["ws"]];

        if (!tools.empty(params[columns[colwhere]["ws"]]))
          paramsTotal[columns[colwhere]["ws"]] =
            params[columns[colwhere]["ws"]];

        colsWhereStr +=
          (colsWhereStr == "" ? "" : ",") + columns[colwhere]["ws"];

        //Es especial
      } else if (colwhere == "@limit" || colwhere == "@limitblock") {
        if (params[colwhere] == null) {
          colsWhereStr += (colsWhereStr == "" ? "" : ",") + colwhere;
        } else if (!tools.empty(params[colwhere])) {
          paramsTotal[colwhere] = colwhere;
        }
      }
    }

    if (!tools.empty(paramsRequires)) {
      var empList = tools.emptyList(paramsRequires);
      if (empList.empty) {
        msjError = empList.message;
        return false;
      }
    }

    if (tools.empty(paramsTotal)) {
      msjError =
        "Envia al menos un parametro de los siguientes: [" + colsWhereStr + "]";
      return false;
    }
  }

  return true;
}
function valPrc(params, colsWhere) {
  var paramsRequires = {};
  for (const [colwhere, vars] of Object.entries(colsWhere)) {
    if (vars.required == true) {
      paramsRequires[colwhere] = params[colwhere];
    }
  }

  if (!tools.empty(paramsRequires)) {
    var empList = tools.emptyList(paramsRequires);
    if (empList.empty) {
      msjError = empList.message;
      return false;
    }
  }

  return true;
}
function addManyToMany(data, manyToMany, colsShow) {
  dataRes = [];
  for (const [keyRow, row] of Object.entries(data)) {
    for (const [keyMany, many] of Object.entries(manyToMany)) {
      var objMtM = {};
      var ids = [];
      var vals = [];
      var idsStr = "";
      var valsStr = "";

      var key = colsShow[many.fk]["as"];
      if (!tools.empty(row[key])) {
        var keysStr = row[key] + "";
        idsStr = keysStr.replaceAll(many.charKey, many.charKeyRpl);
        if (!keysStr.includes(many.charKey)) {
          ids[0] = keysStr;
        } else {
          ids = keysStr.split(many.charKey);
        }
      }

      var val = colsShow[many.val]["as"];
      if (!tools.empty(row[val])) {
        var valStr = row[val] + "";
        valsStr = valStr.replaceAll(many.charStr, many.charStrRpl);
        if (!valStr.includes(many.charStr)) {
          vals[0] = valStr;
        } else {
          vals = valStr.split(many.charStr);
        }
      }
      //Crea objeto MtM
      for (i = 0; i < ids.length; i++) {
        objMtM[i] = { id: ids[i], val: vals[i] };
      }

      row[key] = idsStr;
      row[val] = valsStr;
      row[many.as] = objMtM;
    }

    dataRes[keyRow] = row;
  }

  return dataRes;
}
//PUT
exports.put = function (
  res,
  table,
  columns,
  params,
  objReq,
  valJson = true,
  nextFunction = null,
  customWhere = null,
  showAffected = true
) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //validacion de pais
  if (tools.empty(params.pais)) {
    objReq.message = "El pais es obligatorio";
    if (nextFunction !== null) {
      nextFunction(res, objReq);
    } else {
      return res.status(200).send(objReq);
    }
  }

  var size = 0;
  for (const [columna, row] of Object.entries(columns)) {
    //valida si trae la llave primaria
    if (row.key == "pk") {
      if (customWhere == null) {
        if (tools.empty(params[row.ws])) {
          objReq.message = "Envia " + row.ws + " es un parametro obligatorio";
          if (nextFunction !== null) {
            nextFunction(res, objReq);
          } else {
            return res.status(200).send(objReq);
          }
        }
      } else {
        size++;
      }
    }
    //valida si no esta editando llaves foraneas
    if (row.updated != null && row.updated == false) {
      if (!tools.empty(params[row.ws])) {
        objReq.message = "No puedes editar " + row.ws + " esta prohibido";
        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      }
    }
    // valida si las columnas obligatorias son enviadas
    if (row.forceupd != null && row.forceupd == true) {
      if (tools.empty(params[row.ws])) {
        objReq.message = "El parametro " + row.ws + " es obligatorio";
        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      }
    }

    var valueParam = params[row.ws];
    if (valueParam != null) {
      size++;
    }
  }

  //verifica que al menos venga un parametro para actualizar
  if (size < 2) {
    objReq.message = "Envia un parametro para actualizar";
    if (nextFunction !== null) {
      nextFunction(res, objReq);
    } else {
      return res.status(200).send(objReq);
    }
  }

  //Valid
  /*
    if(valJson){
        if(!valStrucDataJson(columns,params)){
            objReq.message = msjResVal;
            return res.status(200).send(objReq);
        }
    }*/

  //actualiza registro
  masistente.update(params, table, columns, customWhere, function (
    error,
    data
  ) {
    if (error == null) {
      if (!tools.empty(data)) {
        objReq.cd = cdsuccess;
        objReq.message = exports.putMsj;
        exports.putMsj = "Actualizado con exito";
        objReq.qa_content = null;
        if (showAffected)
          objReq.qa_content = { [affectedRows]: data.affectedRows };

        if (data.affectedRows == "0") {
          objReq.message = putMsjAffected0;
        }
        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      } else {
        objReq.cd = cdsuccess;
        objReq.message = "No se actualizo ningun registro";
        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      }
    } else {
      if (debuger) {
        objReq.message = error;
      }
      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    }
  });
};
//POST
exports.post = function (
  res,
  table,
  columns,
  params,
  objReq,
  valJson = true,
  nextFunction = null
) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //Valid
  if (valJson) {
    if (!valStrucDataJson(columns, params)) {
      objReq.message = msjResVal;
      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    }
  }

  //validacion de pais
  if (tools.empty(params.pais)) {
    objReq.message = "El pais es obligatorio";
    if (nextFunction !== null) {
      nextFunction(res, objReq);
    } else {
      return res.status(200).send(objReq);
    }
  }

  //valida si trae todos las columnas obligatorias
  for (const [columna, row] of Object.entries(columns)) {
    if (row.default == "") {
      if (tools.empty(params[row.ws])) {
        objReq.message = "Envia " + row.ws + " es un parametro obligatorio";
        return res.status(200).send(objReq);
      }
    }
  }

  //inserta registro
  masistente.insert(params, table, columns, function (error, data) {
    if (error == null) {
      if (!tools.empty(data)) {
        objReq.cd = cdsuccess;
        objReq.message = postMsj;
        objReq.qa_content = { [idInsert]: data };

        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      } else {
        objReq.cd = cderror;
        objReq.message = "No enviaste datos validos";
        if (nextFunction !== null) {
          nextFunction(res, objReq);
        } else {
          return res.status(200).send(objReq);
        }
      }
    } else {
      if (debuger) {
        objReq.message = error;
      }

      if (nextFunction !== null) {
        nextFunction(res, objReq);
      } else {
        return res.status(200).send(objReq);
      }
    }
  });
};
//DELETE
exports.delete = function (
  res,
  table,
  columns,
  params,
  objReq,
  valJson = true
) {
  msjError = "";
  //limpia objeto
  objReq.qa_content = null;

  //validacion de pais
  if (tools.empty(params.pais)) {
    objReq.message = "El pais es obligatorio";
    return res.status(200).send(objReq);
  }

  //valida si trae la llave primaria
  var pkName = "";
  var pkValue = "";

  for (const [columna, row] of Object.entries(columns)) {
    if (row.key == "pk") {
      if (tools.empty(params[row.ws])) {
        objReq.message = "Envia " + row.ws + " es un parametro obligatorio";
        return res.status(200).send(objReq);
      } else {
        pkName = columna;
        pkValue = params[row.ws];
      }
    }
  }

  //cambia estado a registro
  //TODO: validar si existe antes de eliminar
  masistente.delete(table, params, pkName, pkValue, function (error, data) {
    if (error == null) {
      if (!tools.empty(data)) {
        objReq.cd = cdsuccess;
        objReq.message = delMsj;
        return res.status(200).send(objReq);
      } else {
        objReq.cd = cderror;
        objReq.message = "No se enviaron datos validos";
        return res.status(200).send(objReq);
      }
    } else {
      if (debuger) {
        objReq.message = error;
      }
      return res.status(200).send(objReq);
    }
  });
};

//POST PUT RECURSIVE
exports.paramsRecursive = null;
exports.recursive = function (
  res,
  table,
  columns,
  params,
  objReq,
  detalle = "detalle",
  valJson = true,
  nextFunction = null,
  type = 1
) {
  if (!tools.empty(params[detalle])) {
    if (countDetail == 0) {
      tableRecu = table;
      columnsRecu = columns;
      paramsRecu = params;
      objReqRecu = objReq;
      detalleRecu = detalle;
      valJsonRecu = valJson;
      nextFunctionRecu = nextFunction;
      typeRecu = type;
      var arrDetail = params[detalle];
      dataDetail = arrDetail.length;
    }

    if (countDetail < dataDetail) {
      var paramsEdit = params;
      var arrDetail = params[detalle][countDetail];
      var paramsRealy = merche(paramsEdit, arrDetail); //Une dos objetos

      //construye post inteligente
      if (type == 1) {
        //Uno es post
        exports.post(
          res,
          table,
          columns,
          paramsRealy,
          objReq,
          valJson,
          exports.concatRest
        );
      } else {
        //Otro es put
        exports.put(
          res,
          table,
          columns,
          paramsRealy,
          objReq,
          valJson,
          exports.concatRest
        );
      }
    } else {
      //Construye respuesta de salida
      objReq.cd = cdsuccess;
      objReq.message = postMsj;
      objReq.qa_content = resPostGlb;

      //limpia variables
      resPostGlb = [];
      dataDetail = 0;
      countDetail = 0;

      //Devuelve resultado
      nextFunction(res, objReq);
    }
  } else {
    nextFunction(res, objReq);
  }
};
exports.concatRest = function (res, objReq) {
  resPostGlb.push(objReq["qa_content"]);
  countDetail = countDetail + 1; //Aumenta interacion de recursividad
  exports.recursive(
    res,
    tableRecu,
    columnsRecu,
    paramsRecu,
    objReqRecu,
    detalleRecu,
    valJsonRecu,
    nextFunctionRecu,
    typeRecu
  );
};

//TOOLS
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
    var update = row.updated == null ? true : row.updated;

    if (type.toUpperCase() == "INT") type = "integer";
    if (type.toUpperCase() == "VARCHAR") type = "string";
    if (type.toUpperCase() == "DECIMAL") type = "number";

    properties[row.ws] = { type: type };

    //Solo si es VARCHAR le asigna el valor de tamaño maximo
    if (type.toUpperCase() == "VARCHAR")
      properties[row.ws] = { type: type, maxLength: length };

    if (def == "" && update) required.push(row.ws);
  }

  return { properties: properties, required: required };
}
function merche(obj, src) {
  Object.keys(src).forEach(function (key) {
    obj[key] = src[key];
  });
  return obj;
}
