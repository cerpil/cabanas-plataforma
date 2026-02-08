import React from 'react';

const SchemaOrg = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Cabanas na Mata",
    "description": "Cabanas exclusivas integradas à natureza na Serra da Moeda, Minas Gerais.",
    "url": "https://www.cabanasnamata.com.br",
    "telephone": "+5531999999999", // Atualizar com telefone real se desejar
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Serra da Moeda",
      "addressRegion": "MG",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-20.2194", // Coordenadas aproximadas da Serra da Moeda
      "longitude": "-44.0294"
    },
    "image": "https://www.cabanasnamata.com.br/og-image.jpg",
    "priceRange": "$$$",
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Vista para a Montanha", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Privacidade Total", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Conforto Premium", "value": true }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SchemaOrg;
