import React from 'react';
import Hero from '../../components/customer/Hero';
import ServicesSection from '../../components/customer/ServicesSection';
import WhyChooseUs from '../../components/customer/WhyChooseUs';

const Home = () => {
  return (
    <>
      <Hero />
      <ServicesSection />
      <WhyChooseUs />
    </>
  );
};

export default Home;