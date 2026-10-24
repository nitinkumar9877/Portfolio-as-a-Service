const express = require("express")
const router = express.Router();
const { Router } = require("express");

const { postportfolioModelData } = require("../controllers/portfolio.controllers.js");

const authRoutes = Router();
authRoutes.post('/create-portfolio',postportfolioModelData)
// post http://localhost:8080/create-portfolio
module.exports = authRoutes;