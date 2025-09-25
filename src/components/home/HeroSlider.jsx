"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const mainText = "Auto Lab Solutions";
const subText = "Your trusted partner in automotive excellence";
const slideDuration = 5000; // 5 seconds

const HeroSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, slideDuration);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence>
        {images.map((image, index) =>
          index === current ? (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
      {/* Static text overlay that doesn't animate */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none">
        <h1 className="text-4xl lg:text-6xl font-bold mb-2 text-shadow-lg drop-shadow-2xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {mainText}
        </h1>
        <p className="text-md lg:text-lg max-w-xl font-semibold text-white/90" style={{
          textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 1px 0px #000, 1px 0px 0px #000, 0px -1px 0px #000, -1px 0px 0px #000, 1px 1px 1px rgba(0,0,0,0.4)'
        }}>{subText}</p>
      </div>
    </div>
  );
};

export default HeroSlider;
