import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
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

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Stock Portfolio Tracker - Monitor Your Investments',
  description = 'Track your stock portfolio with real-time data, performance analytics, and comprehensive investment monitoring. Free stock portfolio tracker with Yahoo Finance integration.',
  keywords = 'stock portfolio tracker, investment portfolio management, stock tracking app, portfolio analysis tool, investment tracker',
  image = '/og-image-1200x630.png',
  url = 'https://stock-notebook.com',
  type = 'website',
  author = 'Stock Notebook',
  publishedTime,
  modifiedTime,
  siteName = 'Stock Notebook',
  twitterHandle = '@stocknotebook',
  noIndex = false,
  canonicalUrl,
  structuredData,
}) => {
  const fullTitle = title.includes('Stock Notebook') ? title : `${title} | Stock Notebook`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const fullUrl = canonicalUrl || url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* OpenGraph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Article specific tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {/* Additional Meta Tags */}
      <meta name="application-name" content="Stock Notebook" />
      <meta name="apple-mobile-web-app-title" content="Stock Notebook" />
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
