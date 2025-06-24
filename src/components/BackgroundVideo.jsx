import { useEffect, useState } from "react";
import videoBg from '../assets/video/main.mp4';
import imageBg from '../assets/main.jpg';

export default function BackgroundVideo({ children }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="overlay">
        <img
            src={imageBg}
            alt="Background"
            className="absolute inset-0 object-cover z-[-1] bg-image-main"
            style={{ opacity: isVideoLoaded && !isMobile ? 0 : 1 }}
        />
    
        {!isMobile && (
            <video
                src={videoBg}
                autoPlay
                loop
                muted
                width="100%"
                height="100%"
                className="absolute inset-0 object-cover z-[-1] bg-video-main"
                onCanPlayThrough={() => setIsVideoLoaded(true)}
            />
        )}

        <div className="content">
            {children}
        </div>
    </div>
  );
}
