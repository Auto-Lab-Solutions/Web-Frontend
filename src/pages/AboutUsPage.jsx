import { motion } from 'framer-motion';

const AboutUsPage = () => {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <h1>About Page</h1>
    </motion.div>
  );
}

export default AboutUsPage;