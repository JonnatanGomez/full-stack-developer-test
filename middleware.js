var config = require("./conf");
config = require("./configs/config");
md5 = require("md5");
jwt = require("jsonwebtoken");

//Define servicios publicos
var publico = ["/user"];

exports.auth = function (req, res, next) {
  // var PalabraSecreta = md5(config.TOKEN_SECRET);
  var tokenRecibido = req.headers.token;
  if (publico.includes(req.path)) {
    console.log("Publico");
    next();
  } else {
    console.log("Privado");
    if (tokenRecibido) {
      jwt.verify(tokenRecibido, config.llave, (err, decoded) => {
        if (err) {
          return res.json({
            cd: "error",
            message: "Token invalido o expirado",
            qa_content: null,
            status: "tokenError",
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.send({
        cd: "error",
        message: "Token no proveida",
        qa_content: null,
        status: "tokenError",
      });
    }
  }
};
