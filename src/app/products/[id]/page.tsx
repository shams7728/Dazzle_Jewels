import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { ProductVariant } from "@/types";
import ProductDetailClient from "./product-detail-client";
import { notFound } from "next/navigation";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    
    try {
        const { data: product, error } = await supabase
            .from("products")
            .select(`
                *,
                variants:product_variants(*),
                category:categories(*)
            `)
            .eq("id", id)
            .single();

        if (error || !product) {
            return {
                title: "Product Not Found | Dazzle Jewels",
                description: "The product you're looking for could not be found.",
            };
        }

        const effectivePrice = product.discount_price && product.discount_price < product.base_price 
            ? product.discount_price 
            : product.base_price;

        const productImage = product.variants?.[0]?.images?.[0] || "/placeholder.svg";
        const productUrl = `https://dazzlejewels.com/products/${product.id}`;
        
        // Calculate discount percentage
        const discountPercentage = product.discount_price && product.discount_price < product.base_price
            ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
            : 0;

        // Create rich description
        const description = product.description 
            ? `${product.description.substring(0, 155)}...`
            : `Shop ${product.title} at Dazzle Jewels. Premium quality jewelry starting at ₹${effectivePrice}.`;

        // Build title with category if available
        const titleParts = [product.title];
        if (product.category?.name) {
            titleParts.push(product.category.name);
        }
        if (discountPercentage > 0) {
            titleParts.push(`${discountPercentage}% OFF`);
        }
        titleParts.push("Dazzle Jewels");
        const title = titleParts.join(" | ");

        return {
            title,
            description,
            keywords: [
                product.title,
                product.category?.name || "jewelry",
                "premium jewelry",
                "handcrafted jewelry",
                "buy jewelry online",
                ...(product.variants?.map((v: ProductVariant) => v.material).filter(Boolean) || []),
                ...(product.variants?.map((v: ProductVariant) => v.color).filter(Boolean) || []),
            ].join(", "),
            authors: [{ name: "Dazzle Jewels" }],
            creator: "Dazzle Jewels",
            publisher: "Dazzle Jewels",
            alternates: {
                canonical: productUrl,
            },
            openGraph: {
                title,
                description,
                url: productUrl,
                siteName: "Dazzle Jewels",
                images: [
                    {
                        url: productImage,
                        width: 1200,
                        height: 1200,
                        alt: product.title,
                    },
                ],
                locale: "en_US",
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [productImage],
                creator: "@dazzlejewels",
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: "Product | Dazzle Jewels",
            description: "Shop premium jewelry at Dazzle Jewels",
        };
    }
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Fetch product data server-side
    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *,
            variants:product_variants(*),
            category:categories(*)
        `)
        .eq("id", id)
        .single();

    if (error || !product) {
        return notFound();
    }

    // Calculate effective price for structured data
    const effectivePrice = product.discount_price && product.discount_price < product.base_price 
        ? product.discount_price 
        : product.base_price;

    const productImage = product.variants?.[0]?.images?.[0] || "/placeholder.svg";

    // Calculate price valid until date (30 days from now)
    const priceValidUntil = new Date();
    priceValidUntil.setDate(priceValidUntil.getDate() + 30);
    const priceValidUntilStr = priceValidUntil.toISOString().split('T')[0];

    // Generate JSON-LD structured data for product
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description || `Premium ${product.title} from Dazzle Jewels`,
        image: product.variants?.flatMap((v: ProductVariant) => v.images || []) || [productImage],
        brand: {
            "@type": "Brand",
            name: "Dazzle Jewels"
        },
        offers: {
            "@type": "Offer",
            url: `https://dazzlejewels.com/products/${product.id}`,
            priceCurrency: "INR",
            price: effectivePrice,
            priceValidUntil: priceValidUntilStr,
            availability: product.variants?.some((v: ProductVariant) => v.stock_quantity > 0) 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Dazzle Jewels"
            }
        },
        ...(product.category && {
            category: product.category.name
        })
    };

    // Generate breadcrumb structured data
    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://dazzlejewels.com"
            },
            ...(product.category ? [{
                "@type": "ListItem",
                position: 2,
                name: product.category.name,
                item: `https://dazzlejewels.com/collections/${product.category.slug}`
            }] : []),
            {
                "@type": "ListItem",
                position: product.category ? 3 : 2,
                name: product.title,
                item: `https://dazzlejewels.com/products/${product.id}`
            }
        ]
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
            />
            
            {/* Client Component with product data */}
            <ProductDetailClient product={product} />
        </>
    );
}
