export const SITE_NAME = "Wall of Art";

export const SITE_DESCRIPTION =
  "Wall of Art, a museum of painting: discover masterpieces from every era.";

/**
 * Absolute origin of the site, used to resolve canonical URLs, the sitemap and
 * social images. Vercel exposes the production domain on every deployment, so
 * links shared from a preview still point to production.
 */
export const SITE_URL = new URL(
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`,
);
