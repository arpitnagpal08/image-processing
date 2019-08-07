const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// allow cross origins
app.use(cors());
// api logs
app.use(morgan('dev'));
// read body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// ROUTES
const api = require("./routes/api");
app.use("/", api);

module.exports = app;