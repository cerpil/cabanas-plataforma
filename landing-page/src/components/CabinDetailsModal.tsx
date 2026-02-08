'use client';

import React, { useState } from 'react';
import { X, Check, Instagram, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface CabinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabin: any;
  onBookingClick: () => void;
}

export default function CabinDetailsModal({ isOpen, onClose, cabin, onBookingClick }: CabinDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !cabin) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cabin.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + cabin.images.length) % cabin.images.length);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Lado Esquerdo - Galeria */}
        <div className="md:w-3/5 bg-stone-200 relative group aspect-video md:aspect-auto">
          <img 
            src={cabin.images[currentImageIndex]} 
            alt={cabin.title} 
            className="w-full h-full object-cover"
          />
          
          {cabin.images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {cabin.images.map((_: any, i: number) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-8 rounded-full transition-all ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} 
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lado Direito - Info */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <h2 className="text-3xl font-serif text-stone-900 mb-2">{cabin.title}</h2>
            <p className="text-stone-500 font-medium mb-6 uppercase tracking-widest text-xs">Acomodação Premium</p>
            
            <div className="prose prose-stone prose-sm mb-8">
              <p className="text-stone-700 leading-relaxed text-lg">
                {cabin.fullDescription}
              </p>
            </div>

            <h4 className="font-bold text-stone-900 mb-4 uppercase tracking-tighter text-sm">O que esta cabana oferece:</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
              {cabin.amenities.map((item: string) => (
                <div key={item} className="flex items-center gap-2 text-stone-600 text-sm">
                  <Check size={16} className="text-green-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100 flex flex-col gap-4">
            <button 
              onClick={() => { onClose(); onBookingClick(); }}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              Reservar Agora <ArrowRight size={20} />
            </button>
            <a 
              href="https://instagram.com/cabanasnamata" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-stone-500 hover:text-stone-900 font-bold text-sm transition-colors"
            >
              <Instagram size={18} /> Ver mais fotos no Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
