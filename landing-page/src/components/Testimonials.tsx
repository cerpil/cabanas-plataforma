
import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-stone-900 text-white overflow-hidden relative">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="mb-12 flex flex-col items-center">
          <img 
            src="/assets/guest.png" 
            alt="Airbnb Guest Favorite" 
            className="w-32 md:w-40 mb-4 brightness-0 invert"
          />
          <span className="inline-block py-1 px-3 rounded-full bg-yellow-500 text-black text-sm font-bold mb-4 uppercase tracking-wider">
            Guest Favorite ★ 4.9+
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif">
            O que dizem nossos hóspedes
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Histórias reais de quem viveu a experiência Cabanas na Mata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-stone-800 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center mb-4 text-yellow-400 text-xl">
              ★★★★★
            </div>
            <p className="italic text-stone-300 mb-6">
              "O lugar é surreal. A arquitetura da cabana se mistura perfeitamente com a natureza. É o silêncio que a gente não encontra mais na cidade, a apenas 1h de BH."
            </p>
            <div className="font-bold text-white">— Mariana & Pedro</div>
            <div className="text-stone-500 text-sm">Viajaram em Casal</div>
          </div>

          <div className="bg-stone-800 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center mb-4 text-yellow-400 text-xl">
              ★★★★★
            </div>
            <p className="italic text-stone-300 mb-6">
              "Experiência impecável. A cabana é super bem equipada, roupa de cama de hotel 5 estrelas e o ofurô com vista para a serra é indescritível. Vale cada centavo."
            </p>
            <div className="font-bold text-white">— Roberto A.</div>
            <div className="text-stone-500 text-sm">Hóspede Airbnb</div>
          </div>

          <div className="bg-stone-800 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center mb-4 text-yellow-400 text-xl">
              ★★★★★
            </div>
            <p className="italic text-stone-300 mb-6">
              "Já ficamos em vários lugares na Serra da Moeda, mas o Cabanas na Mata tem uma energia diferente. Privacidade total e atendimento super atencioso."
            </p>
            <div className="font-bold text-white">— Fernanda S.</div>
            <div className="text-stone-500 text-sm">Hóspede Recorrente</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
