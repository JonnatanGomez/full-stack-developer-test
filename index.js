var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  test = require("assert"),
  Ajv = require("ajv"),
  ajv = new Ajv({ allErrors: true });

let ejs = require("ejs");

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(cors());

mongoose.Promise = global.Promise;
var promise = mongoose.connect(
  "mongodb://localhost:27017/hugo_js",
  {
    useMongoClient: true,
  },
  function (err, res) {
    if (err) {
      throw err;
    } else {
      console.log("Successful MONGO DB!!");
    }
  }
);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

//MODELS
var confi = require("./conf");
var middlewere = require("./middleware");
var muser = require("./models/muser");

//CONTROLLERS
var c_user = require("./controllers/c_user");

//ROUTES
var router = express.Router();
router.get("/", function (req, res) {
  var nombres = { name: "Jony Gomez" };
  res.render(__dirname + "/views/index", {
    nombres: nombres,
  });
});
router.get("/:filename", function (req, res) {
  res.render(__dirname + "/views/" + req.params.filename);
});
router.get("/views/:dir/:filename", function (req, res) {
  res.sendFile(
    __dirname + "/views/" + req.params.dir + "/" + req.params.filename
  );
});

// API routes
var usrChat = express.Router();
usrChat.route("/user/").get(c_user.get);

app.use(router);

app.use("/api", middlewere.auth, usrChat);
var payload = { foo: "bar" };
var secret = "LssdfnNlOsdCsdsjX";

// Start server
app.listen(8888, function () {
  console.log("Node server running on http://localhost:8888");
});
