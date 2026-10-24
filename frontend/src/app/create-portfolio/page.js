
"use client";

import { useState } from "react";
import { createPortfolio } from "../../services/portfolioService.js";
import styles from "../../components/stylesheets/createPortfolio.module.css";

const initialForm = {
    userId: "",
    title: "",
    slug: "",
    template: "developer",

    personalInfo: {
        fullName: "",
        headline: "",
        bio: "",
        email: "",
        phone: "",
        location: "",
        profileImage: "",
        resumeUrl: "",
        website: "",
    },

    socialLinks: {
        github: "",
        linkedin: "",
        twitter: "",
        instagram: "",
        youtube: "",
    },

    theme: {
        primaryColor: "#2563eb",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        fontFamily: "Inter",
        darkMode: false,
    },

    seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
    },

    status: "draft",
};

const createEmptySkill = () => ({
    name: "",
    category: "",
    proficiency: "",
});

const createEmptyProject = () => ({
    title: "",
    description: "",
    image: "",
    liveUrl: "",
    githubUrl: "",
    technologies: "",
    featured: false,
});

const proficiencyOptions = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
];

function generateSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isValidUrl(value) {
    if (!value.trim()) return true;

    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function hasSkillData(skill) {
    return Object.values(skill).some((value) => value.trim() !== "");
}

function hasProjectData(project) {
    return (
        project.title.trim() ||
        project.description.trim() ||
        project.image.trim() ||
        project.liveUrl.trim() ||
        project.githubUrl.trim() ||
        project.technologies.trim() ||
        project.featured
    );
}

export default function CreatePortfolioPage() {
    const [form, setForm] = useState(initialForm);

    const [skills, setSkills] = useState([createEmptySkill()]);
    const [projects, setProjects] = useState([createEmptyProject()]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function clearMessages() {
        setError("");
        setSuccess("");
    }

    function handleChange(event) {
        const { name, value } = event.target;

        clearMessages();

        if (name === "title") {
            setForm((previous) => ({
                ...previous,
                title: value,
                slug: generateSlug(value),
            }));
            return;
        }

        if (name === "slug") {
            setForm((previous) => ({
                ...previous,
                slug: generateSlug(value),
            }));
            return;
        }

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleNestedChange(section, field, value) {
        clearMessages();

        setForm((previous) => ({
            ...previous,
            [section]: {
                ...previous[section],
                [field]: value,
            },
        }));
    }

    // ---------------- SKILLS ----------------

    function handleSkillChange(index, field, value) {
        clearMessages();

        setSkills((previous) =>
            previous.map((skill, skillIndex) =>
                skillIndex === index
                    ? { ...skill, [field]: value }
                    : skill
            )
        );
    }

    function addSkill() {
        clearMessages();

        const lastSkill = skills[skills.length - 1];

        if (
            !lastSkill.name.trim() ||
            !lastSkill.category.trim() ||
            !lastSkill.proficiency
        ) {
            setError(
                "Complete the current skill's name, category, and proficiency before adding another skill."
            );
            return;
        }

        setSkills((previous) => [...previous, createEmptySkill()]);
    }

    function removeSkill(index) {
        clearMessages();

        setSkills((previous) => {
            if (previous.length === 1) {
                return [createEmptySkill()];
            }

            return previous.filter((_, skillIndex) => skillIndex !== index);
        });
    }

    // ---------------- PROJECTS ----------------

    function handleProjectChange(index, field, value) {
        clearMessages();

        setProjects((previous) =>
            previous.map((project, projectIndex) =>
                projectIndex === index
                    ? { ...project, [field]: value }
                    : project
            )
        );
    }

    function addProject() {
        clearMessages();

        const lastProject = projects[projects.length - 1];

        if (
            !lastProject.title.trim() ||
            !lastProject.description.trim() ||
            !lastProject.technologies.trim()
        ) {
            setError(
                "Complete the current project's title, description, and technologies before adding another project."
            );
            return;
        }

        if (
            !isValidUrl(lastProject.image) ||
            !isValidUrl(lastProject.liveUrl) ||
            !isValidUrl(lastProject.githubUrl)
        ) {
            setError("Enter valid HTTP or HTTPS URLs for the project links.");
            return;
        }

        setProjects((previous) => [
            ...previous,
            createEmptyProject(),
        ]);
    }

    function removeProject(index) {
        clearMessages();

        setProjects((previous) => {
            if (previous.length === 1) {
                return [createEmptyProject()];
            }

            return previous.filter(
                (_, projectIndex) => projectIndex !== index
            );
        });
    }

    // ---------------- FORM SUBMISSION ----------------

    async function handleSubmit(event) {
        event.preventDefault();
        clearMessages();

        if (!/^[a-f\d]{24}$/i.test(form.userId.trim())) {
            setError("Please enter a valid 24-character MongoDB User ID.");
            return;
        }

        if (!form.title.trim() || !form.slug.trim()) {
            setError("Portfolio title and slug are required.");
            return;
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
            setError(
                "Slug must contain lowercase letters, numbers, and single hyphens."
            );
            return;
        }

        if (
            !form.personalInfo.fullName.trim() ||
            !form.personalInfo.headline.trim()
        ) {
            setError("Full name and professional headline are required.");
            return;
        }

        const enteredSkills = skills.filter(hasSkillData);
        const enteredProjects = projects.filter(hasProjectData);

        // Validate every skill that the user has started entering.
        for (let index = 0; index < enteredSkills.length; index++) {
            const skill = enteredSkills[index];

            if (
                !skill.name.trim() ||
                !skill.category.trim() ||
                !skill.proficiency
            ) {
                setError(
                    `Complete all three fields in Skill ${index + 1}, or remove that skill.`
                );
                return;
            }

            if (!proficiencyOptions.includes(skill.proficiency)) {
                setError(`Select a valid proficiency for Skill ${index + 1}.`);
                return;
            }
        }

        // Validate every project that the user has started entering.
        for (let index = 0; index < enteredProjects.length; index++) {
            const project = enteredProjects[index];

            if (
                !project.title.trim() ||
                !project.description.trim() ||
                !project.technologies.trim()
            ) {
                setError(
                    `Complete the title, description, and technologies in Project ${index + 1}, or remove that project.`
                );
                return;
            }

            if (
                !isValidUrl(project.image) ||
                !isValidUrl(project.liveUrl) ||
                !isValidUrl(project.githubUrl)
            ) {
                setError(
                    `Project ${index + 1} contains an invalid URL. Use HTTP or HTTPS.`
                );
                return;
            }
        }

        const socialLinks = form.socialLinks;

        for (const [platform, url] of Object.entries(socialLinks)) {
            if (!isValidUrl(url)) {
                setError(`Please enter a valid URL for ${platform}.`);
                return;
            }
        }

        for (const field of ["profileImage", "resumeUrl", "website"]) {
            if (!isValidUrl(form.personalInfo[field])) {
                setError(`Please enter a valid URL for ${field}.`);
                return;
            }
        }

        const portfolioData = {
            userId: form.userId.trim(),
            title: form.title.trim(),
            slug: form.slug.trim(),
            template: form.template,

            personalInfo: {
                ...form.personalInfo,
                fullName: form.personalInfo.fullName.trim(),
                headline: form.personalInfo.headline.trim(),
            },

            socialLinks,

            skills: enteredSkills.map((skill) => ({
                name: skill.name.trim(),
                category: skill.category.trim(),
                proficiency: skill.proficiency,
            })),

            projects: enteredProjects.map((project) => ({
                title: project.title.trim(),
                description: project.description.trim(),
                image: project.image.trim(),
                liveUrl: project.liveUrl.trim(),
                githubUrl: project.githubUrl.trim(),
                technologies: project.technologies
                    .split(",")
                    .map((technology) => technology.trim())
                    .filter(Boolean),
                featured: project.featured,
            })),

            experience: [],
            education: [],
            certifications: [],

            theme: form.theme,

            sections: {
                about: true,
                skills: true,
                projects: true,
                experience: true,
                education: true,
                certifications: true,
                contact: true,
            },

            seo: {
                metaTitle: form.seo.metaTitle.trim(),
                metaDescription: form.seo.metaDescription.trim(),
                keywords: form.seo.keywords
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
            },

            status: form.status,
            customDomain: null,
        };

        try {
            setIsSubmitting(true);

            const result = await createPortfolio(portfolioData);

            setSuccess(
                `${result.message || "Portfolio created successfully."}${result.data?._id
                    ? ` Portfolio ID: ${result.data._id}`
                    : ""
                }`
            );
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>PORTFOLIO BUILDER</p>
                        <h1>Create your portfolio</h1>
                        <p className={styles.subtitle}>
                            Add your details, skills, and projects to build
                            your professional portfolio.
                        </p>
                    </div>

                    <span className={styles.statusBadge}>
                        New portfolio
                    </span>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error} role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className={styles.success} role="status">
                            {success}
                        </div>
                    )}

                    {/* 01 BASIC INFORMATION */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>01</span>
                            <div>
                                <h2>Basic information</h2>
                                <p>Set up your portfolio identity.</p>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label htmlFor="userId">User ID *</label>
                                <input
                                    id="userId"
                                    name="userId"
                                    value={form.userId}
                                    onChange={handleChange}
                                    placeholder="MongoDB ObjectId"
                                    maxLength={24}
                                    required
                                />
                                <small>
                                    Use the authenticated user's ID in a real
                                    application, rather than asking manually.
                                </small>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="title">Portfolio title *</label>
                                <input
                                    id="title"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="My Developer Portfolio"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="slug">Portfolio slug *</label>
                                <input
                                    id="slug"
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleChange}
                                    placeholder="my-developer-portfolio"
                                    maxLength={100}
                                    required
                                />
                                <small>
                                    Lowercase letters, numbers, and hyphens.
                                </small>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="template">Template *</label>
                                <select
                                    id="template"
                                    name="template"
                                    value={form.template}
                                    onChange={handleChange}
                                >
                                    <option value="developer">Developer</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="modern">Modern</option>
                                    <option value="creative">Creative</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="status">Initial status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 02 PERSONAL INFORMATION */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>02</span>
                            <div>
                                <h2>Personal information</h2>
                                <p>Tell visitors about yourself.</p>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label htmlFor="fullName">Full name *</label>
                                <input
                                    id="fullName"
                                    value={form.personalInfo.fullName}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "fullName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="headline">
                                    Professional headline *
                                </label>
                                <input
                                    id="headline"
                                    value={form.personalInfo.headline}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "headline",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Full Stack Developer"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.personalInfo.email}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    value={form.personalInfo.phone}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="location">Location</label>
                                <input
                                    id="location"
                                    value={form.personalInfo.location}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "location",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ludhiana, Punjab, India"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="website">Website</label>
                                <input
                                    id="website"
                                    type="url"
                                    value={form.personalInfo.website}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "website",
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="profileImage">
                                    Profile image URL
                                </label>
                                <input
                                    id="profileImage"
                                    type="url"
                                    value={form.personalInfo.profileImage}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "profileImage",
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://example.com/profile.jpg"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="resumeUrl">Resume URL</label>
                                <input
                                    id="resumeUrl"
                                    type="url"
                                    value={form.personalInfo.resumeUrl}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "resumeUrl",
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://example.com/resume.pdf"
                                />
                            </div>

                            <div
                                className={`${styles.field} ${styles.fullWidth}`}
                            >
                                <label htmlFor="bio">About you</label>
                                <textarea
                                    id="bio"
                                    rows={4}
                                    maxLength={2000}
                                    value={form.personalInfo.bio}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "personalInfo",
                                            "bio",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write a short professional introduction..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* 03 SKILLS */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>03</span>
                            <div>
                                <h2>Skills</h2>
                                <p>
                                    Add each skill separately. Complete all
                                    three fields before adding another.
                                </p>
                            </div>
                        </div>

                        <div className={styles.repeatList}>
                            {skills.map((skill, index) => (
                                <div className={styles.repeatCard} key={index}>
                                    <div className={styles.repeatCardHeader}>
                                        <h3>Skill {index + 1}</h3>

                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeSkill(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <label htmlFor={`skill-name-${index}`}>
                                                Skill name *
                                            </label>
                                            <input
                                                id={`skill-name-${index}`}
                                                value={skill.name}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="JavaScript"
                                                required={
                                                    hasSkillData(skill)
                                                }
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`skill-category-${index}`}
                                            >
                                                Skill type / category *
                                            </label>
                                            <input
                                                id={`skill-category-${index}`}
                                                value={skill.category}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "category",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Programming Language"
                                                required={
                                                    hasSkillData(skill)
                                                }
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`skill-level-${index}`}
                                            >
                                                Knowledge level *
                                            </label>
                                            <select
                                                id={`skill-level-${index}`}
                                                value={skill.proficiency}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "proficiency",
                                                        e.target.value
                                                    )
                                                }
                                                required={
                                                    hasSkillData(skill)
                                                }
                                            >
                                                <option value="">
                                                    Select proficiency
                                                </option>
                                                {proficiencyOptions.map(
                                                    (level) => (
                                                        <option
                                                            value={level}
                                                            key={level}
                                                        >
                                                            {level
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                level.slice(1)}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={addSkill}
                        >
                            + Add another skill
                        </button>
                    </section>

                    {/* 04 PROJECTS */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>04</span>
                            <div>
                                <h2>Projects</h2>
                                <p>
                                    Add your projects individually, with their
                                    own descriptions and links.
                                </p>
                            </div>
                        </div>

                        <div className={styles.repeatList}>
                            {projects.map((project, index) => (
                                <div className={styles.repeatCard} key={index}>
                                    <div className={styles.repeatCardHeader}>
                                        <h3>Project {index + 1}</h3>

                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeProject(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`project-title-${index}`}
                                            >
                                                Project title *
                                            </label>
                                            <input
                                                id={`project-title-${index}`}
                                                value={project.title}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Employee Management System"
                                                required={
                                                    Boolean(hasProjectData(project))
                                                }
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`project-technologies-${index}`}
                                            >
                                                Technologies *
                                            </label>
                                            <input
                                                id={`project-technologies-${index}`}
                                                value={project.technologies}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "technologies",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="React, Node.js, MongoDB"
                                                required={
                                                    Boolean(hasProjectData(project))
                                                }
                                            />
                                            <small>
                                                Separate technologies with commas.
                                            </small>
                                        </div>

                                        <div
                                            className={`${styles.field} ${styles.fullWidth}`}
                                        >
                                            <label
                                                htmlFor={`project-description-${index}`}
                                            >
                                                Project description *
                                            </label>
                                            <textarea
                                                id={`project-description-${index}`}
                                                rows={4}
                                                maxLength={2000}
                                                value={project.description}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Explain what the project does and what you built..."
                                                required={
                                                    Boolean(hasProjectData(project))
                                                }
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`project-image-${index}`}
                                            >
                                                Project image URL
                                            </label>
                                            <input
                                                id={`project-image-${index}`}
                                                type="url"
                                                value={project.image}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "image",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/project.jpg"
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`project-live-${index}`}
                                            >
                                                Live project URL
                                            </label>
                                            <input
                                                id={`project-live-${index}`}
                                                type="url"
                                                value={project.liveUrl}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "liveUrl",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://myproject.com"
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label
                                                htmlFor={`project-github-${index}`}
                                            >
                                                GitHub repository URL
                                            </label>
                                            <input
                                                id={`project-github-${index}`}
                                                type="url"
                                                value={project.githubUrl}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "githubUrl",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://github.com/username/project"
                                            />
                                        </div>

                                        <label className={styles.checkboxField}>
                                            <input
                                                type="checkbox"
                                                checked={project.featured}
                                                onChange={(e) =>
                                                    handleProjectChange(
                                                        index,
                                                        "featured",
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Feature this project
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={addProject}
                        >
                            + Add another project
                        </button>
                    </section>

                    {/* 05 SOCIAL LINKS */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>05</span>
                            <div>
                                <h2>Social profiles</h2>
                                <p>Connect your professional accounts.</p>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            {[
                                "github",
                                "linkedin",
                                "twitter",
                                "instagram",
                                "youtube",
                            ].map((platform) => (
                                <div className={styles.field} key={platform}>
                                    <label htmlFor={platform}>
                                        {platform.charAt(0).toUpperCase() +
                                            platform.slice(1)}
                                    </label>
                                    <input
                                        id={platform}
                                        type="url"
                                        value={form.socialLinks[platform]}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "socialLinks",
                                                platform,
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://example.com/your-profile"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 06 APPEARANCE */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>06</span>
                            <div>
                                <h2>Appearance</h2>
                                <p>Customize your portfolio colors and font.</p>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            {[
                                ["primaryColor", "Primary color"],
                                ["backgroundColor", "Background color"],
                                ["textColor", "Text color"],
                            ].map(([field, label]) => (
                                <div className={styles.field} key={field}>
                                    <label htmlFor={field}>{label}</label>
                                    <div className={styles.colorField}>
                                        <input
                                            id={field}
                                            type="color"
                                            value={form.theme[field]}
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "theme",
                                                    field,
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>{form.theme[field]}</span>
                                    </div>
                                </div>
                            ))}

                            <div className={styles.field}>
                                <label htmlFor="fontFamily">Font family</label>
                                <select
                                    id="fontFamily"
                                    value={form.theme.fontFamily}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "theme",
                                            "fontFamily",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="Inter">Inter</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Poppins">Poppins</option>
                                </select>
                            </div>

                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={form.theme.darkMode}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "theme",
                                            "darkMode",
                                            e.target.checked
                                        )
                                    }
                                />
                                Enable dark mode
                            </label>
                        </div>
                    </section>

                    {/* 07 SEO */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeading}>
                            <span className={styles.step}>07</span>
                            <div>
                                <h2>SEO settings</h2>
                                <p>Set the search engine metadata.</p>
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label htmlFor="metaTitle">Meta title</label>
                                <input
                                    id="metaTitle"
                                    maxLength={100}
                                    value={form.seo.metaTitle}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "seo",
                                            "metaTitle",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Your name | Developer"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="keywords">Keywords</label>
                                <input
                                    id="keywords"
                                    value={form.seo.keywords}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "seo",
                                            "keywords",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Developer, React, Node.js"
                                />
                                <small>Separate keywords with commas.</small>
                            </div>

                            <div
                                className={`${styles.field} ${styles.fullWidth}`}
                            >
                                <label htmlFor="metaDescription">
                                    Meta description
                                </label>
                                <textarea
                                    id="metaDescription"
                                    rows={3}
                                    maxLength={300}
                                    value={form.seo.metaDescription}
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "seo",
                                            "metaDescription",
                                            e.target.value
                                        )
                                    }
                                    placeholder="A short description of your portfolio..."
                                />
                            </div>
                        </div>
                    </section>

                    <footer className={styles.footer}>
                        <p>
                            Fields marked with * are required when you start
                            entering a skill or project.
                        </p>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Creating portfolio..."
                                : "Create portfolio"}
                        </button>
                    </footer>
                </form>
            </div>
        </main>
    );
}
