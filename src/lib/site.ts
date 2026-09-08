/** Set NEXT_PUBLIC_SITE_URL at build time once the domain is decided. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE = {
  name: "Elias Hakenso",
  role: "Data · AI/ML · Engineering",
  description: "Projects across data, AI/ML and software engineering.",
  url: siteUrl,
  github: "https://github.com/Elias0305Ha",
} as const;
