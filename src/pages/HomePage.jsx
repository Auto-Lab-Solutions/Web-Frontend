import { motion } from 'framer-motion';

const sections = [
  { id: 1, color: '#4B5563', title: 'Section 1' },
  { id: 2, color: '#1F1F1F', title: 'Section 2' },
  { id: 3, color: '#4B5563', title: 'Section 3' },
  { id: 4, color: '#1F1F1F', title: 'Section 4' },
  { id: 5, color: '#4B5563', title: 'Section 5' },
  { id: 6, color: '#1F1F1F', title: 'Section 6' },
];

const HomePage = () =>  {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory">
        {sections.map((section) => (
          <motion.section
            key={section.id}
            className="h-screen w-full flex items-center justify-center snap-start"
            style={{ backgroundColor: section.color }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white">{section.title}</h1>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}

export default HomePage;