import { ReactLenis } from "lenis/dist/lenis-react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-background-secondary/0 to-background-secondary" />
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
  const navigate = useNavigate();
  
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Desktop Layout */}
      <div className="hidden lg:block h-full">
        {/* Top Left - Google Rating */}
        <ParallaxRatingsDiv
          className="absolute top-24 left-8 w-[600px] lg:w-[500px] xl:w-[600px]"
          start={-200}
          end={-400}
        >
          <div className="bg-card-primary/95 backdrop-blur-sm rounded-xl shadow-2xl border border-border-primary p-6 pointer-events-auto">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⭐</span>
                  <h3 className="text-lg font-bold text-highlight-primary">Highest Rated in Perth</h3>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-white/90 text-sm mb-2 leading-relaxed">
                  Most trusted car inspection service in Perth with over 200+ satisfied customers
                </p>
                <div className="flex items-center gap-4 text-xs text-white/80 lg:hidden xl:flex">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-highlight-primary rounded-full"></span>
                    Registered Service
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-highlight-primary rounded-full"></span>
                    Certified Professionals
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 bg-card-secondary/50 rounded-lg p-3">
                <GoogleRatingCard />
              </div>
            </div>
          </div>
        </ParallaxRatingsDiv>

        {/* Top Right - Inspection Plans */}
        <ParallaxRatingsDiv
          className="absolute top-24 right-8 w-[650px] lg:w-[500px] lg:top-40 xl:w-[650px] xl:top-24"
          start={-200}
          end={-500}
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-2xl border border-blue-500/30 p-6 text-white cursor-pointer hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 pointer-events-auto group">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 bg-white/10 rounded-full p-3">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-100 transition-colors">Professional Inspections</h3>
                <p className="text-white/90 text-sm mb-3 leading-relaxed">Comprehensive pre-purchase & maintenance inspections with detailed reporting</p>
                <div className="flex flex-wrap gap-2 mb-3 lg:hidden xl:flex">
                  <span className="bg-white/15 text-xs px-2 py-1 rounded-full">✓ Detailed Reports</span>
                  <span className="bg-white/15 text-xs px-2 py-1 rounded-full">✓ Expert Analysis</span>
                  <span className="bg-white/15 text-xs px-2 py-1 rounded-full">✓ Peace of Mind</span>
                  <span className="bg-white/15 text-xs px-2 py-1 rounded-full">✓ Cost Savings</span>
                </div>
              </div>
              <button 
                className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex-shrink-0 shadow-lg"
                onClick={() => navigate('/pricing/pre-purchase-inspection')}
              >
                View Plans →
              </button>
            </div>
          </div>
        </ParallaxRatingsDiv>

        {/* Bottom Left - Contact Us */}
        <ParallaxRatingsDiv
          className="absolute top-[62%] left-8 w-[500px] transform -translate-y-1/2 lg:top-[58%] xl:top-[62%]"
          start={-200}
          end={-600}
        >
          <div className="bg-gradient-to-br from-highlight-primary to-green-600 rounded-xl shadow-2xl border border-green-400/30 p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 pointer-events-auto group">
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0 bg-white/15 rounded-full p-3">
                <span className="text-2xl">📞</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-green-100 transition-colors">Need Help?</h3>
                <p className="text-white/90 text-sm leading-relaxed">Get instant support from our certified experts</p>
              </div>
              <button 
                className="bg-white text-green-800 px-5 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex-shrink-0 shadow-lg"
                onClick={() => navigate('/more/contact')}
              >
                Contact Us →
              </button>
            </div>
          </div>
        </ParallaxRatingsDiv>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full">
        {/* Top - Google Rating */}
        <ParallaxRatingsDiv
          className="absolute top-20 left-4 right-4"
          start={-200}
          end={-400}
        >
          <div className="bg-card-primary/95 backdrop-blur-sm rounded-xl shadow-xl border border-border-primary p-3 pt-4 pointer-events-auto">
            <div className="grid grid-cols-2 gap-1">
              {/* Top - Title */}
              <div className="col-span-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg">⭐</span>
                  <h3 className="text-xl font-bold text-highlight-primary">Highest Rated in Perth</h3>
                  <span className="text-lg">⭐</span>
                </div>
                  <div className="flex items-center justify-center">
                  <p className="text-white/90 text-sm leading-relaxed">
                    Most trusted car inspection service in Perth
                  </p>
                </div>
              </div>
              
              {/* Bottom - Google Rating Card */}
              <div className="col-span-2">
                <div className="flex items-center justify-center bg-card-secondary/50 rounded-lg p-2">
                  <GoogleRatingCard displayDescription={false} />
                </div>
              </div>
            </div>
          </div>
        </ParallaxRatingsDiv>

        {/* Middle - Inspection Plans */}
        <ParallaxRatingsDiv
          className="absolute top-[42%] left-4 right-4"
          start={-200}
          end={-500}
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-xl border border-blue-500/30 p-4 pt-3 pb-3 text-white cursor-pointer hover:from-blue-700 hover:to-blue-900 transition-all duration-300 pointer-events-auto group">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-white/10 rounded-full p-2">
                <span className="text-xl">🔍</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-1 text-white group-hover:text-blue-100 transition-colors">Pre-Purchase Car Inspections</h3>
                <div className="grid grid-cols-5 items-center justify-center">
                  <div className="col-span-3">
                    <p className="text-white/95 text-xs leading-relaxed mb-2">Smart inspection today, Peace of mind tomorrow</p>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      className="bg-white text-blue-800 px-3 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-xs flex-shrink-0"
                      onClick={() => navigate('/pricing/pre-purchase-inspection')}
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </ParallaxRatingsDiv>

        {/* Bottom - Contact Us */}
        <ParallaxRatingsDiv
          className="absolute top-[53%] left-4 right-4"
          start={-200}
          end={-600}
        >
          <div className="bg-gradient-to-br from-highlight-primary to-green-600 rounded-xl shadow-xl border border-green-400/30 p-4 pt-3 pb-3 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-300 pointer-events-auto group">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-white/15 rounded-full p-2">
                <span className="text-lg">📞</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-1 text-white group-hover:text-green-100 transition-colors">Need Help?</h3>
                <p className="text-white text-xs leading-relaxed">Get instant support from our professional experts</p>
              </div>
              <button 
                className="bg-white text-green-800 px-3 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-xs flex-shrink-0"
                onClick={() => navigate('/more/contact')}
              >
                Contact Us
              </button>
            </div>
          </div>
        </ParallaxRatingsDiv>
      </div>
    </div>
  );
};

const ParallaxRatingsDiv = ({ className, start, end, children }) => {
  const { scrollY } = useScroll();
  
  const opacity = useTransform(
    scrollY,
    [0, 400],
    [0.8, 0]
  );

  return (
    <motion.div
      className={className}
      style={{ opacity }}
    >
      {children}
    </motion.div>
  );
};

export default HeroSection;
