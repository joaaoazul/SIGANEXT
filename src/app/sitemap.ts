import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://siga180.pt";
  const now = new Date().toISOString();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/dpa`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/dpia`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/violacao-dados`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
