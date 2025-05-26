import { motion } from 'framer-motion';


const SnapSectionContainer = ({ section, children }) => (
    <motion.section
      className="scroll-snap-item"
      style={{ backgroundColor: section.color }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        {children}
    </motion.section>
);

export default SnapSectionContainer;