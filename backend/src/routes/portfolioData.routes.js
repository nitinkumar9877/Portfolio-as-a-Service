const express = require("express")
const router = express.Router();
const { Router } = require("express");

const { postportfolioModelData } = require("../controllers/post.portfolio.controllers.js");
const { getportfolioModelData } = require("../controllers/get.portfolio.controller.js");
const validatePortfolio = require("../middleware/portfolio.middleware.js")

const authRoutes = Router();
authRoutes.post('/create-portfolio', validatePortfolio, postportfolioModelData);
authRoutes.get('/get-portfolio/:slug', getportfolioModelData);
module.exports = authRoutes;