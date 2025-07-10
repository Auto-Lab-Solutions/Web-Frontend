import { motion } from "framer-motion";

const SectionHeading = ({ text }) => {
  return (
    <div className="w-full text-center mb-4">
      <motion.h1
              initial={{ y: 48, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 0.75 }}
              className="section-heading"
            >
        {text}
      </motion.h1>
    </div>
  )
}

export default SectionHeading;