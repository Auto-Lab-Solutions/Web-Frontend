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
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                  {mainText}
                </h1>
                <p className="text-lg lg:text-2xl max-w-xl">{subText}</p>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSlider;
