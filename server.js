const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const PORT = process.env.PORT || 3000;
const app = express();

//Log network requests
app.use(logger("dev"));

//Data parsing middleware
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Staticly serve public directory
app.use(express.static("public"));

//Connect to mongoose
mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

//Routes
app.use(require("./routes/api.js"));

//Server listening for activity
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});