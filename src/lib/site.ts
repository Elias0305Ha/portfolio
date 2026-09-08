/** Set NEXT_PUBLIC_SITE_URL at build time once the domain is decided. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE = {
  name: "Elias Hakenso",
  role: "Data · AI/ML · Engineering",
  linkedin: "https://www.linkedin.com/in/elias-hakenso-b74b5721a",
  description:
    "Data analysis, AI/ML evaluation and full-stack engineering. Three years of institutional data work, a BS in Computer Information Technology, and an MS in Data Science in progress.",
  url: siteUrl,
  github: "https://github.com/Elias0305Ha",
} as const;
