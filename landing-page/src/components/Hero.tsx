
import React from 'react';
interface HeroProps {
  onBookingClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookingClick }) => {
  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
       {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/cabanas/cbn3-main.png" 
          alt="Vista das Cabanas na Mata" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center h-full flex flex-col justify-end pb-20">
        <div>
          <button 
            onClick={onBookingClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-10 rounded-full text-lg transition duration-300 shadow-lg transform hover:scale-105"
          >
            Reservar Agora
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
