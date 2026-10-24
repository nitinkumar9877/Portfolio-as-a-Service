const mongoose = require("mongoose");
const { URL } = require("url");
const portfolioModel = require("../models/userPortfolio.model.js");

const postportfolioModelData = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid portfolioModel data"
            });
        }
        console.log("1 step is run successfully")
        const {
            title,
            slug,
            template,
            personalInfo = {},
            socialLinks = {},
            skills = [],
            projects = [],
            experience = [],
            education = [],
            certifications = [],
            theme = {},
            sections = {},
            seo = {},
            status = "draft",
            customDomain = null
        } = req.body;

        const isObject = (value) => {
            value !== null && typeof value === "object" && !Array.isArray(value);
        }
        const isString = (value) => typeof value === "string";

        const isValidUrl = (value) => {
            if (!isString(value) || !value.trim()) {
                return false;
            }

            try {
                const parsedUrl = new URL(value);
                return ["http:", "https:"].includes(parsedUrl.protocol);
            } catch {
                return false;
            }
        };

        const isValidDate = (value) =>
            value === undefined ||
            value === null ||
            value === "" ||
            (!Number.isNaN(new Date(value).getTime()));

        const isValidDomain = (value) =>
            isString(value) &&
            value.length <= 253 &&
            /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(value);

        const fail = (message) =>
            res.status(400).json({
                success: false,
                message
            });
        console.log("2 step is run successfully")

        if (!isString(title) || !title.trim()) {
            return fail("Please enter the title");
        }

        if (title.trim().length > 100) {
            return fail("Title cannot exceed 100 characters");
        }

        if (!isString(slug) || !slug.trim()) {
            return fail("Please enter the slug");
        }
        console.log("3 step is run successfully")

        const normalizedSlug = slug.trim().toLowerCase();

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
            return fail(
                "Slug can contain lowercase letters, numbers, and single hyphens"
            );
        }

        if (normalizedSlug.length > 100) {
            return fail("Slug cannot exceed 100 characters");
        }
        console.log("4 step is run successfully")

        const allowedTemplates = [
            "minimal",
            "modern",
            "developer",
            "creative"
        ];

        if (!allowedTemplates.includes(template)) {
            return fail("Please select a valid template");
        }

        // 4. Validate nested objects
        for (const [field, value] of Object.entries({
            personalInfo,
            socialLinks,
            theme,
            sections,
            seo
        })) {
            if (!isObject(value)) {
                return fail(`${field} must be an object`);
            }
        }
        console.log("5 step is run successfully")

        // 5. Personal information
        const {
            fullName,
            headline,
            bio,
            email,
            phone,
            location,
            profileImage,
            resumeUrl,
            website
        } = personalInfo;

        if (!isString(fullName) || !fullName.trim()) {
            return fail("Please enter your full name");
        }

        if (!isString(headline) || !headline.trim()) {
            return fail("Please enter your headline");
        }

        if (fullName.length > 150) {
            return fail("Full name cannot exceed 150 characters");
        }

        if (headline.length > 200) {
            return fail("Headline cannot exceed 200 characters");
        }
        console.log("6 step is run successfully")

        if (bio !== undefined && bio !== null &&
            (!isString(bio) || bio.length > 2000)) {
            return fail("Bio must be text and cannot exceed 2000 characters");
        }

        if (email !== undefined && email !== null && email !== "") {
            if (
                !isString(email) ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {
                return fail("Please enter a valid email address");
            }
        }
        console.log("7 step is run successfully")

        for (const field of ["phone", "location"]) {
            if (
                personalInfo[field] !== undefined &&
                personalInfo[field] !== null &&
                !isString(personalInfo[field])
            ) {
                return fail(`${field} must be text`);
            }
        }

        for (const field of ["profileImage", "resumeUrl", "website"]) {
            const value = personalInfo[field];

            if (value && !isValidUrl(value)) {
                return fail(`Please enter a valid ${field} URL`);
            }
        }
        console.log("8 step is run successfully")

        // 6. Social links
        const socialFields = [
            "github",
            "linkedin",
            "twitter",
            "instagram",
            "youtube"
        ];

        for (const field of socialFields) {
            const value = socialLinks[field];

            if (value !== undefined && value !== null && value !== "") {
                if (!isValidUrl(value)) {
                    return fail(`Please enter a valid ${field} URL`);
                }
            }
        }
        console.log("9 step is run successfully")


        // 7. Validate arrays
        const arrayFields = [
            "skills",
            "projects",
            "experience",
            "education",
            "certifications"
        ];

        for (const field of arrayFields) {
            if (!Array.isArray(req.body[field] ?? [])) {
                return fail(`${field} must be an array`);
            }
        }
        console.log("10 step is run successfully")

        // 8. Skills
        const allowedProficiency = [
            "beginner",
            "intermediate",
            "advanced",
            "expert"
        ];

        for (const skill of skills) {
            if (!isObject(skill)) {
                return fail("Each skill must be an object");
            }

            if (!isString(skill.name) || !skill.name.trim()) {
                return fail("Each skill must have a name");
            }

            if (
                skill.category !== undefined &&
                skill.category !== null &&
                !isString(skill.category)
            ) {
                return fail("Skill category must be text");
            }

            if (
                skill.proficiency !== undefined &&
                !allowedProficiency.includes(skill.proficiency)
            ) {
                return fail(`Invalid proficiency for skill: ${skill.name}`);
            }
        }
        console.log("11 step is run successfully")
        // 9. Projects
        for (const project of projects) {
            if (!isObject(project)) {
                return fail("Each project must be an object");
            }

            if (!isString(project.title) || !project.title.trim()) {
                return fail("Each project must have a title");
            }

            if (
                project.description !== undefined &&
                project.description !== null &&
                (!isString(project.description) ||
                    project.description.length > 2000)
            ) {
                return fail("Project description cannot exceed 2000 characters");
            }

            for (const field of ["image", "liveUrl", "githubUrl"]) {
                if (project[field] && !isValidUrl(project[field])) {
                    return fail(`Invalid ${field} URL in project: ${project.title}`);
                }
            }

            if (
                project.technologies !== undefined &&
                (!Array.isArray(project.technologies) ||
                    !project.technologies.every(isString))
            ) {
                return fail("Project technologies must be an array of strings");
            }

            if (
                project.featured !== undefined &&
                typeof project.featured !== "boolean"
            ) {
                return fail("Project featured must be true or false");
            }
        }
        console.log("12 step is run successfully")

        // 10. Experience
        for (const exp of experience) {
            if (!isObject(exp)) {
                return fail("Each experience entry must be an object");
            }

            if (!isString(exp.company) || !exp.company.trim()) {
                return fail("Each experience entry requires a company");
            }

            if (!isString(exp.position) || !exp.position.trim()) {
                return fail("Each experience entry requires a position");
            }

            if (
                exp.currentlyWorking !== undefined &&
                typeof exp.currentlyWorking !== "boolean"
            ) {
                return fail("currentlyWorking must be true or false");
            }

            if (!isValidDate(exp.startDate) || !isValidDate(exp.endDate)) {
                return fail("Please provide valid experience dates");
            }

            if (
                exp.startDate &&
                exp.endDate &&
                !exp.currentlyWorking &&
                new Date(exp.endDate) < new Date(exp.startDate)
            ) {
                return fail("Experience end date cannot be before start date");
            }

            if (exp.description !== undefined &&
                exp.description !== null &&
                !isString(exp.description)) {
                return fail("Experience description must be text");
            }
        }
        console.log("13 step is run successfully")

        // 11. Education
        for (const item of education) {
            if (!isObject(item)) {
                return fail("Each education entry must be an object");
            }

            if (!isString(item.institution) || !item.institution.trim()) {
                return fail("Each education entry requires an institution");
            }

            if (!isValidDate(item.startDate) || !isValidDate(item.endDate)) {
                return fail("Please provide valid education dates");
            }

            if (
                item.startDate &&
                item.endDate &&
                new Date(item.endDate) < new Date(item.startDate)
            ) {
                return fail("Education end date cannot be before start date");
            }
        }
        console.log("14 step is run successfully")

        // 12. Certifications
        for (const cert of certifications) {
            if (!isObject(cert)) {
                return fail("Each certification must be an object");
            }

            if (!isString(cert.name) || !cert.name.trim()) {
                return fail("Each certification must have a name");
            }

            if (!isValidDate(cert.issueDate)) {
                return fail("Please provide a valid certification issue date");
            }

            if (cert.credentialUrl && !isValidUrl(cert.credentialUrl)) {
                return fail("Please enter a valid certification URL");
            }
        }
        console.log("15 step is run successfully")

        // 13. Theme
        const {
            primaryColor,
            backgroundColor,
            textColor,
            fontFamily,
            darkMode
        } = theme;

        const colorRegex = /^#[0-9a-fA-F]{6}$/;
        console.log("16 step is run successfully")

        for (const [field, value] of Object.entries({
            primaryColor,
            backgroundColor,
            textColor
        })) {
            if (value !== undefined &&
                (!isString(value) || !colorRegex.test(value))) {
                return fail(`${field} must be a valid hex color, e.g. #2563eb`);
            }
        }

        if (fontFamily !== undefined &&
            (!isString(fontFamily) || !fontFamily.trim())) {
            return fail("fontFamily must be a non-empty string");
        }

        if (darkMode !== undefined && typeof darkMode !== "boolean") {
            return fail("darkMode must be true or false");
        }
        console.log("17 step is run successfully")

        // 14. Sections
        const sectionFields = [
            "about",
            "skills",
            "projects",
            "experience",
            "education",
            "certifications",
            "contact"
        ];
        console.log("18 step is run successfully")

        for (const field of sectionFields) {
            if (
                sections[field] !== undefined &&
                typeof sections[field] !== "boolean"
            ) {
                return fail(`Section '${field}' must be true or false`);
            }
        }
        console.log("19 step is run successfully")

        // 15. SEO
        if (
            seo.metaTitle !== undefined &&
            (!isString(seo.metaTitle) || seo.metaTitle.length > 100)
        ) {
            return fail("SEO meta title cannot exceed 100 characters");
        }

        if (
            seo.metaDescription !== undefined &&
            (!isString(seo.metaDescription) || seo.metaDescription.length > 300)
        ) {
            return fail("SEO meta description cannot exceed 300 characters");
        }

        if (
            seo.keywords !== undefined &&
            (!Array.isArray(seo.keywords) || !seo.keywords.every(isString))
        ) {
            return fail("SEO keywords must be an array of strings");
        }
        console.log("20 step is run successfully")

        // 16. Status
        const allowedStatuses = ["draft", "published", "archived"];

        if (!allowedStatuses.includes(status)) {
            return fail("Invalid portfolioModel status");
        }

        // 17. Custom domain
        if (
            customDomain !== null &&
            customDomain !== "" &&
            !isValidDomain(customDomain)
        ) {
            return fail("Please enter a valid custom domain");
        }
        console.log("21 step is run successfully")

        // 18. Check duplicate slug
        const existingportfolioModel = await portfolioModel.findOne({
            slug: normalizedSlug
        }).lean();
        console.log("after 21 and before 22th step step is run successfully")

        if (existingportfolioModel) {
            return res.status(409).json({
                success: false,
                message: "This portfolioModel slug is already taken"
            });
        }
        console.log("22 step is run successfully")

        // 19. Create portfolioModel
        // publishedAt is managed by the server, not trusted from req.body.
        const portfolioModelData = {
            title: title.trim(),
            slug: normalizedSlug,
            template,
            personalInfo: {
                fullName: fullName.trim(),
                headline: headline.trim(),
                bio,
                email,
                phone,
                location,
                profileImage,
                resumeUrl,
                website
            },
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
            publishedAt: status === "published" ? new Date() : null,
            customDomain: customDomain || null
        };
        console.log("23 step is run successfully")

        const createdPortfolio = await portfolioModel.create(portfolioModelData);
        console.log("all steps run successfully")

        return res.status(201).json({
            success: true,
            message: "Portfolio created successfully",
            data: createdPortfolio
        });

    } catch (err) {
        console.error("Error creating portfolioModel:", err);
        console.log("catch block")

        // MongoDB unique index can reject simultaneous duplicate slugs.
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This portfolioModel slug is already taken"
            });
        }

        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "portfolioModel validation failed",
                error: err.message
            });
        }
        console.log("This is the error :", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating portfolioModel"
        });
    }
};

module.exports = { postportfolioModelData };