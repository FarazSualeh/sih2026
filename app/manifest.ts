import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillConnect",
    short_name: "SkillConnect",
    description: "A skills-first ecosystem connecting learners, institutions and industry.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f8f5",
    theme_color: "#ef6d52",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}