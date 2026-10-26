
const mongoose = require("mongoose");

const personalInfoSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        headline: {
            type: String,
            required: [true, "Headline is required"],
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 2000,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
        },
        resumeUrl: {
            type: String,
        },
        website: {
            type: String,
        },
    },
    { _id: false }
);

// 2. Skills
const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Skill name is required"],
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        proficiency: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "expert"],
            default: "intermediate",
        },
    },
    { _id: false }
);

// 3. Projects
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Project title is required"],
        trim: true,
    },
    description: {
        type: String,
        maxlength: 2000,
    },
    image: {
        type: String,
    },
    liveUrl: {
        type: String,
    },
    githubUrl: {
        type: String,
    },
    technologies: {
        type: [String],
        default: [],
    },
    featured: {
        type: Boolean,
        default: false,
    },
});

// 4. Experience
const experienceSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
    },
    position: {
        type: String,
        required: [true, "Position is required"],
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    employmentType: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    currentlyWorking: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    },
});

// 5. Education
const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: [true, "Institution name is required"],
        trim: true,
    },
    degree: {
        type: String,
        trim: true,
    },
    fieldOfStudy: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    grade: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
    },
});

// 6. Certifications
const certificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Certification name is required"],
        trim: true,
    },
    issuer: {
        type: String,
        trim: true,
    },
    issueDate: {
        type: Date,
    },
    credentialUrl: {
        type: String,
    },
});

// 7. SEO
const seoSchema = new mongoose.Schema(
    {
        metaTitle: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        keywords: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

// 8. Main portfolio schema
const portfolioSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Portfolio title is required"],
            trim: true,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: [true, "Portfolio slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        template: {
            type: String,
            required: [true, "Please select a template"],
            enum: ["minimal", "modern", "developer", "creative"],
        },

        personalInfo: {
            type: personalInfoSchema,
            required: [true, "Personal information is required"],
        },

        socialLinks: {
            github: String,
            linkedin: String,
            twitter: String,
            instagram: String,
            youtube: String,
        },

        skills: {
            type: [skillSchema],
            default: [],
        },

        // Optional sections: users can leave them out.
        // If an entry is added, its required fields are validated.
        projects: {
            type: [projectSchema],
            default: undefined,
        },

        experience: {
            type: [experienceSchema],
            default: undefined,
        },

        education: {
            type: [educationSchema],
            required: [true, "Education section is required"],
            default: undefined,
            validate: {
                validator: Array.isArray,
                message: "Education must be an array",
            },
        },

        certifications: {
            type: [certificationSchema],
            default: undefined,
        },

        theme: {
            primaryColor: {
                type: String,
                default: "#2563eb",
            },
            backgroundColor: {
                type: String,
                default: "#ffffff",
            },
            textColor: {
                type: String,
                default: "#111827",
            },
            fontFamily: {
                type: String,
                default: "Inter",
            },
            darkMode: {
                type: Boolean,
                default: false,
            },
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
            type: seoSchema,
            required: [true, "SEO settings are required"],
        },

        status: {
            type: String,
            required: [true, "Portfolio status is required"],
            enum: ["draft", "published", "archived"],
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const portfolioModel = mongoose.model("Portfolio", portfolioSchema);

module.exports = portfolioModel;
