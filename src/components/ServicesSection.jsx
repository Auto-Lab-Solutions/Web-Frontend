import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { services } from "../utils/menu";
import SectionHeading from "./SectionHeading";

const ServicesSection = () => {
  const isMobile = useIsMobile();
  return isMobile ? <VerticalScrollList /> : <HorizontalScrollCarousel />;
};

const HorizontalScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-neutral-900">
      <div className="sticky top-20">
        <SectionHeading text="Our Services" />
        <div className="flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-6 px-4 w-max">
          {services.map((service, idx) => (
            <ServiceCard service={service} key={idx} />
          ))}
        </motion.div>
        </div>
      </div>
    </section>
  );
};

const VerticalScrollList = () => {
  return (
    <section className="bg-neutral-900 py-8 px-4">
      <SectionHeading text="Our Services" />
      <div className="flex flex-col gap-6 justify-center items-center">
        {services.map((service, idx) => (
          <ServiceCard service={service} key={idx} />
        ))}
      </div>
    </section>
  );
};

const ServiceCard = ({ service }) => {
  return (
    <div className="group relative h-[350px] w-[300px] sm:w-[400px] md:w-[450px] overflow-hidden bg-neutral-200 rounded-xl shadow-lg">
      {/* Background Image */}
      <div
        style={{
          backgroundImage: `url(${service.imgLocation + "/1.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Text */}
      <motion.div
        className="absolute inset-0 z-10 grid place-content-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <p className="text-3xl sm:text-4xl font-black uppercase text-white text-center px-4"
          style={{
            textShadow: "0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.3)",
          }}>
          {service.name}
        </p>
      </motion.div>
    </div>
  );
};

// Responsive hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};



export default ServicesSection;
