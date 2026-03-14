import { MetadataRoute } from "next";

const APP_URL = "https://www.wordyfy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1.0, changeFreq: "daily" as const },
    { path: "/quiz", priority: 0.9, changeFreq: "daily" as const },
    { path: "/vault", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/dashboard", priority: 0.8, changeFreq: "daily" as const },
    { path: "/word-of-the-day", priority: 0.9, changeFreq: "daily" as const },
    { path: "/leaderboard", priority: 0.7, changeFreq: "hourly" as const },
    { path: "/blog", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/signup", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/login", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/learn/gre-vocabulary", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/learn/ielts-vocabulary", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/learn/cat-vocabulary", priority: 0.9, changeFreq: "weekly" as const },
  ];

  const wordPages = [
    "ephemeral", "ubiquitous", "pernicious", "recalcitrant", "sycophant",
    "magnanimous", "perfidious", "loquacious", "equivocal", "tenacious",
    "obsequious", "vociferous", "perspicacious", "impecunious", "obstreperous",
    "sagacious", "truculent", "ebullient",
  ].map((word) => ({
    path: `/word/${word}`,
    priority: 0.7,
    changeFreq: "monthly" as const,
  }));

  return [...staticRoutes, ...wordPages].map(({ path, priority, changeFreq }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }));
}
