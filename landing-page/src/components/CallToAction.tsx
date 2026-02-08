
import React from 'react';
interface CTAProps {
  onBookingClick: () => void;
}

const CallToAction: React.FC<CTAProps> = ({ onBookingClick }) => {
  return (
    <section className="py-20 md:py-32 bg-green-900 text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Pronto para fugir da rotina?
        </h2>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-green-100">
          Garanta as melhores datas com a <strong>Garantia de Melhor Preço</strong> reservando direto conosco. Sem taxas extras.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button 
            onClick={onBookingClick}
            className="bg-white text-green-900 font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-green-50 transition duration-300"
          >
            Verificar Disponibilidade
          </button>
          <a 
            href="https://wa.me/5531992272612?text=Olá! Gostaria de saber mais sobre as reservas para o Cabanas na Mata."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-white/10 transition duration-300 flex items-center justify-center"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
