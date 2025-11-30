import { Hero3D } from "@/components/home/hero-3d";
import { CouponBanner } from "@/components/home/coupon-banner";
import { AdCarousel } from "@/components/home/ad-carousel";
import { ReelsShowcase } from "@/components/home/reels-showcase";
import { CategoriesShowcase } from "@/components/home/categories-showcase";
import { ShowcaseSection } from "@/components/home/showcase-section";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { showcaseConfigs } from "@/lib/config/showcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero3D />
      <CouponBanner />
      <AdCarousel />
      <ReelsShowcase />
      <CategoriesShowcase />
      <ShowcaseSection config={showcaseConfigs.newArrivals} priority />
      <ShowcaseSection config={showcaseConfigs.bestSellers} />
      <ShowcaseSection config={showcaseConfigs.offerItems} />
      <FeaturedCollection />
    </main>
  );
}
