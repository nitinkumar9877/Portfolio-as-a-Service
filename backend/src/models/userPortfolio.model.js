const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        template: {
            type: String,
            enum: ["minimal", "modern", "developer", "creative"],
            default: "developer",
        },

        personalInfo: {
            fullName: { type: String, trim: true },
            headline: { type: String, trim: true },
            bio: { type: String, maxlength: 2000 },
            email: { type: String, trim: true },
            phone: { type: String, trim: true },
            location: { type: String, trim: true },
            profileImage: { type: String },
            resumeUrl: { type: String },
            website: { type: String },
        },

        socialLinks: {
            github: { type: String },
            linkedin: { type: String },
            twitter: { type: String },
            instagram: { type: String },
            youtube: { type: String },
        },

        skills: [
            {
                name: { type: String, required: true, trim: true },
                category: { type: String, trim: true },
                proficiency: {
                    type: String,
                    enum: ["beginner", "intermediate", "advanced", "expert"],
                    default: "intermediate",
                },
            },
        ],

        projects: [
            {
                title: { type: String, required: true, trim: true },
                description: { type: String, maxlength: 2000 },
                image: { type: String },
                liveUrl: { type: String },
                githubUrl: { type: String },
                technologies: [{ type: String }],
                featured: { type: Boolean, default: false },
            },
        ],
        experience: [
            {
                company: { type: String, required: true },
                position: { type: String, required: true },
                location: { type: String },
                employmentType: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
                currentlyWorking: { type: Boolean, default: false },
                description: { type: String },
            },
        ],

        education: [
            {
                institution: { type: String, required: true },
                degree: { type: String },
                fieldOfStudy: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
                grade: { type: String },
                description: { type: String },
            },
        ],

        certifications: [
            {
                name: { type: String, required: true },
                issuer: { type: String },
                issueDate: { type: Date },
                credentialUrl: { type: String },
            },
        ],

        theme: {
            primaryColor: { type: String, default: "#2563eb" },
            backgroundColor: { type: String, default: "#ffffff" },
            textColor: { type: String, default: "#111827" },
            fontFamily: { type: String, default: "Inter" },
            darkMode: { type: Boolean, default: false },
        },

        sections: {
            about: { type: Boolean, default: true },
            skills: { type: Boolean, default: true },
            projects: { type: Boolean, default: true },
            experience: { type: Boolean, default: true },
            education: { type: Boolean, default: true },
            certifications: { type: Boolean, default: true },
            contact: { type: Boolean, default: true },
        },

        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            keywords: [{ type: String }],
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },

        publishedAt: { type: Date, default: null },
        customDomain: { type: String, default: null },

    },
    { timestamps: true }
);



const portfolioModel = mongoose.model("Portfolio", portfolioSchema);

module.exports = portfolioModel