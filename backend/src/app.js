const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/portfolioData.routes.js")

app.use(cors());
app.use(express.json());
app.use('/', authRoutes)
module.exports = app;

// http://localhost:8080/