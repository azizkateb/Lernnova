import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  type = 'website',
  image = 'https://picsum.photos/1200/630?grayscale', // Premium neutral placeholder
  canonicalUrl
}) => {
  const defaultTitle = 'Lernnova';
  const defaultDescription = 'A modern global marketplace for digital services, downloadable products, templates, courses, tools, and premium digital assets.';
  
  const siteTitle = title ? (title.includes('Lernnova') ? title : `${title} | Lernnova`) : `${defaultTitle} | Digital Services & Products Marketplace`;
  const siteDescription = description || defaultDescription;
  const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical Link */}
      {currentUrl && <link rel="canonical" href={currentUrl} />}
    </Helmet>
  );
};

export default SEO;
