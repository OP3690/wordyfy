import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/vault/", "/_next/", "/admin/"],
      },
    ],
    sitemap: "https://www.wordyfy.com/sitemap.xml",
    host: "https://www.wordyfy.com",
  };
}
