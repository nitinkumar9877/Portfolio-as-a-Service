const mongoose = require("mongoose");
const { URL } = require("url");
const portfolioModel = require("../models/userPortfolio.model.js");

const getportfolioModelData = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ message: "Slug is not defined" });
        }
        console.log("This is the slug which getting from the params :: ", slug);
        const response = await portfolioModel.findOne({ slug });
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Slug profile is never defined in our database"
            })
        }
        console.log("This is the response which are getting from the database using slug :: ", response);

        return res.status(200).json({
            success: true,
            response: response
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error",
            error: err.name,
            errMsg: err.message
        })
    }
}

module.exports = { getportfolioModelData }