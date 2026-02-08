
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Cabanas na Mata</h3>
            <p>Serra da Moeda, Minas Gerais</p>
            <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
          </div>
          
          <div className="flex space-x-8">
            <a 
              href="https://instagram.com/cabanasnamata" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition duration-300"
            >
              Instagram
            </a>
            <a 
              href="https://wa.me/5531992272612" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition duration-300"
            >
              WhatsApp
            </a>
            <a href="#" className="hover:text-white transition duration-300">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
