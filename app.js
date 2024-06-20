require("dotenv").config({path: "./.env"})
const express = require('express');
const fs = require("fs");
const path = require("path");
const cookieParser = require('cookie-parser');
const routes = require('./src/routes/index.js');

// Databse Connection
require("./src/utils/database.js").connectDatabase();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
app.use('/', routes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


// Error handling
const ErrorHandler = require("./src/utils/errorHandler.js");
const { generatedErrors } = require("./src/middlewares/error.js");
app.all("*", (req,res,next) => {
    next(new ErrorHandler(`Requested URL Not Found: ${req.url}`,404));
});

app.use(generatedErrors)

