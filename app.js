process.env.NODE_ENV === "dev" && require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Deta } = require("deta");

const usersRoute = require("./api/routes/users");
const postsRoute = require("./api/routes/posts");

mongoose.Promise = global.Promise;

mongoose.connect(
  "mongodb+srv://faceact-db-user:" +
    process.env.DB_PASSWORD +
    "@cluster0.7q239.mongodb.net/" +
    process.env.DB_NAME +
    "?retryWrites=true&w=majority"
);

const deta = Deta();
const drive = deta.Drive("uploads");

app.use(morgan("dev"));

// CORS handling
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested_With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads/", async (req, res) => {
  const data = await drive.get(req.path.substring(1));
  return res.status(200).send(Buffer.from(await data.arrayBuffer()));
});

// Routes handling
app.use("/", usersRoute);
app.use("/posts", postsRoute);

// Error handling
app.use((req, res, next) => {
  const error = new Error("Not Found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
