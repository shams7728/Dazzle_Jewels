import { ShowcaseConfig } from "@/types";

/**
 * Showcase section configurations for the homepage
 * Each configuration defines the appearance and behavior of a product showcase section
 */
export const showcaseConfigs: Record<string, ShowcaseConfig> = {
  newArrivals: {
    title: "New Arrivals",
    subtitle: "Discover our latest collection of exquisite jewelry pieces",
    badgeText: "Just In",
    badgeIcon: "Sparkles",
    filterKey: "is_new_arrival",
    gradientFrom: "from-blue-900/10",
    gradientTo: "to-blue-500/5",
    accentColor: "blue-500",
  },
  bestSellers: {
    title: "Best Sellers",
    subtitle: "Customer favorites that define timeless elegance",
    badgeText: "Popular",
    badgeIcon: "TrendingUp",
    filterKey: "is_best_seller",
    gradientFrom: "from-purple-900/10",
    gradientTo: "to-purple-500/5",
    accentColor: "purple-500",
  },
  offerItems: {
    title: "Special Offers",
    subtitle: "Exclusive deals on premium jewelry pieces",
    badgeText: "Limited Time",
    badgeIcon: "Tag",
    filterKey: "is_offer_item",
    gradientFrom: "from-red-900/10",
    gradientTo: "to-red-500/5",
    accentColor: "red-500",
  },
};
