const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("../swagger");

 
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Disable repetitive Morgan HTTP request logs in development mode
// app.use(morgan("dev"));
 
app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
);

// Root route: Redirect browsers to interactive Swagger documentation
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.redirect("/api-docs");
  }
  res.status(200).json({
    success: true,
    message: "Patient Management System API is running",
    docs: "/api-docs",
    health: "/api/health"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

// Global Error Handler Middleware
app.use(errorMiddleware);

module.exports = app;