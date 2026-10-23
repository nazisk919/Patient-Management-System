 const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});
 
const connectDB = require("./config/db");
const app = require("./app");
 
connectDB();

 
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.listen(PORT, () => {
  console.log("==================================================");
  console.log("🏥 Patient Management System");
  console.log("==================================================");
  console.log(`🚀 Backend API Server : http://localhost:${PORT}`);
  console.log(`📑 API Documentation  : http://localhost:${PORT}/api-docs`);
  console.log(`💻 Frontend UI App    : ${CLIENT_URL}`);
  console.log("==================================================");
});