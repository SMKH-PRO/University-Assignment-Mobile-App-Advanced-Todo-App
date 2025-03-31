const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const globalHelpers = require("./Utils/globalHelpers");

const Open = require("./Api/Open");
const Goal = require("./Api/Goal");
const User = require("./Api/User");
const Subject = require("./Api/Subject");
const Close = require("./Api/Close");
const NotificationToken = require("./Api/NotificationToken");
const Notification = require("./Api/Notification");
var db = require("./Config/db");
const AssignmentType = require("./Api/AssignmentType");
const Meta = require("./Api/Meta");
const Assignment = require("./Api/Assignment");
const fileupload = require("express-fileupload");

var allowCrossDomain = function (req, res, next) {
  console.log("Api call. ")
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
};
var app = express();
// app.use(fileupload())

app.use(allowCrossDomain);
// app.use(bodyParser.urlencoded());
app.use(express.static("public"));

app.use(bodyParser.json());

app.use(cors());
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Track response status
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  function logResponse(body, isError = false) {
    const time = Date.now() - start;
    const status = res.statusCode;
    const statusType = status >= 400 ? "ERROR" : "SUCCESS";
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${status} ${statusType} - ${time}ms`);
    
    if (isError) {
      console.log(`[ERROR] Request failed: ${req.method} ${req.url}`);
      console.log(`[ERROR] Status code: ${status}`);
      
      try {
        if (body) {
          // Handle Buffer objects (binary data)
          if (Buffer.isBuffer(body)) {
            const bodyString = body.toString('utf8');
            try {
              // Try to parse the buffer as JSON
              const jsonBody = JSON.parse(bodyString);
              console.log(`[ERROR] Response body:`, jsonBody);
            } catch (e) {
              // If it's not valid JSON, show the string representation
              console.log(`[ERROR] Response body (Buffer): ${bodyString.substring(0, 1000)}`);
            }
          } else if (typeof body === 'string') {
            // Try to parse JSON string
            try {
              const parsedBody = JSON.parse(body);
              console.log(`[ERROR] Response body:`, parsedBody);
            } catch (e) {
              // If parsing fails, log as string
              console.log(`[ERROR] Response body: ${body.substring(0, 1000)}`);
            }
          } else {
            // Object response
            console.log(`[ERROR] Response body:`, body);
          }
        }
      } catch (e) {
        console.log(`[ERROR] Could not log response body: ${e.message}`);
      }
    }
  }
  
  res.send = function(body) {
    logResponse(body, res.statusCode >= 400);
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    logResponse(body, res.statusCode >= 400);
    return originalJson.call(this, body);
  };
  
  res.end = function(chunk, encoding) {
    logResponse(chunk, res.statusCode >= 400);
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

db.connection
  .on("error", console.error.bind(console, "MongoDB connection error:"))
  .once("open", function () {
    console.log("db connected");
    // globalHelpers.createCronJobs();
    // globalHelpers.handlePastDates();
  });
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log("listening for requests on port " + PORT);
});

app.use("/api/open", Open);
app.use("/api/close", Close);

app.use("/api/user", globalHelpers.tokenValidation, User);
app.use("/api/notification", globalHelpers.tokenValidation, Notification);
app.use(
  "/api/notification-token",
  globalHelpers.tokenValidation,
  NotificationToken
);
app.use("/api/subject", globalHelpers.tokenValidation, Subject);
app.use("/api/goal", globalHelpers.tokenValidation, Goal);
app.use("/api/assignment-type", globalHelpers.tokenValidation, AssignmentType);
app.use("/api/assignment", globalHelpers.tokenValidation, Assignment);
app.use("/api/meta", globalHelpers.tokenValidation, Meta);

// Global error handler
app.use((err, _, res, _a) => {
  const error = globalHelpers.handleMongooseError(err);

  if (
    process.env.NODE_ENV === "production" &&
    typeof error.message === "string" &&
    error.message.startsWith("request to http")
  ) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
  // console.log(error)
  res.status(err.status || 400).json({ ...error, success: false });
});
