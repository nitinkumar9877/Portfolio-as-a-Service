const mongoose = require("mongoose");
const { URL } = require("url");
const portfolioModel = require("../models/userPortfolio.model.js");

const postportfolioModelData = async (req, res) => {
    try {
        const {
            title,
            slug,
            template,
            personalInfo,
            socialLinks,
            skills,
            projects,
            experience,
            education,
            certifications,
            theme,
            sections,
            seo,
            status,
        } = req.body;

        // Check if another portfolio already uses this slug.
        const existingPortfolio = await portfolioModel.findOne({ slug })
            .select("_id")
            .lean();

        if (existingPortfolio) {
            return res.status(409).json({
                success: false,
                message: "This portfolio slug is already taken",
            });
        }

        // Only use the fields accepted by our portfolio schema.
        const portfolioData = {
            title: title.trim(),
            slug,
            template,
            personalInfo: {
                ...personalInfo,
                fullName: personalInfo.fullName.trim(),
                headline: personalInfo.headline.trim(),
            },
            socialLinks: socialLinks ?? {},
            skills: skills ?? [],
            projects: projects ?? [],
            experience: experience ?? [],
            education,
            certifications: certifications ?? [],
            theme: theme ?? {},
            sections: sections ?? {},
            seo,
            status,
            publishedAt: status === "published" ? new Date() : null,
        };

        const createdPortfolio = await portfolioModel.create(portfolioData);

        return res.status(201).json({
            success: true,
            message: "Portfolio created successfully",
            data: createdPortfolio,
        });
    } catch (err) {
        console.error("Error creating portfolio:", err);

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This portfolio slug is already taken",
            });
        }

        if (
            err.name === "ValidationError" ||
            err.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Portfolio validation failed",
                error: err.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while creating portfolio",
        });
    }
};

module.exports = { postportfolioModelData };