import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { services } from "@/utils/menu";
import SectionHeading from "@/components/common/SectionHeading";
import FadeInItem from "../common/FadeInItem";

const ServicesSection = () => {
  return (
    <section className="mx-auto px-6 pb-8 bg-background-tertiary">
      {/* <h2 className="text-3xl font-semibold mb-8 text-center">Our Services</h2> */}
      <SectionHeading text="Our Services" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 justify-items-center mt-8">
        {services.map((f) => (
          <ServiceCard service={f} key={f.name} />
        ))}
      </div>
    </section>
  )
};

const ServiceCard = ({ service }) => {
  return (
    // <div className="group relative w-full max-w-[90vw] sm:max-w-[320px] md:max-w-[400px] aspect-[3/2] overflow-hidden bg-neutral-200 rounded-xl shadow-lg hover:scale-[1.03] transition-transform">
  <FadeInItem
    element="div" direction="y" 
    className="group relative w-full max-w-[90vw] sm:max-w-[320px] md:max-w-[400px] aspect-[3/2] overflow-hidden bg-neutral-200 rounded-xl shadow-lg hover:scale-[1.03] transition-transform"
  >
      <div
        style={{
          backgroundImage: `url(${service.imgLocation + "/1.webp"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-black/50 z-0" />
      <motion.div
        className="absolute inset-0 z-10 grid place-content-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <p className="text-2xl sm:text-3xl font-black uppercase text-white text-center px-4"
          style={{
            textShadow: "0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.3)",
          }}>
          {service.name}
        </p>
      </motion.div>
    </FadeInItem>
  );
};

export default ServicesSection;
