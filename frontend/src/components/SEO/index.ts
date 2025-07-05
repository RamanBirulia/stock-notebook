// SEO Components and Utilities
export { default as SEOHead } from './SEOHead';
export * from './seoUtils';
export {
  SEO_CONSTANTS,
  PAGE_CONFIGS,
  generateSEOConfig,
  generateApplicationStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateArticleStructuredData,
  truncateText,
  generateDynamicTitle,
  generateMetaKeywords,
  formatUrl,
  generateImageUrl,
  extractDomain,
  generateRobotsContent,
} from './seoUtils';
export type { SEOConfig } from './seoUtils';
