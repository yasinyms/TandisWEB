import React, { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schemaData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schemaData,
}) => {
  useEffect(() => {
    const defaultTitle = 'سوپراپلیکیشن تندیس | خدمات در محل، تعمیرات و امداد خودرو (tandiis.com)';
    const defaultDesc =
      'سوپراپلیکیشن تندیس (tandiis.com)؛ سامانه هوشمند سفارش آنلاین خدمات در محل، تعمیرات تخصصی لوازم خانگی، تاسیسات، امداد خودرو با ضمانت رسمی در سراسر ایران.';
    const defaultCanonical = 'https://tandiis.com/';
    const defaultImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';

    const activeTitle = title || defaultTitle;
    const activeDesc = description || defaultDesc;
    const activeCanonical = canonicalUrl || defaultCanonical;
    const activeImage = ogImage || defaultImage;

    document.title = activeTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', activeDesc);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', activeCanonical);

    // OpenGraph
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', activeTitle);
    setOgTag('og:description', activeDesc);
    setOgTag('og:url', activeCanonical);
    setOgTag('og:type', ogType);
    setOgTag('og:image', activeImage);
    setOgTag('og:site_name', 'تندیس (tandiis.com)');

    // Schema.org JSON-LD
    let scriptTag = document.querySelector('#tandis-dynamic-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('id', 'tandis-dynamic-json-ld');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    const defaultSchema = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'تندیس',
        alternateName: ['Tandiis', 'تندیس خدمات در محل', 'tandiis.com'],
        url: 'https://tandiis.com',
        logo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+98-9307327975',
          contactType: 'customer support',
          areaServed: 'IR',
          availableLanguage: ['Persian', 'English']
        },
        sameAs: ['https://tandiis.com']
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://tandiis.com',
        name: 'تندیس',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://tandiis.com/services?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ];

    const finalSchema = schemaData ? (Array.isArray(schemaData) ? schemaData : [schemaData]) : defaultSchema;
    scriptTag.textContent = JSON.stringify(finalSchema);
  }, [title, description, canonicalUrl, ogImage, ogType, schemaData]);

  return null;
};
