"use client";
import { useState } from "react";
import styles from "../../../components/stylesheets/createPortfolio.module.css";
import { createPortfolio } from "../../../components/services/portfolioService.js";
import { useRouter } from 'next/navigation'

const initialForm = {
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
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    theme: {
        primaryColor: "#2563eb",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        fontFamily: "Arial",
        darkMode: false,
    },
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
        metaTitle: "",
        metaDescription: "",
        keywords: "",
    },
    status: "draft",
};

const itemDefaults = {
    skills: {
        name: "",
        category: "",
        proficiency: "intermediate",
    },
    projects: {
        title: "",
        description: "",
        image: "",
        liveUrl: "",
        githubUrl: "",
        technologies: "",
        featured: false,
    },
    experience: {
        company: "",
        position: "",
        location: "",
        employmentType: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
    },
    education: {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
        description: "",
    },
    certifications: {
        name: "",
        issuer: "",
        issueDate: "",
        credentialUrl: "",
    },
};

const arrayConfig = {
    skills: {
        title: "Skills",
        singular: "Skill",
        fields: [
            { name: "name", label: "Skill name", required: true },
            { name: "category", label: "Category" },
            { name: "proficiency", label: "Proficiency", type: "proficiency" },
        ],
    },
    projects: {
        title: "Projects",
        singular: "Project",
        fields: [
            { name: "title", label: "Project title", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "image", label: "Image URL", type: "url" },
            { name: "liveUrl", label: "Live URL", type: "url" },
            { name: "githubUrl", label: "GitHub URL", type: "url" },
            { name: "technologies", label: "Technologies", hint: "Separate with commas." },
        ],
    },
    experience: {
        title: "Experience",
        singular: "Experience",
        fields: [
            { name: "company", label: "Company", required: true },
            { name: "position", label: "Position", required: true },
            { name: "location", label: "Location" },
            { name: "employmentType", label: "Employment type" },
            { name: "startDate", label: "Start date", type: "date" },
            { name: "endDate", label: "End date", type: "date" },
            { name: "description", label: "Description", type: "textarea" },
        ],
    },
    education: {
        title: "Education",
        singular: "Education",
        fields: [
            { name: "institution", label: "Institution", required: true },
            { name: "degree", label: "Degree" },
            { name: "fieldOfStudy", label: "Field of study" },
            { name: "startDate", label: "Start date", type: "date" },
            { name: "endDate", label: "End date", type: "date" },
            { name: "grade", label: "Grade / CGPA" },
            { name: "description", label: "Description", type: "textarea" },
        ],
    },
    certifications: {
        title: "Certifications",
        singular: "Certification",
        fields: [
            { name: "name", label: "Certification name", required: true },
            { name: "issuer", label: "Issuer" },
            { name: "issueDate", label: "Issue date", type: "date" },
            { name: "credentialUrl", label: "Credential URL", type: "url" },
        ],
    },
};

function cleanStrings(object) {
    return Object.fromEntries(
        Object.entries(object).map(([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : value,
        ])
    );
}

function dateToISO(value) {
    return value ? `${value}T00:00:00.000Z` : null;
}

export default function CreatePortfolioPage() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [createdPortfolio, setCreatedPortfolio] = useState(null);
    const router = useRouter()

    function updateField(field, value) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function updateNested(section, field, value) {
        setForm((previous) => ({
            ...previous,
            [section]: {
                ...previous[section],
                [field]: value,
            },
        }));
    }

    function updateArrayItem(section, index, field, value) {
        setForm((previous) => ({
            ...previous,
            [section]: previous[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    }

    function addArrayItem(section) {
        setForm((previous) => ({
            ...previous,
            [section]: [
                ...previous[section],
                { ...itemDefaults[section] },
            ],
        }));
    }

    function removeArrayItem(section, index) {
        setForm((previous) => ({
            ...previous,
            [section]: previous[section].filter((_, i) => i !== index),
        }));
    }

    function renderArrayField(section, index, item, field) {
        const value = item[field.name] ?? "";

        if (field.type === "proficiency") {
            return (
                <div className={styles.field} key={field.name}>
                    <label htmlFor={`${section}-${index}-${field.name}`}>
                        {field.label}
                    </label>
                    <select
                        id={`${section}-${index}-${field.name}`}
                        value={value}
                        onChange={(e) =>
                            updateArrayItem(section, index, field.name, e.target.value)
                        }
                    >
                        {["beginner", "intermediate", "advanced", "expert"].map(
                            (level) => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            )
                        )}
                    </select>
                </div>
            );
        }

        if (field.type === "textarea") {
            return (
                <div className={styles.field} key={field.name}>
                    <label htmlFor={`${section}-${index}-${field.name}`}>
                        {field.label}
                    </label>
                    <textarea
                        id={`${section}-${index}-${field.name}`}
                        maxLength={2000}
                        value={value}
                        onChange={(e) =>
                            updateArrayItem(section, index, field.name, e.target.value)
                        }
                    />
                </div>
            );
        }

        if (field.name === "technologies") {
            return (
                <div className={styles.field} key={field.name}>
                    <label htmlFor={`${section}-${index}-${field.name}`}>
                        {field.label}
                    </label>
                    <input
                        id={`${section}-${index}-${field.name}`}
                        value={value}
                        placeholder="Next.js, Node.js, MongoDB"
                        onChange={(e) =>
                            updateArrayItem(section, index, field.name, e.target.value)
                        }
                    />
                    {field.hint && <small>{field.hint}</small>}
                </div>
            );
        }

        return (
            <div className={styles.field} key={field.name}>
                <label htmlFor={`${section}-${index}-${field.name}`}>
                    {field.label}{field.required ? " *" : ""}
                </label>
                <input
                    id={`${section}-${index}-${field.name}`}
                    type={field.type || "text"}
                    required={Boolean(field.required)}
                    value={value}
                    onChange={(e) =>
                        updateArrayItem(section, index, field.name, e.target.value)
                    }
                />
            </div>
        );
    }

    function preparePayload() {
        const payload = {
            ...form,
            title: form.title.trim(),
            slug: form.slug.trim().toLowerCase(),
            personalInfo: cleanStrings(form.personalInfo),
            socialLinks: cleanStrings(form.socialLinks),

            skills: form.skills
                .filter((item) => item.name.trim())
                .map((item) => cleanStrings(item)),

            projects: form.projects
                .filter((item) => item.title.trim())
                .map((item) => ({
                    ...cleanStrings(item),
                    technologies: item.technologies
                        .split(",")
                        .map((technology) => technology.trim())
                        .filter(Boolean),
                })),

            experience: form.experience
                .filter((item) => item.company.trim() || item.position.trim())
                .map((item) => ({
                    ...cleanStrings(item),
                    startDate: dateToISO(item.startDate),
                    endDate: item.currentlyWorking
                        ? null
                        : dateToISO(item.endDate),
                })),

            education: form.education
                .filter((item) => item.institution.trim())
                .map((item) => ({
                    ...cleanStrings(item),
                    startDate: dateToISO(item.startDate),
                    endDate: dateToISO(item.endDate),
                })),

            certifications: form.certifications
                .filter((item) => item.name.trim())
                .map((item) => ({
                    ...cleanStrings(item),
                    issueDate: dateToISO(item.issueDate),
                })),

            seo: {
                ...form.seo,
                metaTitle: form.seo.metaTitle.trim(),
                metaDescription: form.seo.metaDescription.trim(),
                keywords: form.seo.keywords
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
            },
        };

        return payload;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setMessageType("");
        setCreatedPortfolio(null);

        try {
            const payload = preparePayload();

            // Required field validation
            if (!payload.title) {
                throw new Error("Portfolio title is required.");
            }

            if (!payload.slug) {
                throw new Error("Portfolio slug is required.");
            }

            if (!payload.personalInfo.fullName) {
                throw new Error("Full name is required.");
            }

            if (!payload.personalInfo.headline) {
                throw new Error("Professional headline is required.");
            }

            // Experience validation
            for (const [index, item] of payload.experience.entries()) {
                if (!item.company || !item.position) {
                    throw new Error(
                        `Experience ${index + 1}: company and position are required.`
                    );
                }

                if (
                    item.startDate &&
                    item.endDate &&
                    new Date(item.endDate) < new Date(item.startDate)
                ) {
                    throw new Error(
                        `Experience ${index + 1}: end date cannot be before start date.`
                    );
                }
            }

            // Education date validation
            for (const [index, item] of payload.education.entries()) {
                if (
                    item.startDate &&
                    item.endDate &&
                    new Date(item.endDate) < new Date(item.startDate)
                ) {
                    throw new Error(
                        `Education ${index + 1}: end date cannot be before start date.`
                    );
                }
            }

            const result = await createPortfolio(payload);

            // Handle the API response
            if (!result || result.success === false) {
                throw new Error(
                    result?.message || "Failed to create portfolio."
                );
            }

            const portfolio = result.data;

            if (!portfolio) {
                throw new Error(
                    "Portfolio response is missing the created portfolio data."
                );
            }

            setCreatedPortfolio(portfolio);
            setMessage(result.message || "Portfolio created successfully!");
            setMessageType("success");

            // Use the API response directly, not React state
            const slug = portfolio.slug || payload.slug;

            router.push(`/portfolio/${encodeURIComponent(slug)}`);

        } catch (error) {
            setMessage(error.message || "Failed to create portfolio.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    function renderPersonalField(name, label, options = {}) {
        const { type = "text", required = false, maxLength } = options;

        return (
            <div className={styles.field} key={name}>
                <label htmlFor={`personal-${name}`}>
                    {label}{required ? " *" : ""}
                </label>
                <input
                    id={`personal-${name}`}
                    type={type}
                    required={required}
                    maxLength={maxLength}
                    value={form.personalInfo[name]}
                    onChange={(e) =>
                        updateNested("personalInfo", name, e.target.value)
                    }
                />
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.heading}>Create Your Portfolio</h1>
            <p className={styles.description}>
                Fill in your information to create your developer portfolio.
                Fields marked with * are required.
            </p>

            {message && (
                <div
                    className={`${styles.message} ${messageType === "success" ? styles.success : styles.error
                        }`}
                    role="status"
                >
                    {message}
                    {createdPortfolio?.slug && (
                        <p>Portfolio slug: {createdPortfolio.slug}</p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <section className={styles.section}>
                    <h2>Basic Details</h2>

                    <div className={styles.field}>
                        <label htmlFor="title">Portfolio title *</label>
                        <input
                            id="title"
                            required
                            maxLength={100}
                            value={form.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Nitin Kumar - Full Stack Developer"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="slug">Portfolio slug *</label>
                        <input
                            id="slug"
                            required
                            maxLength={100}
                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            value={form.slug}
                            onChange={(e) =>
                                updateField(
                                    "slug",
                                    e.target.value.toLowerCase().replace(/\s+/g, "-")
                                )
                            }
                            placeholder="nitin-kumar"
                        />
                        <small className={styles.fieldHint}>
                            Example URL: /portfolio/nitin-kumar
                        </small>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="template">Template *</label>
                        <select
                            id="template"
                            required
                            value={form.template}
                            onChange={(e) => updateField("template", e.target.value)}
                        >
                            <option value="minimal">Minimal</option>
                            <option value="modern">Modern</option>
                            <option value="developer">Developer</option>
                            <option value="creative">Creative</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="status">Status *</label>
                        <select
                            id="status"
                            required
                            value={form.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Personal Information</h2>

                    {renderPersonalField("fullName", "Full name", {
                        required: true,
                        maxLength: 150,
                    })}
                    {renderPersonalField("headline", "Professional headline", {
                        required: true,
                        maxLength: 200,
                    })}
                    {renderPersonalField("email", "Email address", { type: "email" })}
                    {renderPersonalField("phone", "Phone")}
                    {renderPersonalField("location", "Location")}
                    {renderPersonalField("profileImage", "Profile image URL", {
                        type: "url",
                    })}
                    {renderPersonalField("resumeUrl", "Resume URL", { type: "url" })}
                    {renderPersonalField("website", "Personal website (optional)", {
                        type: "url",
                    })}

                    <div className={styles.field}>
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            maxLength={2000}
                            value={form.personalInfo.bio}
                            onChange={(e) =>
                                updateNested("personalInfo", "bio", e.target.value)
                            }
                            placeholder="Tell visitors about yourself..."
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Social Links</h2>

                    {Object.keys(form.socialLinks).map((name) => (
                        <div className={styles.field} key={name}>
                            <label htmlFor={`social-${name}`}>
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </label>
                            <input
                                id={`social-${name}`}
                                type="url"
                                value={form.socialLinks[name]}
                                placeholder={`https://${name}.com/your-profile`}
                                onChange={(e) =>
                                    updateNested("socialLinks", name, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </section>

                {Object.entries(arrayConfig).map(([section, config]) => (
                    <section className={styles.section} key={section}>
                        <div className={styles.sectionHeading}>
                            <h2>{config.title}</h2>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => addArrayItem(section)}
                            >
                                + Add {config.singular}
                            </button>
                        </div>

                        {form[section].length === 0 && (
                            <p className={styles.fieldHint}>
                                No entries added. You can leave this section empty.
                            </p>
                        )}

                        {form[section].map((item, index) => (
                            <div
                                className={styles.repeatableCard}
                                key={`${section}-${index}`}
                            >
                                <div className={styles.repeatableCardHeading}>
                                    <h3>
                                        {config.singular} {index + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => removeArrayItem(section, index)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                {config.fields.map((field) =>
                                    renderArrayField(section, index, item, field)
                                )}

                                {section === "projects" && (
                                    <label className={styles.checkboxField}>
                                        <input
                                            type="checkbox"
                                            checked={item.featured}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    section, index, "featured", e.target.checked
                                                )
                                            }
                                        />
                                        Featured project
                                    </label>
                                )}

                                {section === "experience" && (
                                    <label className={styles.checkboxField}>
                                        <input
                                            type="checkbox"
                                            checked={item.currentlyWorking}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    section,
                                                    index,
                                                    "currentlyWorking",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        I currently work here
                                    </label>
                                )}
                            </div>
                        ))}
                    </section>
                ))}

                <section className={styles.section}>
                    <h2>Theme</h2>

                    {[
                        ["primaryColor", "Primary color"],
                        ["backgroundColor", "Background color"],
                        ["textColor", "Text color"],
                    ].map(([name, label]) => (
                        <div className={styles.field} key={name}>
                            <label htmlFor={`theme-${name}`}>{label}</label>
                            <input
                                id={`theme-${name}`}
                                type="color"
                                value={form.theme[name]}
                                onChange={(e) =>
                                    updateNested("theme", name, e.target.value)
                                }
                            />
                        </div>
                    ))}

                    <div className={styles.field}>
                        <label htmlFor="fontFamily">Font family</label>
                        <select
                            id="fontFamily"
                            value={form.theme.fontFamily}
                            onChange={(e) =>
                                updateNested("theme", "fontFamily", e.target.value)
                            }
                        >
                            <option value="Arial">Arial</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Georgia">Georgia</option>
                            <option value="system-ui">System UI</option>
                        </select>
                    </div>

                    <label className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={form.theme.darkMode}
                            onChange={(e) =>
                                updateNested("theme", "darkMode", e.target.checked)
                            }
                        />
                        Enable dark mode
                    </label>
                </section>

                <section className={styles.section}>
                    <h2>Portfolio Sections</h2>
                    <p className={styles.fieldHint}>
                        Select which sections you want to display.
                    </p>

                    <div className={styles.checkboxGrid}>
                        {Object.keys(form.sections).map((name) => (
                            <label className={styles.checkboxField} key={name}>
                                <input
                                    type="checkbox"
                                    checked={form.sections[name]}
                                    onChange={(e) =>
                                        updateNested("sections", name, e.target.checked)
                                    }
                                />
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </label>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>SEO Settings</h2>

                    <div className={styles.field}>
                        <label htmlFor="metaTitle">Meta title</label>
                        <input
                            id="metaTitle"
                            maxLength={100}
                            value={form.seo.metaTitle}
                            onChange={(e) =>
                                updateNested("seo", "metaTitle", e.target.value)
                            }
                            placeholder="Nitin Kumar | Full Stack Developer"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="metaDescription">Meta description</label>
                        <textarea
                            id="metaDescription"
                            maxLength={300}
                            value={form.seo.metaDescription}
                            onChange={(e) =>
                                updateNested("seo", "metaDescription", e.target.value)
                            }
                            placeholder="Describe your portfolio in a few sentences."
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="keywords">Keywords</label>
                        <input
                            id="keywords"
                            value={form.seo.keywords}
                            onChange={(e) =>
                                updateNested("seo", "keywords", e.target.value)
                            }
                            placeholder="MERN, React, Next.js, Node.js"
                        />
                        <small className={styles.fieldHint}>
                            Separate keywords with commas.
                        </small>
                    </div>
                </section>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.resetButton}
                        disabled={loading}
                        onClick={() => {
                            setForm(initialForm);
                            setMessage("");
                            setMessageType("");
                            setCreatedPortfolio(null);
                        }}
                    >
                        Reset form
                    </button>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Creating portfolio..." : "Create Portfolio"}
                    </button>
                </div>
            </form>
        </main>
    );
}