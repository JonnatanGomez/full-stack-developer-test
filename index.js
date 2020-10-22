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
var mticket = require("./models/mticket");
var mvehicle = require("./models/mvehicle");
var mvehiclestype = require("./models/mvehicletype");

//CONTROLLERS
var c_user = require("./controllers/c_user");
var c_ticket = require("./controllers/c_ticket");
var c_vehicle = require("./controllers/c_vehicle");
var c_vehicle_type = require("./controllers/c_vehicle_type");

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
usrChat
  .route("/vehicle/")
  .get(c_vehicle.get)
  .post(c_vehicle.post)
  .put(c_vehicle.post);

usrChat.route("/vehicletype/").get(c_vehicle_type.get);

usrChat.route("/ticket/").post(c_ticket.post);

app.use(router);

app.use("/api", middlewere.auth, usrChat);

// Start server
app.listen(8888, function () {
  console.log("Node server running on http://localhost:8888");
});
