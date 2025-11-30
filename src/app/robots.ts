import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/profile/", "/checkout/"],
        },
        sitemap: "https://dazzlejewels.com/sitemap.xml",
    };
}
