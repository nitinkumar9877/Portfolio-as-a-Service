const mongoose = require("mongoose");

const isObject = (value) =>
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);

const isString = (value) => typeof value === "string";

const isValidUrl = (value) => {
    if (!isString(value) || !value.trim()) return false;

    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
};

const isValidDate = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (!Number.isNaN(new Date(value).getTime()));

const validatePortfolio = (req, res, next) => {
    const body = req.body;

    const fail = (message) =>
        res.status(400).json({
            success: false,
            message,
        });

    if (!isObject(body)) {
        return fail("Request body must be a JSON object");
    }

    // Required top-level fields
    for (const field of ["title", "slug", "template", "status"]) {
        if (!isString(body[field]) || !body[field].trim()) {
            return fail(`${field} is required`);
        }
    }

    if (body.title.trim().length > 100) {
        return fail("Title cannot exceed 100 characters");
    }

    const slug = body.slug.trim().toLowerCase();

    if (
        slug.length > 100 ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
        return fail(
            "Slug must contain lowercase letters, numbers, and single hyphens"
        );
    }

    if (!["minimal", "modern", "developer", "creative"].includes(body.template)) {
        return fail("Invalid template");
    }

    if (!["draft", "published", "archived"].includes(body.status)) {
        return fail("Invalid portfolio status");
    }

    // Required nested objects
    for (const field of ["personalInfo", "seo"]) {
        if (!isObject(body[field])) {
            return fail(`${field} must be an object`);
        }
    }

    // Required personal information
    const { fullName, headline } = body.personalInfo;

    if (!isString(fullName) || !fullName.trim()) {
        return fail("Personal information fullName is required");
    }

    if (!isString(headline) || !headline.trim()) {
        return fail("Personal information headline is required");
    }

    if (fullName.trim().length > 150) {
        return fail("Full name cannot exceed 150 characters");
    }

    if (headline.trim().length > 200) {
        return fail("Headline cannot exceed 200 characters");
    }

    if (
        body.personalInfo.bio !== undefined &&
        body.personalInfo.bio !== null &&
        (!isString(body.personalInfo.bio) ||
            body.personalInfo.bio.length > 2000)
    ) {
        return fail("Bio must be text with at most 2000 characters");
    }

    if (
        body.personalInfo.email &&
        (!isString(body.personalInfo.email) ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.personalInfo.email))
    ) {
        return fail("Invalid email address");
    }

    // website is optional, but if supplied, it must be a valid URL
    for (const field of ["website", "profileImage", "resumeUrl"]) {
        const value = body.personalInfo[field];

        if (value !== undefined && value !== null && value !== "") {
            if (!isValidUrl(value)) {
                return fail(`Invalid personalInfo.${field} URL`);
            }
        }
    }

    // Education must be supplied as an array; it may be empty.
    if (!Array.isArray(body.education)) {
        return fail("Education must be an array");
    }

    // Optional arrays: if supplied, each must be an array.
    for (const field of [
        "skills",
        "projects",
        "experience",
        "certifications",
    ]) {
        if (body[field] !== undefined && !Array.isArray(body[field])) {
            return fail(`${field} must be an array`);
        }
    }

    // Skills
    for (const skill of body.skills ?? []) {
        if (!isObject(skill) || !isString(skill.name) || !skill.name.trim()) {
            return fail("Every skill must have a name");
        }

        if (
            skill.proficiency !== undefined &&
            !["beginner", "intermediate", "advanced", "expert"].includes(
                skill.proficiency
            )
        ) {
            return fail(`Invalid proficiency for skill: ${skill.name}`);
        }
    }

    // Projects
    for (const project of body.projects ?? []) {
        if (!isObject(project) || !isString(project.title) || !project.title.trim()) {
            return fail("Every project must have a title");
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
                return fail(`Invalid project ${field} URL`);
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

    // Experience
    for (const item of body.experience ?? []) {
        if (!isObject(item)) {
            return fail("Each experience entry must be an object");
        }

        if (!isString(item.company) || !item.company.trim()) {
            return fail("Every experience entry requires a company");
        }

        if (!isString(item.position) || !item.position.trim()) {
            return fail("Every experience entry requires a position");
        }

        if (
            item.currentlyWorking !== undefined &&
            typeof item.currentlyWorking !== "boolean"
        ) {
            return fail("currentlyWorking must be true or false");
        }

        if (!isValidDate(item.startDate) || !isValidDate(item.endDate)) {
            return fail("Invalid experience dates");
        }

        if (
            item.startDate &&
            item.endDate &&
            !item.currentlyWorking &&
            new Date(item.endDate) < new Date(item.startDate)
        ) {
            return fail("Experience end date cannot precede start date");
        }
    }

    // Education
    for (const item of body.education) {
        if (!isObject(item)) {
            return fail("Each education entry must be an object");
        }

        if (!isString(item.institution) || !item.institution.trim()) {
            return fail("Every education entry requires an institution");
        }

        if (!isValidDate(item.startDate) || !isValidDate(item.endDate)) {
            return fail("Invalid education dates");
        }

        if (
            item.startDate &&
            item.endDate &&
            new Date(item.endDate) < new Date(item.startDate)
        ) {
            return fail("Education end date cannot precede start date");
        }
    }

    // Certifications
    for (const item of body.certifications ?? []) {
        if (!isObject(item) || !isString(item.name) || !item.name.trim()) {
            return fail("Every certification must have a name");
        }

        if (!isValidDate(item.issueDate)) {
            return fail("Invalid certification issue date");
        }

        if (item.credentialUrl && !isValidUrl(item.credentialUrl)) {
            return fail("Invalid certification credential URL");
        }
    }

    // Optional nested objects, if supplied, must have the right shape.
    for (const field of ["socialLinks", "theme", "sections"]) {
        if (body[field] !== undefined && !isObject(body[field])) {
            return fail(`${field} must be an object`);
        }
    }

    if (
        body.seo.metaTitle !== undefined &&
        (!isString(body.seo.metaTitle) || body.seo.metaTitle.length > 100)
    ) {
        return fail("SEO meta title cannot exceed 100 characters");
    }

    if (
        body.seo.metaDescription !== undefined &&
        (!isString(body.seo.metaDescription) ||
            body.seo.metaDescription.length > 300)
    ) {
        return fail("SEO meta description cannot exceed 300 characters");
    }

    if (
        body.seo.keywords !== undefined &&
        (!Array.isArray(body.seo.keywords) ||
            !body.seo.keywords.every(isString))
    ) {
        return fail("SEO keywords must be an array of strings");
    }

    // Normalize slug for the controller.
    req.body.slug = slug;

    next();
};

module.exports = validatePortfolio;
