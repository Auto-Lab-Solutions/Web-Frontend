import { ReactLenis } from "lenis/dist/lenis-react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import videoBg from "/main.mp4";
import GoogleRatingCard from '@/components/home/GoogleRatingCard';
import HeroSlider from '@/components/home/HeroSlider';

import image1 from "/mobileSlideshow/1.webp";
import image2 from "/mobileSlideshow/2.webp";
import image3 from "/mobileSlideshow/3.webp";
import image4 from "/mobileSlideshow/4.webp";

import image11 from "/desktopSlideshow/1.webp";
import image12 from "/desktopSlideshow/2.webp";
import image13 from "/desktopSlideshow/3.webp";

const mobileSlideshowImages = [ image1, image2, image3, image4 ];
const desktopSlideshowImages = [ image11, image12, image13 ];
const SECTION_HEIGHT = 300;

const HeroSection = () => {
  return (
    <ReactLenis root options={{ lerp: 0.05 }}>
      <div
        style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
        className="relative w-full"
      >
        <CenterBackground />
        <ParallaxImages />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-background-secondary/0 to-background-secondary" />
      </div>
    </ReactLenis>
  );
};

const CenterBackground = () => {
  const { scrollY } = useScroll();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div className="sticky top-0 h-screen w-full" style={{ opacity }}>
      <div className="relative w-full h-full overflow-hidden">
        {!isMobile && (
          <HeroSlider images={desktopSlideshowImages}
          />
        )}
        {isMobile ? (
          <HeroSlider images={mobileSlideshowImages} />
        ) : (
          <video
            src={videoBg}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
            onCanPlayThrough={() => setIsVideoLoaded(true)}
          />
        )}
        
      </div>
    </motion.div>
  );
};




const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] flex lg:justify-between lg:flex-row flex-col lg:gap-4 gap-12">
      <ParallaxRatingsDiv
        className="lg:w-1/3 w-full"
        start={-200}
        end={-400}
      >
        <GoogleRatingCard />
      </ParallaxRatingsDiv>

      <ParallaxRatingsDiv
        className="lg:w-1/3 w-full"
        start={-200}
        end={-500}
      >
        <div className="max-w-xs mx-auto bg-background-primary rounded-lg shadow-md border-3 border-highlight-primary p-4 text-center">
          <div className="flex items-center justify-center mb-2 text-2xl font-bold text-highlight-primary">
            Lowest Prices in Western Australia
          </div>
        </div>
      </ParallaxRatingsDiv>
    </div>
  );
};

const ParallaxRatingsDiv = ({ className, start, end, children }) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.div
      className={`${className} object-cover`}
      ref={ref}
      style={{ transform, opacity }}
    >
      {children}
    </motion.div>
  );
};

export default HeroSection;
