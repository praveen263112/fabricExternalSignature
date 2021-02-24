var createError = require("http-errors");
var express = require("express");
var connect = require("connect");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");

//var usersRouter = require('./routes/users');

var app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());

// app.use(bodyParser.json()); // for encoded bodies
var indexRouter = require("./routes/index");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use(express.static("/public"));

// app.use(function(req, res, next) {
//   if (!res.is("application/octet-stream")) return next();
//   var data = []; // List of Buffer objects
//   res.on("data", function(chunk) {
//     data.push(chunk); // Append Buffer object
//   });
//   res.on("end", function() {
//     if (data.length <= 0) return next();
//     data = Buffer.concat(data); // Make one large Buffer of it
//     console.log("Received buffer", data);
//     res.body = data;
//     next();
//   });
// });

//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
