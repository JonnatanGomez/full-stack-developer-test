var token_generator = require("nanoid/generate");
var Ajv = require("ajv");
var ajv = new Ajv({ allErrors: true });

var tools = {
  //generacion de codigo
  generateCodeDown: function (length) {
    var alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    return token_generator(alphabet, length);
  },
  generateCodeUp: function (length) {
    var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return token_generator(alphabet, length);
  },
  generateCode: function (length) {
    var alphabet =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return token_generator(alphabet, length);
  },
  //validacion de vacios
  emptyList: function (obj) {
    objRes = { empty: false, message: "valido" };

    if (this.empty(obj)) {
      objRes = { empty: true, message: "vacio" };
      return objRes;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (this.empty(value)) {
        objRes = {
          empty: true,
          message: "El valor " + key + " es obligatorio y esta vacio",
        };
        return objRes;
      }
    }

    return objRes;
  },
  empty: function (dato) {
    var arry = Array.isArray(dato); //devuelve si es array

    if (dato === null) {
      return true;
    }

    if (typeof dato === "undefined") {
      return true;
    }

    if (arry) {
      if (dato.length < 1) {
        return true;
      }
    }
    if (typeof dato === "object") {
      for (var key in dato) {
        if (dato.hasOwnProperty(key)) return false; //no es vacio
      }
      return true;
    } else {
      var datoStr = dato + "";
      datoStr.trim().replace(" ", "");
      if (datoStr == "") {
        return true;
      }
    }

    return false;
  },
  valStrucJson: function (dataJson, structJson) {
    var validate = ajv.compile(structJson);
    var valid = validate(dataJson);
    var msj = ajv.errorsText(validate.errors);
    //Valid
    return { valid: valid, msj: msj };
  },
  nowDateTime: function () {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;
    return dateTime;
  },
};

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};

module.exports = tools;
