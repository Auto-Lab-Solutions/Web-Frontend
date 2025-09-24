import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { companyName } from '../../meta/companyData';

export default function WelcomeNotification({ 
  isVisible, 
  onDismiss
}) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(100);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const TOTAL_DURATION = 30000; // 30 seconds

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    if (isVisible) {
      setShow(true);
      setProgressPercentage(100);
      
      // Progress bar countdown
      countdownRef.current = setInterval(() => {
        setProgressPercentage(prev => {
          const decrement = (100 / 30);
          return Math.max(0, prev - decrement);
        });
      }, 1000);
      
      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 300);
      }, TOTAL_DURATION);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    } else {
      setShow(false);
      setProgressPercentage(100);
    }
  }, [isVisible, onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShow(false);
    setTimeout(onDismiss, 300);
  };

  const handleGetStarted = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate('/inspections');
    setShow(false);
    setTimeout(onDismiss, 300);
  };

  if (!show) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      <div className={`transition-all duration-300 ${
        show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Main notification card */}
        <div className="bg-card-primary rounded-xl shadow-2xl overflow-hidden relative border border-border-primary">
          {/* Progress bar */}
          <div className="h-2 sm:h-3 bg-background-secondary">
            <div 
              className="h-full bg-highlight-primary transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 text-center">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-text-primary text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">
                Welcome to {companyName}! 👋
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
                Perth's trusted automotive inspection experts. Get professional pre-purchase inspections and mobile repairs delivered right to your location.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={handleGetStarted}
                className="flex-1 bg-highlight-primary hover:bg-highlight-primary/90 text-text-tertiary px-4 sm:px-6 md:px-8 py-2 md:py-3 lg:py-4 rounded-lg text-sm sm:text-base md:text-lg font-semibold transition-colors shadow-lg"
              >
                View Inspections
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-card-secondary hover:bg-card-secondary/80 text-text-secondary hover:text-text-primary px-4 sm:px-6 md:px-8 py-2 md:py-3 lg:py-4 rounded-lg text-sm sm:text-base md:text-lg font-medium transition-colors border border-border-secondary"
              >
                Later
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-text-secondary hover:text-text-primary transition-colors p-1 md:p-2"
          >
            <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
