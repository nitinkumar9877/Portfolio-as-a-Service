
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getPortfolioProfile } from "@/components/services/portfolioService";
import styles from "../../../components/stylesheets/portfolioProfile.module.css";

export default function PortfolioPage() {
    const params = useParams();
    const slug = params.slug;

    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!slug) return;

        let isMounted = true;

        const fetchPortfolio = async () => {
            try {
                setLoading(true);
                setError("");

                const apiResponse = await getPortfolioProfile(slug);

                console.log("Complete API Response:", apiResponse);

                if (!apiResponse) {
                    throw new Error("API request failed");
                }

                // Your backend returns:
                // {
                //   success: true,
                //   response: { portfolio data }
                // }

                const result = apiResponse?.data?.response;

                console.log("Portfolio Data:", result);

                if (!apiResponse?.data?.success || !result) {
                    throw new Error(
                        apiResponse?.data?.message ||
                        "Portfolio not found"
                    );
                }

                if (!result.personalInfo) {
                    throw new Error("Personal information not found");
                }

                if (isMounted) {
                    setPortfolio(result);
                }

            } catch (err) {
                console.error("Portfolio Fetch Error:", err);

                if (isMounted) {
                    setError(err.message || "Something went wrong");
                }

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPortfolio();

        return () => {
            isMounted = false;
        };

    }, [slug]);

    // LOADING
    if (loading) {
        return (
            <div className={styles.centerMessage}>
                <div className={styles.loader}></div>
                <p>Loading portfolio...</p>
            </div>
        );
    }

    // ERROR
    if (error || !portfolio) {
        return (
            <div className={styles.centerMessage}>
                <h2>Portfolio Not Found</h2>
                <p>{error || "Portfolio does not exist."}</p>
            </div>
        );
    }

    // DESTRUCTURING PORTFOLIO DATA
    const {
        title,
        template,
        personalInfo,
        socialLinks = {},
        skills = [],
        projects = [],
        experience = [],
        education = [],
        certifications = [],
        theme = {},
        sections = {},
        seo = {},
        status,
    } = portfolio;

    const {
        fullName,
        headline,
        bio,
        email,
        phone,
        location,
        profileImage,
        resumeUrl,
        website,
    } = personalInfo;

    console.log("Portfolio Title:", title);
    console.log("Portfolio Owner:", fullName);
    console.log("Portfolio Template:", template);
    console.log("Portfolio SEO:", seo);

    return (
        <main className={styles.portfolio}>

            <nav className={styles.navbar}>
                <h2>{fullName}</h2>

                <div className={styles.navLinks}>
                    <a href="#about">About</a>
                    <a href="#skills">Skills</a>
                    <a href="#projects">Projects</a>
                    <a href="#experience">Experience</a>
                    <a href="#education">Education</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>

            <section id="home" className={styles.hero}>
                <div className={styles.heroContent}>
                    <span>Hello, I'm</span>

                    <h1>{fullName}</h1>

                    <h2>{headline}</h2>

                    <p>{bio}</p>

                    {location && <p>📍 {location}</p>}

                    {email && (
                        <a href={`mailto:${email}`}>
                            Contact Me
                        </a>
                    )}

                    {resumeUrl && (
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download Resume
                        </a>
                    )}
                </div>

                <div className={styles.heroImage}>
                    {profileImage && (
                        <img src={profileImage} alt={fullName} />
                    )}
                </div>
            </section>

            {/* ABOUT */}
            {sections.about !== false && (
                <section id="about" className={styles.section}>
                    <h2>About Me</h2>
                    <p>{bio}</p>
                    <p>{website}</p>
                </section>
            )}

            {/* SKILLS */}
            {sections.skills !== false && skills.length > 0 && (
                <section id="skills" className={styles.section}>
                    <h2>My Skills</h2>

                    <div className={styles.skillsGrid}>
                        {skills.map((skill, index) => (
                            <div key={index} className={styles.skillCard}>
                                <h3>{skill.name}</h3>
                                <p>{skill.category}</p>
                                <span>{skill.proficiency}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS */}
            {sections.projects !== false && projects.length > 0 && (
                <section id="projects" className={styles.section}>
                    <h2>My Projects</h2>

                    <div className={styles.projectsGrid}>
                        {projects.map((project, index) => (
                            <div key={index} className={styles.projectCard}>
                                {project.image && (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                    />
                                )}

                                <h3>{project.title}</h3>
                                <p>{project.description}</p>

                                <div>
                                    {project.technologies?.map((tech, i) => (
                                        <span key={i}>{tech} </span>
                                    ))}
                                </div>

                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                        Live Demo
                                    </a>
                                )}

                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                        GitHub
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EXPERIENCE */}
            {sections.experience !== false && experience.length > 0 && (
                <section id="experience" className={styles.section}>
                    <h2>Experience</h2>

                    {experience.map((item, index) => (
                        <div key={index}>
                            <h3>{item.position}</h3>
                            <h4>{item.company}</h4>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* EDUCATION */}
            {sections.education !== false && education.length > 0 && (
                <section id="education" className={styles.section}>
                    <h2>Education</h2>

                    {education.map((item, index) => (
                        <div key={index}>
                            <h3>{item.institution}</h3>
                            <h4>{item.degree}</h4>
                            <p>{item.fieldOfStudy}</p>
                            <p>{item.grade}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* CERTIFICATIONS */}
            {sections.certifications !== false && certifications.length > 0 && (
                <section className={styles.section}>
                    <h2>Certifications</h2>

                    {certifications.map((item, index) => (
                        <div key={index}>
                            <h3>{item.name}</h3>
                            <p>{item.issuer}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* CONTACT */}
            {sections.contact !== false && (
                <section id="contact" className={styles.section}>
                    <h2>Contact Me</h2>

                    {email && <p>Email: {email}</p>}
                    {phone && <p>Phone: {phone}</p>}
                    {location && <p>Location: {location}</p>}
                </section>
            )}

            <footer className={styles.footer}>
                <p>
                    © {new Date().getFullYear()} {fullName}.
                    All rights reserved.
                </p>
            </footer>

        </main>
    );
}
