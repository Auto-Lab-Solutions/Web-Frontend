import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageContainer = ({ children }) => {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      className="page w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default PageContainer;