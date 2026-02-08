'use client';

import React, { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialCabana, setInitialCabana] = useState<any>(null);

  const openBooking = (cabana?: any) => {
    setInitialCabana(cabana || null);
    setIsBookingOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Hero onBookingClick={() => openBooking()} />
      <Features onBookingClick={(cabana) => openBooking(cabana)} />
      <Testimonials />
      <CallToAction onBookingClick={() => openBooking()} />
      <Footer />
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        initialCabana={initialCabana}
      />
    </div>
  );
}