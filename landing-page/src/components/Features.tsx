'use client';

import React, { useState } from 'react';
import CabinDetailsModal from './CabinDetailsModal';

interface FeaturesProps {
  onBookingClick: () => void;
}

const Features: React.FC<FeaturesProps> = ({ onBookingClick }) => {
  const [selectedCabin, setSelectedCabin] = useState<any>(null);

  const cabins = [
    {
      id: 1,
      title: 'Cabana na Mata',
      description: 'Experiência intimista e silêncio absoluto. Perfeita para casais que buscam reconexão em meio à mata nativa.',
      fullDescription: 'Localizada no ponto mais reservado da propriedade, a Cabana na Mata oferece uma imersão total na natureza. Com sua famosa banheira de imersão esculpida em rocha (estilo gruta), é o cenário ideal para momentos românticos e descanso profundo.',
      image: '/assets/cabanas/cbn1-raw.png',
      images: [
        '/assets/cabanas/cbn1-1.png',
        '/assets/cabanas/cbn1-2.png',
        '/assets/cabanas/cbn1-3.png',
        '/assets/cabanas/cbn1-main.png'
      ],
      amenities: ['Banheira de Rocha', 'Cama Queen Size', 'Wi-Fi de Alta Velocidade', 'Cozinha Completa', 'Varanda Privativa', 'Lareira']
    },
    {
      id: 2,
      title: 'Cabana sobre a Mata',
      description: 'Relaxe em nosso ofurô exclusivo com uma vista panorâmica de tirar o fôlego da Serra da Moeda.',
      fullDescription: 'Elevada sobre a copa das árvores, esta cabana proporciona a melhor vista da Serra da Moeda. O deck externo conta com um ofurô de madeira com hidromassagem, perfeito para assistir ao pôr do sol ou admirar as estrelas.',
      image: '/assets/cabanas/cbn2-raw.png',
      images: [
        '/assets/cabanas/cbn2-1.jpg',
        '/assets/cabanas/cbn2-2.jpg',
        '/assets/cabanas/cbn2-3.jpg',
        '/assets/cabanas/cbn2-main.jpg'
      ],
      amenities: ['Ofurô Panorâmico', 'Ar Condicionado', 'Smart TV', 'Cafeteira Nespresso', 'Deck de Madeira', 'Roupões Premium']
    },
    {
      id: 3,
      title: 'Cabana Hobbit',
      description: 'Arquitetura moderna e conforto premium. Ideal para quem valoriza design e uma experiëncia lúdica.',
      fullDescription: 'Nossa cabana mais lúdica e espaçosa. Inspirada na arquitetura orgânica, oferece um ambiente acolhedor e surpreendente. Possui uma piscina privativa e um design que integra perfeitamente o rústico com o luxo contemporâneo.',
      image: '/assets/cabanas/cbn3-raw.png',
      images: [
        '/assets/cabanas/cbn3-1.png',
        '/assets/cabanas/cbn3-2.png',
        '/assets/cabanas/cbn3-3.png',
        '/assets/cabanas/cbn3-4.png',
        '/assets/cabanas/cbn3-5.png'
      ],
      amenities: ['Piscina Privativa', 'Espaço Gourmet', 'Até 5 hóspedes', 'Pé direito duplo', 'Design Exclusivo', 'Estacionamento Privado']
    },
  ];

  return (
    <section id="acomodacoes" className="py-20 md:py-32 bg-stone-50 text-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-stone-800 font-serif">
            Nossas Acomodações
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Cada cabana foi desenhada para proporcionar uma experiência única de integração com a natureza.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cabins.map((cabin) => (
            <div key={cabin.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group">
              <div className="aspect-[4/3] overflow-hidden relative cursor-pointer" onClick={() => setSelectedCabin(cabin)}>
                <img 
                  src={cabin.image} 
                  alt={cabin.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-3 text-stone-800">{cabin.title}</h3>
                <p className="text-stone-600 mb-6 flex-1 text-sm leading-relaxed">{cabin.description}</p>
                <button 
                  onClick={() => setSelectedCabin(cabin)}
                  className="w-full border-2 border-stone-800 text-stone-800 font-bold py-3 px-6 rounded-xl hover:bg-stone-800 hover:text-white transition-colors duration-300"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CabinDetailsModal 
        isOpen={!!selectedCabin} 
        onClose={() => setSelectedCabin(null)} 
        cabin={selectedCabin}
        onBookingClick={() => onBookingClick(selectedCabin)}
      />
    </section>
  );
};

export default Features;
