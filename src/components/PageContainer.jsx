import { motion } from 'framer-motion';


const PageContainer = ({ children }) => (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5}}
    >
        {children}
    </motion.div>
);

export default PageContainer;