import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://dazzlejewels.com";

    // Static routes
    const routes = [
        "",
        "/products",
        "/collections",
        "/about",
        "/reels",
        "/login",
        "/signup",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    }));

    // Fetch products
    const { data: products } = await supabase.from("products").select("id, updated_at");
    const productRoutes = (products || []).map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Fetch categories
    const { data: categories } = await supabase.from("categories").select("slug, updated_at");
    const categoryRoutes = (categories || []).map((category) => ({
        url: `${baseUrl}/collections/${category.slug}`,
        lastModified: new Date(category.updated_at || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...routes, ...productRoutes, ...categoryRoutes];
}
