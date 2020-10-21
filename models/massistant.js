var db = require("./database");
var tools = require("../libraries/tools_dev");
var debug = true;
//Creacion de objeto
var userModel = {};
var mongosse = require("mongoose");

//@SEL
userModel.call = function (pais, query, callback) {
  var connmysql = db.conn(pais);
  if (connmysql) {
    //construye qry en base a los parametros
    var qry = query;

    if (debug) console.log(qry);

    connmysql.query(qry, function (error, row) {
      if (debug) console.log(qry);

      if (error == null) {
        callback(null, row);
      } else {
        callback("Query failed. Error: " + error + " query: " + qry, null);
      }
      connmysql.end();
    });
  }
};
userModel.sel = function (
  params,
  table,
  columns,
  colsShow,
  colsWhere,
  callback
) {
  var pais = params.pais + "";
  var connmysql = db.conn(pais);
  if (connmysql) {
    //construye qry en base a los parametros
    var qry = constructQrySel(table, columns, colsShow, colsWhere, params);

    if (debug) console.log(qry);

    //TODO: validar si existe la referencia en las llaves foraneas
    connmysql.query(qry, function (error, row) {
      if (debug) console.log(qry);

      if (error == null) {
        callback(null, row);
      } else {
        callback("Query failed. Error: " + error + " query: " + qry, null);
      }
      connmysql.end();
    });
  }
};
function constructQrySel(table, columns, colsShow, colsWhere, params) {
  //Agrega las columnas a mostrar
  var colsStrShow = "";
  if (tools.empty(colsShow)) {
    colsStrShow = "*";
  } else {
    for (const [colShow, vars] of Object.entries(colsShow)) {
      var asvar = colShow;
      if (vars.as != null) asvar = vars.as;

      if (vars.format != null && vars.format == "number") {
        if (vars.charmoney != null) {
          colsStrShow +=
            (colsStrShow == "" ? "" : ",") +
            "CONCAT('" +
            vars.charmoney +
            "',FORMAT(t." +
            colShow +
            ",2)) as '" +
            asvar +
            "'";
        } else {
          colsStrShow +=
            (colsStrShow == "" ? "" : ",") +
            "FORMAT(t." +
            colShow +
            ",2) as '" +
            asvar +
            "'";
        }
      } else if (vars.format != null && vars.format == "date") {
        colsStrShow +=
          (colsStrShow == "" ? "" : ",") +
          "DATE_FORMAT(t." +
          colShow +
          ', "%d/%m/%Y") as \'' +
          asvar +
          "'";
      } else {
        if (vars.concatInit != null) {
          colsStrShow +=
            (colsStrShow == "" ? "" : ",") +
            "CONCAT('" +
            vars.concatInit +
            "',t." +
            colShow +
            ") as '" +
            asvar +
            "'";
        } else {
          colsStrShow +=
            (colsStrShow == "" ? "" : ",") +
            "t." +
            colShow +
            " as '" +
            asvar +
            "'";
        }
      }

      if (vars.join != null) {
        colsStrShow +=
          (colsStrShow == "" ? "" : ",") +
          "(SELECT " +
          columns[colShow]["tableref"] +
          "." +
          vars.join +
          " FROM " +
          columns[colShow]["tableref"] +
          " WHERE " +
          columns[colShow]["tableref"] +
          "." +
          columns[colShow]["colref"] +
          " = t." +
          colShow +
          " ) as " +
          "'" +
          vars.joinas +
          "'";
      }
    }
  }

  //Agrega where y joins
  var join = "";
  var where = "1=1";
  var limit = "";
  var orderby = "";
  for (const [colwhere, vars] of Object.entries(colsWhere)) {
    for (const [columna, row] of Object.entries(columns)) {
      var valorParam = params[row.ws];
      var logic = "&&";
      if (vars.logic != null) {
        logic = vars.logic;
      }

      if (colwhere == columna && !tools.empty(valorParam)) {
        valorParam = cleanCharSuspect(valorParam); //limpia valor

        if (row.key == "fk") {
          join +=
            "INNER JOIN " +
            row.tableref +
            " ON " +
            row.tableref +
            "." +
            row.colref +
            " = t." +
            columna +
            " ";
          where +=
            " " +
            logic +
            " " +
            row.tableref +
            "." +
            row.where +
            " = '" +
            valorParam +
            "' ";
        } else {
          if (vars.type == "like") {
            var whereTemp = "";
            if (Array.isArray(valorParam)) {
              for (var i = 0; i < valorParam.length; i++) {
                var valParam = cleanCharSuspect(valorParam[i] + "");
                whereTemp +=
                  (whereTemp == "" ? "" : " || ") +
                  " t." +
                  columna +
                  " like '%" +
                  valParam +
                  "%'";
              }
              whereTemp = " " + logic + " (" + whereTemp + ")";
            } else {
              whereTemp +=
                " " + logic + " t." + columna + " like '%" + valorParam + "%'";
            }
            where += whereTemp;
          } else if (vars.type == "find") {
            var whereTemp = "";
            if (Array.isArray(valorParam)) {
              for (var i = 0; i < valorParam.length; i++) {
                var valParam = cleanCharSuspect(valorParam[i] + "");
                whereTemp +=
                  (whereTemp == "" ? "" : " || ") +
                  "FIND_IN_SET('" +
                  valParam +
                  "',t." +
                  columna +
                  ") > 0";
              }
              whereTemp = " " + logic + " (" + whereTemp + ")";
            } else {
              whereTemp =
                " " +
                logic +
                " FIND_IN_SET('" +
                valorParam +
                "',t." +
                columna +
                ") > 0";
            }
            where += whereTemp;
          } else if (vars.type == "inequality") {
            vars.sign = vars.sign != null ? vars.sign : "<>";
            var type = row.type + "";
            if (type.toUpperCase() == "INT") {
              where +=
                " " +
                logic +
                "  t." +
                columna +
                " " +
                vars.sign +
                " " +
                valorParam +
                "";
            } else {
              where +=
                " " +
                logic +
                "  t." +
                columna +
                " " +
                vars.sign +
                " '" +
                valorParam +
                "'";
            }
          } else if (vars.type == "likefull") {
            var valorParamStr = valorParam + "";
            var valorParamUpper = valorParamStr
              .toUpperCase()
              .replaceAll("  ", " ");

            var arrayParams = valorParamUpper.split(" ");

            var WhereOr = "";
            for (var j = 0; j < arrayParams.length; j++) {
              var claveStr = arrayParams[j] + "";
              if (claveStr.length > 2) {
                WhereOr +=
                  (WhereOr == "" ? "" : " or ") +
                  "t." +
                  columna +
                  " collate latin1_spanish_ci  Like '%" +
                  claveStr +
                  "%'";
              }
            }

            if (WhereOr != "") {
              where += " " + logic + " (" + WhereOr + ")";
              if (vars.limit != null) limit = "LIMIT " + vars.limit;
            }
          } else if (vars.type == "in") {
            var valorParamStr = valorParam + "";
            where += " " + logic + " t." + columna + " in(" + valorParam + ")";
          } else if (vars.type == "exists") {
            var valorParamStr = valorParam + "";
            var tableE = vars.table != null ? vars.table : "";
            var whereE = vars.where != null ? vars.where : "";
            var whereRes = "" + whereE;
            for (const [columna, row] of Object.entries(colsWhere)) {
              var valPar = params[columna];
              if (valPar != null) {
                var colRes = "@" + columna;
                whereRes = whereRes.replaceAll(colRes, valPar);
              }
            }

            where +=
              " " +
              logic +
              " exists(select 1 from " +
              tableE +
              " where " +
              whereRes +
              " )";
          } else {
            where += " " + logic + " t." + columna + " = '" + valorParam + "'";
          }
        }
      } else if (colwhere == columna && vars.default != null) {
        var valueDefault = vars.default;

        if (row.key == "fk") {
          join +=
            "INNER JOIN " +
            row.tableref +
            " ON " +
            row.tableref +
            "." +
            row.colref +
            " = t." +
            columna +
            " ";
          where +=
            " " +
            logic +
            " " +
            row.tableref +
            "." +
            row.where +
            " = '" +
            valueDefault +
            "' ";
        } else {
          where += " " + logic + " t." + columna + " = '" + valueDefault + "'";
        }
      }
    }
  }

  //Agrega parametros especiales LIMIT,GROUP etc...
  for (const [colwhere, vars] of Object.entries(colsWhere)) {
    if (colwhere == "@limit") {
      var valorParam = params["@limit"];
      if (!tools.empty(valorParam)) {
        valorParam = cleanCharSuspect(valorParam);
        var valParInt = parseInt(valorParam);
        if (Number.isInteger(valParInt)) {
          limit = "LIMIT " + valParInt;
        }
      } else {
        if (!tools.empty(colsWhere["@limit"]["default"])) {
          limit = "LIMIT " + colsWhere["@limit"]["default"];
        }
      }
    }
    if (colwhere == "@limitblock") {
      var valorParam = params["@limitblock"];
      if (!tools.empty(valorParam)) {
        valorParam = cleanCharSuspect(valorParam);
        var blockParInt = parseInt(valorParam);

        if (Number.isInteger(blockParInt)) {
          var groupBlock = 10;
          if (colsWhere["@limitbygroup"] != null) {
            valorParam = params["@limitbygroup"];
            if (!tools.empty(valorParam)) {
              valorParam = cleanCharSuspect(valorParam);
              groupBlock = parseInt(valorParam);
            } else {
              groupBlock = colsWhere["@limitbygroup"]["default"];
            }
          }

          var limit0 = (blockParInt - 1) * groupBlock;
          var limit1 = groupBlock;

          limit = "LIMIT " + limit0 + "," + limit1;
        }
      }
    }
    if (colwhere == "@order") {
      if (!tools.empty(vars["by"])) {
        orderby = "ORDER BY " + vars["by"];
        if (!tools.empty(vars["type"])) {
          orderby += " " + vars["type"];
        }
      }
    }
  }

  var qry =
    "SELECT " +
    colsStrShow +
    " FROM " +
    table +
    " t " +
    join +
    "WHERE " +
    where +
    " " +
    orderby +
    " " +
    limit +
    ";";

  return qry;
}
//@UPDATE
userModel.update = function (params, table, columns, customWhere, callback) {
  var pais = params.pais + "";
  var connmysql = db.conn(pais);
  if (connmysql) {
    //construye qry en base a los parametros
    var qry = constructQryUpdate(table, columns, params, customWhere);

    if (debug) console.log(qry);

    connmysql.query(qry, function (error, row) {
      if (error == null) {
        callback(null, row);
      } else {
        callback("Query failed. Error: " + error + " query: " + qry, null);
      }
      connmysql.end();
    });
  }
};
function constructQryUpdate(table, columns, params, customWhere) {
  var where = "";
  var assigns = "";

  for (const [columna, row] of Object.entries(columns)) {
    var valueParam = params[row.ws];
    if (valueParam != null) {
      valueParam = cleanCharSuspect(valueParam);

      if (row.key == "pk") {
        where = columna + " = '" + valueParam + "'";
      } else {
        assigns +=
          (assigns == "" ? "" : " , ") + columna + " = '" + valueParam + "'";
      }
    }
  }

  if (customWhere != null) {
    where = customWhere;
  }

  var qry = "UPDATE " + table + " SET " + assigns + " WHERE " + where + ";";
  return qry;
}
//@INSERT
userModel.insert = function (params, table, columns, callback) {
  var pais = params.pais + "";
  var connmysql = db.conn(pais);
  if (connmysql) {
    //construye qry en base a los parametros
    var qry = constructQryIns(table, columns, params);

    if (debug) console.log(qry);

    if (qry == "") {
      callback("Parametros insuficientes", null);
    } else {
      connmysql.query(qry, function (error, row) {
        if (error == null) {
          callback(null, row.insertId);
        } else {
          callback("Query failed. Error: " + error + " query: " + qry, null);
        }
        connmysql.end();
      });
    }
  }
};
function constructQryIns(table, columns, params) {
  var cols = "";
  var vals = "";

  for (const [columna, row] of Object.entries(columns)) {
    if (row.key == "" || row.key == "fk") {
      var valueParam = params[row.ws];
      if (valueParam != null) {
        valueParam = cleanCharSuspect(valueParam);
        cols += (cols == "" ? "" : ",") + columna;
        if (row.key == "fk") {
          vals +=
            (vals == "" ? "" : ",") +
            "(select " +
            row.tableref +
            "." +
            row.colref +
            " from " +
            row.tableref +
            " where " +
            row.tableref +
            "." +
            row.where +
            " = '" +
            valueParam +
            "')";
        } else {
          vals += (vals == "" ? "" : ",") + "'" + valueParam + "'";
        }
      }
    }
  }

  var qry = "INSERT INTO " + table + "(" + cols + ") VALUES (" + vals + ");";

  if (cols == "" || vals == "") {
    return "";
  }

  return qry;
}
//@DELETE
userModel.delete = function (table, params, pkName, pkValue, callback) {
  var pais = params.pais + "";
  var connmysql = db.conn(pais);
  if (connmysql) {
    //construye qry en base a los parametros
    var qry = constructQryDelete(table, pkName, pkValue);
    // console.log(qry);
    connmysql.query(qry, function (error, row) {
      if (error == null) {
        callback(null, row);
      } else {
        callback("Query failed. Error: " + error + " query: " + qry, null);
      }
      connmysql.end();
    });
  }
};
function constructQryDelete(table, pkName, pkValue) {
  pkValue = cleanCharSuspect(pkValue);

  var qry =
    "DELETE FROM " + table + " WHERE " + pkName + " = '" + pkValue + "';";

  return qry;
}
//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = userModel;

//@Tools
function cleanCharSuspect(str) {
  if (typeof str === "string" || str instanceof String) {
    str = str + "";
    var res = str.replaceAll(";", "");
    res = res.replaceAll("'", "");
    res = res.replaceAll("*", "");
    res = res.replaceAll("‘", "");
    res = res.replaceAll("–", "");
    res = res.replaceAll("/*", "");
    res = res.replaceAll("*/", "");
    res = res.replaceAll("xp_", "");
    res = res.replaceAll("<", "");
    return res;
  } else {
    return str;
  }
}
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};
