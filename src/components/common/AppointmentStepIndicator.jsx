import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

/**
 * AppointmentStepIndicator - Shows the current step in the appointment booking process
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentStep - The current step (1-based index)
 * @param {boolean} props.showLabels - Whether to show step labels
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered component
 */
const AppointmentStepIndicator = ({ currentStep = 1, showLabels = true, className = '' }) => {
  const steps = [
    { id: 1, name: 'Select Plan', path: '/pricing' },
    { id: 2, name: 'Enter Details', path: '/booking-form' },
    { id: 3, name: 'Choose Time', path: '/slot-selection' },
    { id: 4, name: 'Confirmation', path: '/booking-confirmation' },
  ];

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1 bg-background-tertiary rounded-full w-full"></div>
          <div 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1 bg-highlight-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 mb-2 transition-all duration-300
                    ${currentStep > step.id 
                      ? 'bg-highlight-primary text-black font-bold'
                      : currentStep === step.id 
                        ? 'border-2 border-highlight-primary bg-card-primary text-highlight-primary' 
                        : 'border-2 border-background-tertiary bg-card-primary text-text-secondary'
                    }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </motion.div>
                
                {showLabels && (
                  <motion.span 
                    className={`text-xs font-medium ${
                      currentStep >= step.id ? 'text-highlight-primary' : 'text-text-secondary'
                    }`}
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: currentStep === step.id ? 1 : 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.name}
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStepIndicator;
