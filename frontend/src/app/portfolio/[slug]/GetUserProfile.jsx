"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import styles from "../../../components/stylesheets/portfolioProfile.module.css";
import { getPortfolioProfile } from "@/components/services/portfolioService";

export default function GetUserProfile({ slug }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch portfolio whenever slug changes.
  useEffect(() => {
    if (!slug) {
      setError("Portfolio URL is invalid.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");
        setPortfolio(null);

        const apiResponse = await getPortfolioProfile(slug);

        // Handle Axios response and unwrapped response.
        const payload = apiResponse?.data ?? apiResponse;

        if (
          apiResponse?.success === false ||
          payload?.success === false
        ) {
          throw new Error(
            payload?.message ||
              apiResponse?.message ||
              "Portfolio could not be found."
          );
        }

        // Extract portfolio from supported API response structures.
        const result =
          payload?.data?.portfolio ??
          payload?.data ??
          payload?.portfolio ??
          payload;

        if (
          !result ||
          typeof result !== "object" ||
          Array.isArray(result)
        ) {
          throw new Error("Invalid portfolio response.");
        }

        const portfolioData = result.response
          ? result
          : result.portfolio?.response
            ? result.portfolio
            : result;

        if (!cancelled) {
          setPortfolio(portfolioData);
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this portfolio. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <main className={styles.statePage}>
        <div className={styles.loader} />
        <p>Loading portfolio...</p>
      </main>
    );
  }

  // Error state
  if (error || !portfolio) {
    return (
      <main className={styles.statePage}>
        <div className={styles.errorIcon}>!</div>

        <h1>Portfolio not found</h1>

        <p>
          {error || "This portfolio is unavailable."}
        </p>

        <Link href="/" className={styles.primaryButton}>
          Go to Home
        </Link>
      </main>
    );
  }

  // Portfolio data
  const response = portfolio.response || portfolio;

  const personal = response.personalInfo || {};
  const social = response.socialLinks || {};
  const theme = response.theme || {};
  const sections = response.sections || {};

  // Theme settings
  const primaryColor = theme.primaryColor || "#635bff";
  const backgroundColor = theme.backgroundColor || "#f7f8fc";
  const textColor = theme.textColor || "#182230";
  const fontFamily = theme.fontFamily || "Arial, sans-serif";
  const darkMode = Boolean(theme.darkMode);

  // Safely handle arrays
  const skills = Array.isArray(response.skills)
    ? response.skills
    : [];

  const projects = Array.isArray(response.projects)
    ? response.projects
    : [];

  const experience = Array.isArray(response.experience)
    ? response.experience
    : [];

  const education = Array.isArray(response.education)
    ? response.education
    : [];

  const certifications = Array.isArray(response.certifications)
    ? response.certifications
    : [];

  // Section visibility
  const visible = (section) => sections[section] !== false;

  // Date formatter
  const formatDate = (date) => {
    if (!date) return "Present";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // URL validation
  const safeUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    try {
      const parsed = new URL(url.trim());

      if (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      ) {
        return parsed.href;
      }
    } catch {
      return null;
    }

    return null;
  };

  // Social links
  const socialItems = [
    {
      key: "github",
      label: "GitHub",
      url: safeUrl(social.github),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      url: safeUrl(social.linkedin),
    },
    {
      key: "twitter",
      label: "X / Twitter",
      url: safeUrl(social.twitter),
    },
    {
      key: "instagram",
      label: "Instagram",
      url: safeUrl(social.instagram),
    },
    {
      key: "youtube",
      label: "YouTube",
      url: safeUrl(social.youtube),
    },
  ].filter((item) => item.url);

  const profileName =
    personal.fullName || portfolio.title || "My Portfolio";

  const profileImage = safeUrl(personal.profileImage);

  return (
    <main
      className={`${styles.portfolio} ${
        darkMode ? styles.dark : ""
      }`}
      style={{
        "--primary": primaryColor,
        "--portfolio-bg": backgroundColor,
        "--portfolio-text": textColor,
        fontFamily,
      }}
    >
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <a href="#home" className={styles.brand}>
          {profileName}
          <span>.</span>
        </a>

        <div className={styles.navLinks}>
          {visible("about") && (
            <a href="#about">About</a>
          )}

          {visible("skills") && skills.length > 0 && (
            <a href="#skills">Skills</a>
          )}

          {visible("projects") && projects.length > 0 && (
            <a href="#projects">Projects</a>
          )}

          {visible("experience") && experience.length > 0 && (
            <a href="#experience">Experience</a>
          )}

          {visible("education") && education.length > 0 && (
            <a href="#education">Education</a>
          )}

          <a href="#contact">Contact</a>
        </div>

        {safeUrl(personal.resumeUrl) && (
          <a
            href={safeUrl(personal.resumeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navButton}
          >
            Resume ↗
          </a>
        )}
      </nav>

      <div className={styles.content}>

        {/* HERO SECTION */}
        <section className={styles.hero} id="home">
          <div className={styles.heroText}>
            <div className={styles.availability}>
              <span />
              MY PORTFOLIO
            </div>

            <p className={styles.eyebrow}>HELLO, I'M</p>

            <h1>
              {profileName}
              <span className={styles.nameDot}>.</span>
            </h1>

            <h2>
              {personal.headline || "Developer & Creator"}
            </h2>

            <p className={styles.heroBio}>
              {personal.bio ||
                "Welcome to my portfolio. Explore my skills, projects, and experience."}
            </p>

            <div className={styles.heroActions}>
              <a
                href="#projects"
                className={styles.primaryButton}
              >
                Explore my work <span>↗</span>
              </a>

              <a
                href="#contact"
                className={styles.secondaryButton}
              >
                Contact me
              </a>
            </div>

            {socialItems.length > 0 && (
              <div className={styles.socialLinks}>
                {socialItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.imageGlow} />

            {profileImage ? (
              <img
                src={profileImage}
                alt={profileName}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className={styles.floatingCard}>
              <span className={styles.floatingIcon}>✳</span>

              <div>
                <strong>{skills.length}+</strong>
                <p>Skills listed</p>
              </div>
            </div>

            {personal.location && (
              <div className={styles.locationCard}>
                <span>⌖</span> {personal.location}
              </div>
            )}
          </div>
        </section>

        {/* STATISTICS */}
        <div className={styles.statsBar}>
          <div>
            <strong>
              {String(projects.length).padStart(2, "0")}
            </strong>
            <span>Projects</span>
          </div>

          <div>
            <strong>
              {String(experience.length).padStart(2, "0")}
            </strong>
            <span>Experiences</span>
          </div>

          <div>
            <strong>
              {String(skills.length).padStart(2, "0")}
            </strong>
            <span>Skills</span>
          </div>

          <div>
            <strong>
              {String(certifications.length).padStart(2, "0")}
            </strong>
            <span>Certifications</span>
          </div>
        </div>

        {/* ABOUT SECTION */}
        {visible("about") && (
          <section className={styles.section} id="about">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>GET TO KNOW ME</p>

              <h2>
                About me<span>.</span>
              </h2>
            </div>

            <div className={styles.aboutCard}>
              <div className={styles.aboutMark}>“</div>

              <div>
                <h3>
                  {personal.headline || "A little about me"}
                </h3>

                <p>
                  {personal.bio ||
                    "More information about this person will be available soon."}
                </p>

                {personal.location && (
                  <p className={styles.aboutLocation}>
                    Based in {personal.location}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SKILLS SECTION */}
        {visible("skills") && skills.length > 0 && (
          <section className={styles.section} id="skills">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>WHAT I WORK WITH</p>

              <h2>
                My skills<span>.</span>
              </h2>

              <p className={styles.sectionDescription}>
                Technologies and tools I use to turn ideas into products.
              </p>
            </div>

            <div className={styles.skillsGrid}>
              {skills.map((skill, index) => (
                <article
                  className={styles.skillCard}
                  key={skill._id || `${skill.name}-${index}`}
                >
                  <div className={styles.skillTop}>
                    <span className={styles.skillNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.skillSymbol}>✳</span>
                  </div>

                  <h3>{skill.name}</h3>

                  {skill.category && (
                    <p>{skill.category}</p>
                  )}

                  {skill.proficiency && (
                    <span className={styles.proficiency}>
                      {skill.proficiency}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {visible("projects") && projects.length > 0 && (
          <section className={styles.section} id="projects">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>SELECTED WORK</p>

              <h2>
                Featured projects<span>.</span>
              </h2>

              <p className={styles.sectionDescription}>
                A selection of things I've built and learned from.
              </p>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project, index) => (
                <article
                  className={styles.projectCard}
                  key={project._id || `${project.title}-${index}`}
                >
                  <div className={styles.projectVisual}>
                    {safeUrl(project.image) ? (
                      <img
                        src={safeUrl(project.image)}
                        alt={project.title || "Project image"}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.projectPlaceholder}>
                        <span>
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <strong>{project.title}</strong>
                      </div>
                    )}

                    {project.featured && (
                      <span className={styles.featuredBadge}>
                        FEATURED
                      </span>
                    )}
                  </div>

                  <div className={styles.projectBody}>
                    <span className={styles.projectIndex}>
                      PROJECT / {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>{project.title}</h3>

                    <p>
                      {project.description ||
                        "A project built with care and attention to detail."}
                    </p>

                    {Array.isArray(project.technologies) &&
                      project.technologies.length > 0 && (
                        <div className={styles.technologyList}>
                          {project.technologies.map(
                            (technology, techIndex) => (
                              <span key={`${technology}-${techIndex}`}>
                                {technology}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className={styles.projectLinks}>
                      {safeUrl(project.liveUrl) && (
                        <a
                          href={safeUrl(project.liveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live demo ↗
                        </a>
                      )}

                      {safeUrl(project.githubUrl) && (
                        <a
                          href={safeUrl(project.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Source code ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {visible("experience") && experience.length > 0 && (
          <section className={styles.section} id="experience">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>MY JOURNEY</p>

              <h2>
                Experience<span>.</span>
              </h2>
            </div>

            <div className={styles.timeline}>
              {experience.map((item, index) => (
                <article
                  className={styles.timelineItem}
                  key={item._id || `${item.company}-${index}`}
                >
                  <div className={styles.timelineMarker} />

                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTop}>
                      <div>
                        <h3>{item.position}</h3>

                        <p className={styles.company}>
                          {item.company}
                        </p>
                      </div>

                      <span className={styles.dateBadge}>
                        {formatDate(item.startDate)} —{" "}
                        {item.currentlyWorking
                          ? "Present"
                          : formatDate(item.endDate)}
                      </span>
                    </div>

                    {(item.location || item.employmentType) && (
                      <p className={styles.metaText}>
                        {[item.location, item.employmentType]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    {item.description && (
                      <p>{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {visible("education") && education.length > 0 && (
          <section className={styles.section} id="education">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>LEARNING & GROWTH</p>

              <h2>
                Education<span>.</span>
              </h2>
            </div>

            <div className={styles.educationGrid}>
              {education.map((item, index) => (
                <article
                  className={styles.educationCard}
                  key={item._id || `${item.institution}-${index}`}
                >
                  <span className={styles.cardIcon}>✳</span>

                  <h3>{item.institution}</h3>

                  <p className={styles.degree}>
                    {[item.degree, item.fieldOfStudy]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  {(item.startDate || item.endDate) && (
                    <p className={styles.metaText}>
                      {formatDate(item.startDate)} —{" "}
                      {formatDate(item.endDate)}
                    </p>
                  )}

                  {item.grade && (
                    <span className={styles.gradeBadge}>
                      {item.grade}
                    </span>
                  )}

                  {item.description && (
                    <p>{item.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS SECTION */}
        {visible("certifications") &&
          certifications.length > 0 && (
            <section
              className={styles.section}
              id="certifications"
            >
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>CREDENTIALS</p>

                <h2>
                  Certifications<span>.</span>
                </h2>
              </div>

              <div className={styles.certificationList}>
                {certifications.map((item, index) => (
                  <article
                    className={styles.certificationCard}
                    key={item._id || `${item.name}-${index}`}
                  >
                    <div className={styles.certIcon}>✓</div>

                    <div className={styles.certInfo}>
                      <h3>{item.name}</h3>

                      {item.issuer && (
                        <p>{item.issuer}</p>
                      )}

                      {item.issueDate && (
                        <span>
                          {formatDate(item.issueDate)}
                        </span>
                      )}
                    </div>

                    {safeUrl(item.credentialUrl) && (
                      <a
                        href={safeUrl(item.credentialUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.credentialLink}
                      >
                        View credential ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

        {/* CONTACT SECTION */}
        <section className={styles.contactSection} id="contact">
          <p className={styles.eyebrow}>
            HAVE A PROJECT IN MIND?
          </p>

          <h2>
            Let's build something
            <br />
            great together<span>.</span>
          </h2>

          <p>
            Interested in working together or just want to say hello?
            My inbox is open.
          </p>

          <div className={styles.contactActions}>
            {personal.email && (
              <a
                href={`mailto:${personal.email}`}
                className={styles.primaryButton}
              >
                Email me ↗
              </a>
            )}

            {safeUrl(personal.website) && (
              <a
                href={safeUrl(personal.website)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                Personal website
              </a>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <a href="#home" className={styles.brand}>
            {profileName}
            <span>.</span>
          </a>

          <p>Designed with purpose. Built with passion.</p>

          <a href="#home">Back to top ↑</a>
        </footer>

      </div>
    </main>
  );
}
