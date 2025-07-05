// SEO utility functions and constants for Stock Notebook
export const SEO_CONSTANTS = {
  SITE_NAME: "Stock Notebook",
  SITE_URL: "https://stock-notebook.com",
  DEFAULT_TITLE: "Stock Portfolio Tracker - Monitor Your Investments",
  DEFAULT_DESCRIPTION:
    "Track your stock portfolio with real-time data, performance analytics, and comprehensive investment monitoring. Free stock portfolio tracker with Yahoo Finance integration.",
  DEFAULT_KEYWORDS:
    "stock portfolio tracker, investment portfolio management, stock tracking app, portfolio analysis tool, investment tracker",
  DEFAULT_IMAGE: "/og-image-1200x630.png",
  TWITTER_HANDLE: "@stocknotebook",
  AUTHOR: "Stock Notebook",
  THEME_COLOR: "#1f2937",
  LOCALE: "en_US",
};

export const PAGE_CONFIGS = {
  HOME: {
    title: "Stock Portfolio Tracker - Monitor Your Investments",
    description:
      "Track your stock portfolio with real-time data, performance analytics, and comprehensive investment monitoring. Free stock portfolio tracker with Yahoo Finance integration.",
    keywords:
      "stock portfolio tracker, investment portfolio management, stock tracking app, portfolio analysis tool, investment tracker",
    url: "/",
  },
  DASHBOARD: {
    title: "Portfolio Dashboard - Real-time Stock Tracking",
    description:
      "Monitor your investment portfolio performance with real-time stock prices, profit/loss analysis, and interactive charts. Your complete portfolio dashboard.",
    keywords:
      "portfolio dashboard, stock tracking, investment monitoring, portfolio performance, real-time stock prices",
    url: "/dashboard",
  },
  PURCHASES: {
    title: "Stock Purchases - Track Your Investment History",
    description:
      "View and manage your stock purchase history with detailed transaction records, commission tracking, and performance analysis.",
    keywords:
      "stock purchases, investment history, transaction tracking, commission tracking, purchase records",
    url: "/purchases",
  },
  ANALYTICS: {
    title: "Portfolio Analytics - Investment Performance Analysis",
    description:
      "Analyze your investment portfolio performance with detailed charts, profit/loss calculations, and comprehensive financial metrics.",
    keywords:
      "portfolio analytics, investment analysis, performance metrics, profit loss analysis, financial charts",
    url: "/analytics",
  },
  LOGIN: {
    title: "Login - Access Your Portfolio",
    description:
      "Secure login to access your stock portfolio tracker and monitor your investment performance.",
    keywords:
      "login, portfolio access, secure login, investment tracking login",
    url: "/login",
    noIndex: true,
  },
  REGISTER: {
    title: "Register - Create Your Portfolio Account",
    description:
      "Create a free account to start tracking your stock portfolio and monitor your investment performance.",
    keywords:
      "register, create account, portfolio signup, investment tracking signup",
    url: "/register",
  },
  ABOUT: {
    title: "About - Stock Portfolio Tracking Made Simple",
    description:
      "Learn about Stock Notebook, the comprehensive portfolio tracking application built for investors who want real-time data and performance insights.",
    keywords:
      "about, portfolio tracker, investment app, stock tracking software, about stock notebook",
    url: "/about",
  },
  FEATURES: {
    title: "Features - Comprehensive Portfolio Tracking Tools",
    description:
      "Discover powerful portfolio tracking features including real-time stock prices, commission tracking, profit/loss analysis, and interactive price charts.",
    keywords:
      "features, portfolio tracking features, stock tracking tools, investment monitoring features",
    url: "/features",
  },
  HELP: {
    title: "Help & Support - Portfolio Tracking Guide",
    description:
      "Get help with using Stock Notebook. Find answers to common questions about portfolio tracking, stock data, and investment monitoring.",
    keywords:
      "help, support, portfolio tracking help, stock tracker guide, investment tracking support",
    url: "/help",
  },
  CONTACT: {
    title: "Contact Us - Get Support",
    description:
      "Contact Stock Notebook support team for help with your portfolio tracking needs or technical assistance.",
    keywords:
      "contact, support, help, portfolio tracking support, customer service",
    url: "/contact",
  },
  PRIVACY: {
    title: "Privacy Policy - Your Data Protection",
    description:
      "Learn how Stock Notebook protects your personal information and investment data. Read our comprehensive privacy policy.",
    keywords:
      "privacy policy, data protection, privacy, security, investment data privacy",
    url: "/privacy",
  },
  TERMS: {
    title: "Terms of Service - Usage Agreement",
    description:
      "Read the terms of service for using Stock Notebook portfolio tracking application and investment monitoring services.",
    keywords:
      "terms of service, usage agreement, terms, legal, portfolio tracker terms",
    url: "/terms",
  },
  NOT_FOUND: {
    title: "Page Not Found (404)",
    description:
      "The page you are looking for could not be found. Return to Stock Notebook dashboard to continue tracking your portfolio.",
    keywords: "404, page not found, stock tracker, portfolio dashboard",
    url: "/404",
    noIndex: true,
  },
  SERVER_ERROR: {
    title: "Server Error (500)",
    description:
      "We are experiencing technical difficulties. Our team is working to resolve the issue. Please try again later.",
    keywords: "500, server error, technical difficulties, stock tracker",
    url: "/500",
    noIndex: true,
  },
};

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  twitterHandle?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}

/**
 * Generate SEO configuration for a specific page
 */
export const generateSEOConfig = (
  pageKey: keyof typeof PAGE_CONFIGS,
  overrides: Partial<SEOConfig> = {},
): SEOConfig => {
  const pageConfig = PAGE_CONFIGS[pageKey];

  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    image: SEO_CONSTANTS.DEFAULT_IMAGE,
    url: `${SEO_CONSTANTS.SITE_URL}${pageConfig.url}`,
    type: "website",
    author: SEO_CONSTANTS.AUTHOR,
    siteName: SEO_CONSTANTS.SITE_NAME,
    twitterHandle: SEO_CONSTANTS.TWITTER_HANDLE,
    noIndex: false,
    canonicalUrl: `${SEO_CONSTANTS.SITE_URL}${pageConfig.url}`,
    ...overrides,
  };
};

/**
 * Generate structured data for the application
 */
export const generateApplicationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SEO_CONSTANTS.SITE_NAME,
  description: SEO_CONSTANTS.DEFAULT_DESCRIPTION,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: SEO_CONSTANTS.AUTHOR,
  },
  url: SEO_CONSTANTS.SITE_URL,
  screenshot: `${SEO_CONSTANTS.SITE_URL}/preview.png`,
  featureList: [
    "Real-time stock price tracking",
    "Portfolio performance analytics",
    "Investment monitoring",
    "Commission tracking",
    "Profit/loss analysis",
    "Interactive price charts",
    "Symbol search",
    "Purchase history tracking",
  ],
  requirements: "Web browser with JavaScript enabled",
  browserRequirements:
    "Requires JavaScript. Supported browsers: Chrome, Firefox, Safari, Edge",
  permissions: "None",
  storageRequirements: "Local storage for user preferences",
});

/**
 * Generate structured data for organization
 */
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_CONSTANTS.SITE_NAME,
  description: SEO_CONSTANTS.DEFAULT_DESCRIPTION,
  url: SEO_CONSTANTS.SITE_URL,
  logo: `${SEO_CONSTANTS.SITE_URL}/logo-512x512.png`,
  sameAs: [
    // Add social media links when available
    // 'https://twitter.com/stocknotebook',
    // 'https://github.com/stocknotebook',
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    url: `${SEO_CONSTANTS.SITE_URL}/contact`,
  },
});

/**
 * Generate structured data for breadcrumb navigation
 */
export const generateBreadcrumbStructuredData = (
  breadcrumbs: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: breadcrumb.name,
    item: `${SEO_CONSTANTS.SITE_URL}${breadcrumb.url}`,
  })),
});

/**
 * Generate structured data for FAQ pages
 */
export const generateFAQStructuredData = (
  faqs: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

/**
 * Generate structured data for articles/blog posts
 */
export const generateArticleStructuredData = (article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  author: {
    "@type": "Person",
    name: article.author,
  },
  publisher: {
    "@type": "Organization",
    name: SEO_CONSTANTS.SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SEO_CONSTANTS.SITE_URL}/logo-512x512.png`,
    },
  },
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  image: article.image
    ? `${SEO_CONSTANTS.SITE_URL}${article.image}`
    : `${SEO_CONSTANTS.SITE_URL}${SEO_CONSTANTS.DEFAULT_IMAGE}`,
  url: `${SEO_CONSTANTS.SITE_URL}${article.url}`,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SEO_CONSTANTS.SITE_URL}${article.url}`,
  },
});

/**
 * Truncate text to a specific length for meta descriptions
 */
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + "...";
};

/**
 * Generate dynamic title based on page content
 */
export const generateDynamicTitle = (
  baseTitles: string[],
  siteName: string = SEO_CONSTANTS.SITE_NAME,
): string => {
  const title = baseTitles.filter(Boolean).join(" - ");
  return title.includes(siteName) ? title : `${title} | ${siteName}`;
};

/**
 * Generate meta keywords from an array of keywords
 */
export const generateMetaKeywords = (keywords: string[]): string => {
  return keywords.join(", ");
};

/**
 * Validate and format URL
 */
export const formatUrl = (
  url: string,
  baseUrl: string = SEO_CONSTANTS.SITE_URL,
): string => {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

/**
 * Generate image URL with fallback
 */
export const generateImageUrl = (
  imagePath?: string,
  fallback: string = SEO_CONSTANTS.DEFAULT_IMAGE,
): string => {
  if (!imagePath) return `${SEO_CONSTANTS.SITE_URL}${fallback}`;
  if (imagePath.startsWith("http")) return imagePath;
  return `${SEO_CONSTANTS.SITE_URL}${imagePath}`;
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return SEO_CONSTANTS.SITE_URL.replace("https://", "").replace(
      "http://",
      "",
    );
  }
};

/**
 * Generate robots meta content
 */
export const generateRobotsContent = (
  noIndex: boolean = false,
  noFollow: boolean = false,
): string => {
  const robots = [];
  if (noIndex) robots.push("noindex");
  else robots.push("index");

  if (noFollow) robots.push("nofollow");
  else robots.push("follow");

  return robots.join(", ");
};
