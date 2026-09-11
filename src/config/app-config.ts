import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "CA Nexus",
  version: packageJson.version,
  copyright: `© ${currentYear}, CA Nexus.`,
  meta: {
    title: "CA Nexus - Connected Practice Management for Chartered Accountants",
    description:
      "CA Nexus is a unified, intelligent practice-management and compliance operations platform for Chartered Accountants and CA firms. It centralizes client servicing, matters, compliance, documents, communication, workflows, billing, audit operations, staff operations, reporting and automation.",
  },
};
