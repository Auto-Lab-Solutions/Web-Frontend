import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * A reusable back arrow component that appears at the top left of the page
 * 
 * @param {Object} props
 * @param {string|function} props.to - Either a URL string or a function to call when clicked
 * @param {string} [props.className] - Additional classes to apply to the component
 */
const BackArrow = ({ to, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof to === 'function') {
      to();
    } else if (typeof to === 'string') {
      navigate(to);
    } else {
      // Default to browser history back if no specific target is provided
      window.history.back();
    }
  };

  return (
    <div className={`relative md:left-12 z-10 top-0 ${className} mb-2`}>
      <motion.button
        onClick={handleClick}
        className="flex items-center justify-center w-6 h-6 rounded-3xl bg-card-primary border border-border-secondary hover:border-highlight-primary hover:text-highlight-primary hover:bg-card-primary/50 text-text-secondary backdrop-blur-sm shadow-sm hover:shadow transition-all duration-200 top-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Go back"
        style={{ width: '40px', height: '40px' }}
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

export default BackArrow;
