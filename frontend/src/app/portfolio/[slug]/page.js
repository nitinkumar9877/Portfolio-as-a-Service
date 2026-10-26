"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../components/stylesheets/portfolioProfile.module.css";
import { getPortfolioProfile } from "@/components/services/portfolioService";

export default function GetUserProfile() {
  const params = useParams();
  const slug = params?.slug;
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setError("");
      setPortfolio(null);

      try {
        const apiResponse = await getPortfolioProfile(slug);

        // Supports either an Axios response or an already-unwrapped result.
        const result =
          apiResponse?.data?.data ??
          apiResponse?.data ??
          apiResponse?.data?.portfolio ??
          apiResponse;

        if (!result || apiResponse?.success === false) {
          throw new Error(
            apiResponse?.message || "Portfolio could not be found."
          );
        }
        console.log("This is the result from the api :: ", result)
        if (!cancelled) {
          setPortfolio(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load this portfolio. Please try again."
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

  if (loading) {
    return (
      <main className={styles.statePage}>
        <div className={styles.loader} />
        <p>Loading portfolio...</p>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className={styles.statePage}>
        <div className={styles.errorIcon}>!</div>
        <h1>Portfolio not found</h1>
        <p>{error || "This portfolio is unavailable."}</p>
        <Link href="/" className={styles.primaryButton}>
          Go to Home
        </Link>
      </main>
    );
  }

  const personal = portfolio.response.personalInfo || {};
  const social = portfolio.response.socialLinks || {};
  const theme = portfolio.response.theme || {};
  const sections = portfolio.response.sections || {};

  const primaryColor = theme.primaryColor || "#635bff";
  const backgroundColor = theme.backgroundColor || "#f7f8fc";
  const textColor = theme.textColor || "#182230";
  const fontFamily = theme.fontFamily || "Arial, sans-serif";
  const darkMode = Boolean(theme.darkMode);

  const visible = (section) => sections[section] !== false;

  const formatDate = (date) => {
    if (!date) return "Present";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const safeUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch {
      return null;
    }

    return null;
  };

  const socialItems = [
    { key: "github", label: "GitHub", url: safeUrl(social.github) },
    { key: "linkedin", label: "LinkedIn", url: safeUrl(social.linkedin) },
    { key: "twitter", label: "X / Twitter", url: safeUrl(social.twitter) },
    { key: "instagram", label: "Instagram", url: safeUrl(social.instagram) },
    { key: "youtube", label: "YouTube", url: safeUrl(social.youtube) },
  ].filter((item) => item.url);

  const skills = portfolio.response.skills || [];
  const projects = portfolio.response.projects || [];
  const experience = portfolio.response.experience || [];
  const education = portfolio.response.education || [];
  const certifications = portfolio.response.certifications || [];

  return (
    <main
      className={`${styles.portfolio} ${darkMode ? styles.dark : ""}`}
      style={{
        "--primary": primaryColor,
        "--portfolio-bg": backgroundColor,
        "--portfolio-text": textColor,
        fontFamily,
      }}
    >
      <nav className={styles.navbar}>
        <a href="#home" className={styles.brand}>
          {personal.fullName || portfolio.title}
          <span>.</span>
        </a>

        <div className={styles.navLinks}>
          <a href="#about">About</a>
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
            rel="noreferrer"
            className={styles.navButton}
          >
            Resume ↗
          </a>
        )}
      </nav>

      <div className={styles.content}>
        <section className={styles.hero} id="home">
          <div className={styles.heroText}>
            <div className={styles.availability}>
              <span />
              MY PORTFOLIO
            </div>

            <p className={styles.eyebrow}>HELLO, I'M</p>

            <h1>
              {personal.fullName || portfolio.title}
              <span className={styles.nameDot}>.</span>
            </h1>

            <h2>{personal.headline || "Developer & Creator"}</h2>

            <p className={styles.heroBio}>
              {personal.bio ||
                "Welcome to my portfolio. Explore my skills, projects, and experience."}
            </p>

            <div className={styles.heroActions}>
              <a href="#projects" className={styles.primaryButton}>
                Explore my work <span>↗</span>
              </a>

              <a href="#contact" className={styles.secondaryButton}>
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
                    rel="noreferrer"
                  >
                    {item.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.imageGlow} />

            {safeUrl(personal.profileImage) ? (
              <img
                src={safeUrl(personal.profileImage)}
                alt={personal.fullName || "Portfolio profile"}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <img
                  src={safeUrl(personal.profileImage)}
                  alt={personal.fullName || "Portfolio profile"}
                  className={styles.profileImage}
                />
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

        <div className={styles.statsBar}>
          <div>
            <strong>{projects.length.toString().padStart(2, "0")}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{experience.length.toString().padStart(2, "0")}</strong>
            <span>Experiences</span>
          </div>
          <div>
            <strong>{skills.length.toString().padStart(2, "0")}</strong>
            <span>Skills</span>
          </div>
          <div>
            <strong>{certifications.length.toString().padStart(2, "0")}</strong>
            <span>Certifications</span>
          </div>
        </div>

        {visible("about") && (
          <section className={styles.section} id="about">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>GET TO KNOW ME</p>
              <h2>About me<span>.</span></h2>
            </div>

            <div className={styles.aboutCard}>
              <div className={styles.aboutMark}>“</div>
              <div>
                <h3>{personal.headline || "A little about me"}</h3>
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

        {visible("skills") && skills.length > 0 && (
          <section className={styles.section} id="skills">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>WHAT I WORK WITH</p>
              <h2>My skills<span>.</span></h2>
              <p className={styles.sectionDescription}>
                Technologies and tools I use to turn ideas into products.
              </p>
            </div>

            <div className={styles.skillsGrid}>
              {skills.map((skill, index) => (
                <article
                  className={styles.skillCard}
                  key={`${skill.name}-${index}`}
                >
                  <div className={styles.skillTop}>
                    <span className={styles.skillNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.skillSymbol}>✳</span>
                  </div>
                  <h3>{skill.name}</h3>
                  {skill.category && <p>{skill.category}</p>}
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

        {visible("projects") && projects.length > 0 && (
          <section className={styles.section} id="projects">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>SELECTED WORK</p>
              <h2>Featured projects<span>.</span></h2>
              <p className={styles.sectionDescription}>
                A selection of things I've built and learned from.
              </p>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project, index) => (
                <article
                  className={styles.projectCard}
                  key={`${project.title}-${index}`}
                >
                  <div className={styles.projectVisual}>
                    {safeUrl(project.image) ? (
                      <img src={safeUrl(project.image)} alt={project.title} />
                    ) : (
                      <div className={styles.projectPlaceholder}>
                        <span>0{index + 1}</span>
                        <strong>{project.title}</strong>
                      </div>
                    )}

                    {project.featured && (
                      <span className={styles.featuredBadge}>FEATURED</span>
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
                          {project.technologies.map((technology) => (
                            <span key={technology}>{technology}</span>
                          ))}
                        </div>
                      )}

                    <div className={styles.projectLinks}>
                      {safeUrl(project.liveUrl) && (
                        <a
                          href={safeUrl(project.liveUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live demo ↗
                        </a>
                      )}
                      {safeUrl(project.githubUrl) && (
                        <a
                          href={safeUrl(project.githubUrl)}
                          target="_blank"
                          rel="noreferrer"
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

        {visible("experience") && experience.length > 0 && (
          <section className={styles.section} id="experience">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>MY JOURNEY</p>
              <h2>Experience<span>.</span></h2>
            </div>

            <div className={styles.timeline}>
              {experience.map((item, index) => (
                <article
                  className={styles.timelineItem}
                  key={`${item.company}-${index}`}
                >
                  <div className={styles.timelineMarker} />

                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTop}>
                      <div>
                        <h3>{item.position}</h3>
                        <p className={styles.company}>{item.company}</p>
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

                    {item.description && <p>{item.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {visible("education") && education.length > 0 && (
          <section className={styles.section} id="education">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>LEARNING & GROWTH</p>
              <h2>Education<span>.</span></h2>
            </div>

            <div className={styles.educationGrid}>
              {education.map((item, index) => (
                <article
                  className={styles.educationCard}
                  key={`${item.institution}-${index}`}
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
                      {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </p>
                  )}
                  {item.grade && (
                    <span className={styles.gradeBadge}>{item.grade}</span>
                  )}
                  {item.description && <p>{item.description}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {visible("certifications") && certifications.length > 0 && (
          <section className={styles.section} id="certifications">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>CREDENTIALS</p>
              <h2>Certifications<span>.</span></h2>
            </div>

            <div className={styles.certificationList}>
              {certifications.map((item, index) => (
                <article
                  className={styles.certificationCard}
                  key={`${item.name}-${index}`}
                >
                  <div className={styles.certIcon}>✓</div>
                  <div className={styles.certInfo}>
                    <h3>{item.name}</h3>
                    {item.issuer && <p>{item.issuer}</p>}
                    {item.issueDate && (
                      <span>{formatDate(item.issueDate)}</span>
                    )}
                  </div>
                  {safeUrl(item.credentialUrl) && (
                    <a
                      href={safeUrl(item.credentialUrl)}
                      target="_blank"
                      rel="noreferrer"
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

        <section className={styles.contactSection} id="contact">
          <p className={styles.eyebrow}>HAVE A PROJECT IN MIND?</p>
          <h2>Let's build something<br />great together<span>.</span></h2>
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
                rel="noreferrer"
                className={styles.secondaryButton}
              >
                Personal website
              </a>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <a href="#home" className={styles.brand}>
            {personal.fullName || portfolio.title}
            <span>.</span>
          </a>
          <p>Designed with purpose. Built with passion.</p>
          <a href="#home">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}