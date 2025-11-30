export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Dazzle Jewels',
    description: 'Premium handcrafted jewelry collection',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    image: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US', // Update with your country
    },
    sameAs: [
      // Add your social media links
      'https://facebook.com/dazzlejewels',
      'https://instagram.com/dazzlejewels',
      'https://twitter.com/dazzlejewels',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
